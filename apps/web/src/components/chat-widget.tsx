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
    try {
      await apiFetch("/api/public/chat/lead", {
        method: "POST",
        json: {
          visitorId,
          name: leadName,
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
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-3">
        {open && (
          <div className="flex h-[min(560px,80vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 shadow-soft backdrop-blur">
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
              <div className="rounded-lg bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
                Este asistente no diagnostica ni prescribe. Ante urgencias, consultá en persona o por WhatsApp.
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
            <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-3 py-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <Link
                  href="/#reservar"
                  className="rounded-full border border-outline-variant/50 px-3 py-1 text-[11px] uppercase tracking-wide text-on-surface"
                >
                  Reservar consulta
                </Link>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-secondary/40 px-3 py-1 text-[11px] uppercase tracking-wide text-secondary"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setShowLead((s) => !s)}
                  className="rounded-full border border-outline-variant/50 px-3 py-1 text-[11px] uppercase tracking-wide"
                >
                  Dejar mis datos
                </button>
              </div>
              {showLead && (
                <div className="mb-3 space-y-2 rounded-lg bg-surface-container-high p-3 text-xs">
                  <input
                    className="w-full rounded border border-outline-variant/40 bg-transparent px-2 py-1"
                    placeholder="Nombre"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
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
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-outline-variant/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-secondary"
                  placeholder="Escribí tu mensaje…"
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
                  className="rounded-lg bg-on-primary-container px-3 py-2 font-label text-xs uppercase tracking-widest text-surface"
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
          className="flex items-center gap-3 rounded-full bg-on-primary-container px-4 py-3 text-surface shadow-soft transition hover:opacity-95"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="hidden font-label text-xs uppercase tracking-widest sm:inline">¿Dudas?</span>
        </button>
      </div>
    </>
  );
}
