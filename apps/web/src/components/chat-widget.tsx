"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatMessageContent } from "@/components/chat-message-content";
import { apiFetch } from "@/lib/api";
import { BEKANDU_TURNOS_URL } from "@/lib/bekandu-turnos";

type Msg = { role: "user" | "model"; content: string };

const DEFAULT_LEGAL_DISCLAIMER =
  "La información del sitio es educativa y no reemplaza la consulta médica. Los resultados varían según cada persona.";

export function ChatWidget({
  siteName,
  welcome,
  whatsappNumber,
  disclaimer = DEFAULT_LEGAL_DISCLAIMER,
}: {
  siteName: string;
  welcome: string;
  whatsappNumber: string;
  disclaimer?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const waHref = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  return (
    <>
      {/* w-auto + items-end: en móvil no ocupar todo el viewport (antes bloqueaba toques sobre el FAB de WhatsApp a la izquierda). */}
      <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] right-[max(0.75rem,env(safe-area-inset-right))] z-[60] flex w-auto max-w-none flex-col items-end gap-2 sm:bottom-8 sm:right-8 sm:gap-3">
        {open && (
          <div className="flex h-[min(520px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 shadow-soft backdrop-blur sm:h-[min(560px,80vh)] sm:w-[min(380px,92vw)]">
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
                  Para reservar usamos la agenda en{" "}
                  <a
                    href={BEKANDU_TURNOS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-secondary underline decoration-secondary/40 underline-offset-2"
                  >
                    Bekandu
                  </a>
                  . Si necesitás una mano o algo no cargó bien, WhatsApp suele ser lo más rápido.
                </div>
                {disclaimer ? (
                  <p className="rounded-lg bg-surface-container-high/90 px-3 py-2 text-[10px] leading-relaxed text-on-surface-variant">
                    {disclaimer}
                  </p>
                ) : null}
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
                  <ChatMessageContent
                    text={m.content}
                    linkClassName={
                      m.role === "user"
                        ? "underline decoration-surface/50 underline-offset-2"
                        : "font-medium text-secondary underline decoration-secondary/40 underline-offset-2"
                    }
                  />
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
                <a
                  href={BEKANDU_TURNOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-outline-variant/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-on-surface sm:px-3 sm:text-[11px]"
                >
                  Turnos online
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-secondary/40 px-2.5 py-1 text-[10px] uppercase tracking-wide text-secondary sm:px-3 sm:text-[11px]"
                >
                  WhatsApp
                </a>
                <Link
                  href="/#contacto"
                  className="rounded-full border border-outline-variant/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-on-surface sm:px-3 sm:text-[11px]"
                >
                  Contacto
                </Link>
              </div>
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
          className="fab fab--chat group ml-auto shrink-0 touch-manipulation rounded-full bg-on-primary-container font-label uppercase tracking-wide text-surface shadow-soft"
          aria-label={open ? "Cerrar chat" : "¿En qué te podemos ayudar?"}
        >
          <span className="fab__label text-right leading-snug">{open ? "Cerrar" : "¿En qué te podemos ayudar?"}</span>
          <span className="fab__icon" aria-hidden>
            <span className="material-symbols-outlined">{open ? "close" : "smart_toy"}</span>
          </span>
        </button>
      </div>
    </>
  );
}
