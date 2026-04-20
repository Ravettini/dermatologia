"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const links = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/bookings", label: "Reservas", icon: "event" },
  { href: "/admin/availability", label: "Calendario y turnos", icon: "calendar_month" },
  { href: "/admin/leads", label: "Contactos", icon: "group" },
  { href: "/admin/professionals", label: "Profesionales", icon: "badge" },
  { href: "/admin/treatments", label: "Tratamientos", icon: "spa" },
  { href: "/admin/chat", label: "Chat", icon: "chat" },
  { href: "/admin/settings", label: "Configuración", icon: "settings" },
] as const;

function adminPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const sorted = [...links]
    .filter((l) => l.href !== "/admin")
    .sort((a, b) => b.href.length - a.href.length);
  const hit = sorted.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`));
  return hit?.label ?? "Panel";
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {links.map((l) => {
        const active =
          l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
              active ? "bg-sky-500/20 font-semibold text-white ring-1 ring-sky-400/40" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[20px] text-sky-300">{l.icon}</span>
            <span className="min-w-0">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState<boolean | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        await apiFetch<{ ok: boolean }>("/api/admin/auth/me");
        setOk(true);
      } catch {
        setOk(false);
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  async function logout() {
    await apiFetch("/api/admin/auth/logout", { method: "POST" });
    setNavOpen(false);
    router.replace("/admin/login");
  }

  if (ok === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-sm text-slate-600">
        Verificando sesión…
      </div>
    );
  }

  if (!ok) return null;

  const pageTitle = adminPageTitle(pathname);

  return (
    <div className="min-h-dvh max-w-[100vw] overflow-x-hidden bg-slate-100 text-slate-900">
      <header
        className="fixed left-0 right-0 top-0 z-40 flex items-center gap-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 to-slate-950 px-3 py-2 shadow-lg md:hidden"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}
      >
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white"
          aria-expanded={navOpen}
          aria-label={navOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className="material-symbols-outlined text-2xl">{navOpen ? "close" : "menu"}</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-headline text-base text-white">{pageTitle}</div>
          <div className="truncate text-[10px] uppercase tracking-widest text-slate-400">Panel clínica</div>
        </div>
      </header>

      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navegación">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
            onClick={() => setNavOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 flex h-full w-[min(300px,88vw)] flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-6 text-slate-100 shadow-2xl"
            style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))" }}
          >
            <div className="mb-6 shrink-0">
              <div className="font-headline text-lg text-white">Panel clínica</div>
              <p className="mt-1 text-xs text-slate-400">Gestión de turnos y disponibilidad</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
              <NavLinks pathname={pathname} onNavigate={() => setNavOpen(false)} />
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-auto flex w-full shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-slate-300 transition hover:bg-white/5"
              style={{ marginBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Salir
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-h-dvh md:grid md:min-h-0 md:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-dvh w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-slate-100 shadow-xl md:flex">
          <div className="mb-2 shrink-0 font-headline text-xl text-white">Panel clínica</div>
          <p className="mb-8 shrink-0 text-xs text-slate-400">Gestión de turnos y disponibilidad</p>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <NavLinks pathname={pathname} />
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-6 flex w-full shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left text-xs font-medium uppercase tracking-widest text-slate-300 transition hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Salir
          </button>
        </aside>

        <div
          className="min-h-dvh w-full min-w-0 flex-1 px-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:px-4 md:px-10 md:py-8 md:pt-8"
        >
          <div className="mx-auto min-w-0 max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
