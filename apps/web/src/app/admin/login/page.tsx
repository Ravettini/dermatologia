"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiFetch("/api/admin/auth/login", {
        method: "POST",
        json: { email, password },
      });
      router.replace("/admin");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(2rem,env(safe-area-inset-top,0px))] sm:px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-soft sm:p-10"
      >
        <h1 className="mb-2 font-headline text-2xl sm:text-3xl">Panel administración</h1>
        <p className="mb-8 text-sm text-on-surface-variant">Acceso interno del centro</p>
        <label className="mb-2 block text-xs uppercase tracking-widest text-on-surface-variant">Email</label>
        <input
          className="mb-4 w-full border border-outline-variant/50 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <label className="mb-2 block text-xs uppercase tracking-widest text-on-surface-variant">Contraseña</label>
        <input
          className="mb-6 w-full border border-outline-variant/50 px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {err && <p className="mb-4 text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-on-primary-container py-3 font-label text-xs uppercase tracking-widest text-surface"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
