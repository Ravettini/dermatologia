"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Msg = { role: "user" | "model"; content: string };

export function ChatWidget({
  siteName,
  welcome,
  whatsappNumber,
}: {
  siteName: string;
  welcome: string;
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadDni, setLeadDni] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const key = "derma_visitor_id";
    const existing = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (existing) setVisitorId(existing);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "model", content: welcome }]);
    }
  }, [open, welcome, messages.length]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setTyping(true);
    try {
      const res = await apiFetch<{ visitorId: string; reply: string }>("/api/public/chat", {
        method: "POST",
        json: { message: text, visitorId: visitorId ?? undefined },
      });
      if (!visitorId) {
        setVisitorId(res.visitorId);
        window.localStorage.setItem("derma_visitor_id", res.visitorId);
      }
      setMessages((m) => [...m, { role: "model", content: res.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos responder ahora.");
    } finally {
      setTyping(false);
    }
  }

  async function sendLead() {
    if (!visitorId) {
      setError("Enviá un mensaje primero para iniciar la conversación.");
      return;
    }
    setError(null);
    if (!leadName.trim() || leadName.trim().length < 2) {
      setError("Indicá nombre y apellido (mínimo 2 caracteres).");
      return;
    }
    if (!leadDni.trim() || leadDni.replace(/\D/g, "").length < 7) {
      setError("Indicá un DNI o documento válido (al menos 7 dígitos).");
      return;
    }
    if (!leadEmail.trim() && !leadPhone.trim()) {
      setError("Indicá al menos un email o un teléfono.");
      return;
    }
    try {
      await apiFetch("/api/public/chat/lead", {
        method: "POST",
        json: {
          visitorId,
          name: leadName,
          dni: leadDni.trim(),
          email: leadEmail || undefined,
          phone: leadPhone || undefined,
        },
      });
      setShowLead(false);
      setMessages((m) => [
        ...m,
        {
          role: "model",
          content: "Gracias. Registramos tus datos y el equipo te contactará a la brevedad.",
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar tus datos.");
    }
  }

  const waHref = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  return (
    <>
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[60] flex w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col items-stretch gap-2 sm:bottom-8 sm:right-8 sm:w-auto sm:max-w-none sm:items-end sm:gap-3">
        {open && (
          <div className="flex h-[min(520px,calc(100dvh-7rem))] w-full max-w-[min(380px,100%)] flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 shadow-soft backdrop-blur sm:h-[min(560px,80vh)] sm:max-w-[min(380px,92vw)]">
            <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-high px-4 py-3">
              <div>
                <p className="font-headline text-lg">{siteName}</p>
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
                  Asistente virtual
                </p>
              </div>
              <button
                type="button"
                className="material-symbols-outlined text-on-surface-variant"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                close
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <div className="rounded-lg bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
                  Este asistente no diagnostica ni prescribe. Ante urgencias, consultá en persona o por WhatsApp.
                </div>
                <div className="rounded-lg border border-secondary/25 bg-secondary/5 px-3 py-2 text-[11px] leading-snug text-on-surface">
                  <strong>Para que el equipo reciba tu solicitud</strong> (nombre, DNI, contacto) tenés que usar el botón{" "}
                  <strong>Mis datos</strong> abajo y enviar el formulario. Escribir solo en el chat{" "}
                  <strong>no guarda</strong> datos en el centro.
                </div>
              </div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-on-primary-container text-surface"
                      : "mr-auto bg-surface-container-high text-on-surface"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {typing && (
                <div className="mr-auto rounded-2xl bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
                  Escribiendo…
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-2 py-2 sm:px-3 sm:py-3">
              <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
                <Link
                  href="/#reservar"
                  className="rounded-full border border-outline-variant/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-on-surface sm:px-3 sm:text-[11px]"
                >
                  Reservar
                </Link>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-secondary/40 px-2.5 py-1 text-[10px] uppercase tracking-wide text-secondary sm:px-3 sm:text-[11px]"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setShowLead((s) => !s)}
                  className="rounded-full border border-outline-variant/50 px-2.5 py-1 text-[10px] uppercase tracking-wide sm:px-3 sm:text-[11px]"
                >
                  Mis datos
                </button>
              </div>
              {showLead && (
                <div className="mb-3 space-y-2 rounded-lg bg-surface-container-high p-3 text-xs">
                  <p className="text-on-surface-variant">
                    DNI obligatorio (mín. 7 dígitos) y al menos email o teléfono, para registrar el contacto.
                  </p>
                  <input
                    className="w-full rounded border border-outline-variant/40 bg-transparent px-2 py-1"
                    placeholder="Nombre y apellido"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                  />
                  <input
                    className="w-full rounded border border-outline-variant/40 bg-transparent px-2 py-1"
                    placeholder="DNI o documento"
                    autoComplete="off"
                    value={leadDni}
                    onChange={(e) => setLeadDni(e.target.value)}
                  />
                  <input
                    className="w-full rounded border border-outline-variant/40 bg-transparent px-2 py-1"
                    placeholder="Email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                  <input
                    className="w-full rounded border border-outline-variant/40 bg-transparent px-2 py-1"
                    placeholder="Teléfono"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => void sendLead()}
                    className="w-full rounded bg-on-primary-container py-2 text-[11px] uppercase tracking-widest text-surface"
                  >
                    Enviar datos
                  </button>
                </div>
              )}
              {error && <p className="mb-2 text-xs text-red-700">{error}</p>}
              <div className="flex min-h-0 gap-1.5 sm:gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-outline-variant/40 bg-transparent px-2.5 py-2 text-[13px] outline-none focus:border-secondary sm:px-3 sm:text-sm"
                  placeholder="Mensaje…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  className="shrink-0 rounded-lg bg-on-primary-container px-2.5 py-2 font-label text-[10px] uppercase tracking-widest text-surface sm:px-3 sm:text-xs"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-on-primary-container text-surface shadow-soft transition hover:opacity-95 sm:h-auto sm:w-auto sm:gap-3 sm:px-4 sm:py-3"
          aria-label={open ? "Cerrar chat" : "Abrir chat"}
        >
          <span className="material-symbols-outlined text-[26px] sm:text-2xl">chat_bubble</span>
          <span className="hidden font-label text-xs uppercase tracking-widest sm:inline">¿Dudas?</span>
        </button>
      </div>
    </>
  );
}
