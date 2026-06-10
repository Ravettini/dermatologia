"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { instagramProfileUrl } from "@/lib/social-links";

type NavInternal = { label: string; href: string; external?: false };
type NavExternal = { label: string; href: string; external: true };
type NavItem = NavInternal | NavExternal;

const nav: NavItem[] = [
  { href: "/#inicio", label: "Inicio" },
  { href: instagramProfileUrl, label: "Seguinos en Instagram", external: true },
  { href: "/#tratamientos", label: "Tratamientos" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#consultorio", label: "Consultorio" },
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
    <nav className="fixed top-0 z-50 w-full max-w-[100vw] overflow-x-hidden bg-white/95 px-4 py-2 backdrop-blur-md sm:px-6 md:px-12 md:py-3">
      <div className="relative mx-auto flex max-w-[1600px] items-center">
        <div className="flex min-w-0 flex-1 justify-start">
          <Link
            href="/"
            className="flex shrink-0 items-center py-0.5"
            onClick={() => setMenuOpen(false)}
          >
            <span className="relative block h-[3.3125rem] w-[198px] sm:h-[3.875rem] sm:w-[237px] md:h-[4.375rem] md:w-[275px] lg:h-[4.9375rem] lg:w-[308px]">
              <Image
                src="/branding/logo-tod.png"
                alt={siteName}
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 265px, 330px"
                priority
              />
            </span>
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-4 lg:gap-6 xl:gap-7">
            {nav.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-label text-lg tracking-tight text-on-surface/60 transition-colors hover:text-secondary"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 font-label text-lg tracking-tight text-on-surface/60 transition-colors hover:text-secondary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/#reservar"
            className="hidden max-w-[min(100%,12.5rem)] min-h-[44px] shrink-0 touch-manipulation items-center justify-center bg-on-primary-container px-[clamp(0.7rem,1.8vw,1.25rem)] py-[clamp(0.45rem,1vw,0.65rem)] text-center font-label text-[clamp(11px,0.6875rem+0.35vw,13.2px)] uppercase leading-snug tracking-[0.16em] text-surface [-webkit-tap-highlight-color:transparent] transition-opacity hover:opacity-90 active:opacity-95 md:inline-flex md:min-h-0 md:py-2"
            onClick={() => setMenuOpen(false)}
          >
            Solicitar turno
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
        <div className="border-t border-outline-variant/30 bg-white shadow-lg md:hidden">
          <div className="mx-auto flex max-h-[min(70vh,calc(100dvh-5rem))] max-w-[1600px] flex-col gap-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href="/#reservar"
              className="mb-2 flex min-h-[48px] w-full touch-manipulation items-center justify-center bg-on-primary-container px-4 py-3 font-label text-xs uppercase tracking-widest text-surface transition-opacity hover:opacity-90 active:opacity-95"
              onClick={() => setMenuOpen(false)}
            >
              Solicitar turno
            </Link>
            {nav.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-3 font-label text-lg tracking-wide text-on-surface/80 transition-colors hover:bg-surface-container-high hover:text-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 font-label text-lg tracking-wide text-on-surface/80 transition-colors hover:bg-surface-container-high hover:text-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
