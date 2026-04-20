"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#tratamientos", label: "Tratamientos" },
  { href: "/#dermatologia", label: "Dermatología" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader({ siteName }: { siteName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 z-50 w-full max-w-[100vw] overflow-x-hidden bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6 md:px-12 md:py-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
        <Link
          href="/"
          className="min-w-0 truncate font-headline text-lg tracking-tighter text-on-surface sm:text-xl md:text-2xl"
          onClick={() => setMenuOpen(false)}
        >
          {siteName}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-label text-sm tracking-tight text-on-surface/60 transition-colors hover:text-secondary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/reservar"
            className="bg-on-primary-container px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-surface transition-opacity hover:opacity-90 sm:px-5 sm:text-xs sm:tracking-widest"
            onClick={() => setMenuOpen(false)}
          >
            Pedir turno
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded border border-outline-variant/50 text-on-surface md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="material-symbols-outlined text-2xl">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-outline-variant/30 bg-surface shadow-lg md:hidden">
          <div className="mx-auto flex max-h-[min(70vh,calc(100dvh-5rem))] max-w-[1600px] flex-col gap-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 font-label text-sm tracking-wide text-on-surface/80 transition-colors hover:bg-surface-container-high hover:text-secondary"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
