"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema } from "@derma/shared";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

type FormValues = {
  name: string;
  dni: string;
  email: string;
  phone?: string;
  message: string;
  consent: boolean;
};

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { consent: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus("loading");
    setErr(null);
    try {
      await apiFetch("/api/public/contact", {
        method: "POST",
        json: { ...data, source: "WEB_FORM" },
      });
      setStatus("ok");
      reset({ name: "", dni: "", email: "", phone: "", message: "", consent: false });
    } catch (e) {
      setStatus("err");
      setErr(e instanceof Error ? e.message : "No se pudo enviar");
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div>
        <input
          className="w-full border-0 border-b border-outline-variant bg-transparent py-4 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
          placeholder="Nombre completo"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
      </div>
      <div>
        <input
          className="w-full border-0 border-b border-outline-variant bg-transparent py-4 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
          placeholder="DNI o documento"
          autoComplete="off"
          {...register("dni")}
        />
        {errors.dni && <p className="mt-1 text-xs text-red-700">{errors.dni.message}</p>}
      </div>
      <div>
        <input
          className="w-full border-0 border-b border-outline-variant bg-transparent py-4 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
          placeholder="Correo electrónico"
          type="email"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
      </div>
      <div>
        <input
          className="w-full border-0 border-b border-outline-variant bg-transparent py-4 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
          placeholder="Teléfono (opcional)"
          {...register("phone")}
        />
      </div>
      <div>
        <textarea
          className="w-full border-0 border-b border-outline-variant bg-transparent py-4 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
          placeholder="Mensaje o consulta"
          rows={4}
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message.message}</p>}
      </div>
      <label className="flex items-start gap-3 text-sm text-on-surface-variant">
        <input type="checkbox" className="mt-1" {...register("consent")} />
        <span>
          Acepto ser contactado/a con fines de coordinación de turno y recibir información del centro. No compartimos
          tus datos con terceros ajenos a la gestión.
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-700">Debés aceptar para continuar.</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-on-primary-container py-5 font-label text-sm uppercase tracking-widest text-surface disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar mensaje"}
      </button>
      {status === "ok" && <p className="text-sm text-secondary">Gracias. Te contactaremos a la brevedad.</p>}
      {status === "err" && err && <p className="text-sm text-red-700">{err}</p>}
    </form>
  );
}
