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
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState<boolean | null>(null);

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

  async function logout() {
    await apiFetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (ok === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
        Verificando sesión…
      </div>
    );
  }

  if (!ok) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-slate-100 shadow-xl">
          <div className="mb-2 font-headline text-xl text-white">Panel clínica</div>
          <p className="mb-8 text-xs text-slate-400">Gestión de turnos y disponibilidad</p>
          <nav className="space-y-1">
            {links.map((l) => {
              const active =
                l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? "bg-sky-500/20 font-semibold text-white ring-1 ring-sky-400/40" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-sky-300">{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-10 flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left text-xs font-medium uppercase tracking-widest text-slate-300 transition hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Salir
          </button>
        </aside>
        <div className="min-h-screen px-4 py-8 md:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
