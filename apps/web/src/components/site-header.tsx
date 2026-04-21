"use client";

import Image from "next/image";
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
    <nav className="fixed top-0 z-50 w-full max-w-[100vw] overflow-x-hidden bg-surface/90 px-4 py-2 backdrop-blur-md sm:px-6 md:px-12 md:py-3">
      <div className="relative mx-auto flex max-w-[1600px] items-center">
        <div className="flex min-w-0 flex-1 justify-start">
          <Link
            href="/"
            className="flex shrink-0 items-center py-0.5"
            onClick={() => setMenuOpen(false)}
          >
            <span className="relative block h-12 w-[180px] sm:h-14 sm:w-[215px] md:h-16 md:w-[250px] lg:h-[4.5rem] lg:w-[280px]">
              <Image
                src="/branding/logo-tod.png"
                alt={siteName}
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 300px"
                priority
              />
            </span>
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-4 lg:gap-6 xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 font-label text-sm tracking-tight text-on-surface/60 transition-colors hover:text-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
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
