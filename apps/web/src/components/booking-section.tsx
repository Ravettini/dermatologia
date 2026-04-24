"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingRequestSchema } from "@derma/shared";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { apiFetch } from "@/lib/api";

type Treatment = {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  category: string;
};

type Professional = {
  id: string;
  name: string;
  specialty: string;
  specialtyTreatmentId?: string | null;
};

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  professionalId: string;
  treatmentId: string | null;
  professional: Professional;
  treatment: { id: string; name: string; slug: string } | null;
};

type FormValues = {
  treatmentId: string;
  professionalId: string;
  slotId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  consent: boolean;
};

export function BookingSection() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: { consent: false, professionalId: "" },
  });

  const treatmentId = watch("treatmentId");
  const professionalId = watch("professionalId");

  useEffect(() => {
    setValue("slotId", "");
  }, [treatmentId, professionalId, setValue]);

  useEffect(() => {
    setSubmitOk(false);
  }, [treatmentId]);

  useEffect(() => {
    void (async () => {
      try {
        const [t, p] = await Promise.all([
          apiFetch<{ treatments: Treatment[] }>("/api/public/treatments"),
          apiFetch<{ professionals: Professional[] }>("/api/public/professionals"),
        ]);
        setTreatments(t.treatments);
        setProfessionals(p.professionals);
      } catch (e) {
        setLoadErr(e instanceof Error ? e.message : "No se pudo cargar datos");
      }
    })();
  }, []);

  useEffect(() => {
    if (!treatmentId) {
      setSlots([]);
      setValue("slotId", "");
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setLoadErr(null);

    void (async () => {
      try {
        const params = new URLSearchParams({ treatmentId });
        if (professionalId) params.set("professionalId", professionalId);
        const a = await apiFetch<{ slots: Slot[] }>(`/api/public/availability?${params.toString()}`);
        if (!cancelled) setSlots(a.slots);
      } catch (e) {
        if (!cancelled) {
          setSlots([]);
          setLoadErr(e instanceof Error ? e.message : "No se pudo cargar horarios");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [treatmentId, professionalId, setValue]);

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (treatmentId && s.treatmentId && s.treatmentId !== treatmentId) return false;
      if (professionalId && s.professionalId !== professionalId) return false;
      return true;
    });
  }, [slots, treatmentId, professionalId]);

  /** Profesionales con al menos un horario disponible para el tratamiento elegido (evita lista vacía si falta specialtyTreatmentId en BD). */
  const professionalsWithSlots = useMemo(() => {
    if (!treatmentId || slots.length === 0) return [];
    const byId = new Map<string, Professional>();
    for (const s of slots) {
      if (s.treatmentId && s.treatmentId !== treatmentId) continue;
      if (!byId.has(s.professionalId)) byId.set(s.professionalId, s.professional);
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [slots, treatmentId]);

  useEffect(() => {
    if (!professionalId) return;
    const stillValid = professionalsWithSlots.some((p) => p.id === professionalId);
    if (!stillValid) setValue("professionalId", "");
  }, [professionalId, professionalsWithSlots, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitOk(false);
    setSubmitErr(null);
    try {
      await apiFetch("/api/public/booking-request", {
        method: "POST",
        json: {
          ...data,
          professionalId: data.professionalId || null,
        },
      });
      setSubmitOk(true);
      setValue("slotId", "");
      const params = new URLSearchParams({ treatmentId: data.treatmentId });
      if (data.professionalId) params.set("professionalId", data.professionalId);
      const refreshed = await apiFetch<{ slots: Slot[] }>(`/api/public/availability?${params.toString()}`);
      setSlots(refreshed.slots);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "No se pudo enviar la solicitud");
    }
  });

  return (
    <section id="reservar" className="scroll-mt-32 bg-surface-container px-4 py-16 sm:px-6 md:scroll-mt-28 md:px-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Reservá tu consulta</span>
        <h2 className="mb-4 font-headline text-4xl md:text-5xl">Solicitá tu turno</h2>
        <p className="mb-12 max-w-2xl text-on-surface-variant">
          Elegí tratamiento, horario disponible y dejanos tus datos. El equipo confirmará o reprogramará según
          disponibilidad real. Esta solicitud no constituye confirmación automática.
        </p>

        {loadErr && <p className="mb-6 text-sm text-red-700">{loadErr}</p>}

        <form onSubmit={onSubmit} className="grid gap-10 md:grid-cols-2">
          {submitOk && (
            <div
              className="md:col-span-2 flex gap-4 rounded-xl border-2 border-emerald-600/50 bg-emerald-100/90 px-5 py-5 shadow-sm sm:px-6 sm:py-6"
              role="status"
              aria-live="polite"
            >
              <span className="material-symbols-outlined shrink-0 text-3xl text-emerald-800">check_circle</span>
              <div>
                <p className="font-label text-xs uppercase tracking-[0.2em] text-emerald-900">Solicitud enviada</p>
                <p className="mt-2 text-base font-medium leading-snug text-emerald-950 sm:text-lg">
                  Recibimos tu solicitud. Te contactaremos para confirmar el turno.
                </p>
              </div>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Tratamiento / motivo
              </label>
              <select
                className="w-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body text-sm outline-none focus:border-secondary"
                {...register("treatmentId")}
              >
                <option value="">Seleccioná…</option>
                {treatments.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name}
                  </option>
                ))}
              </select>
              {errors.treatmentId && <p className="mt-1 text-xs text-red-700">{errors.treatmentId.message}</p>}
            </div>

            <div>
              <label className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Profesional (opcional)
              </label>
              <select
                className="w-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body text-sm outline-none focus:border-secondary"
                {...register("professionalId")}
                disabled={!treatmentId}
              >
                <option value="">Cualquiera disponible</option>
                {professionalsWithSlots.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
              {!treatmentId && (
                <p className="mt-1 text-xs text-on-surface-variant/80">Primero elegí un tratamiento.</p>
              )}
              {treatmentId && !slotsLoading && professionalsWithSlots.length === 0 && (
                <p className="mt-1 text-xs text-on-surface-variant/80">
                  No hay profesionales con turnos cargados para este tratamiento.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Horario disponible
              </label>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-outline-variant/30 bg-surface-container-lowest p-3">
                {!treatmentId && (
                  <p className="text-sm text-on-surface-variant">Elegí un tratamiento para ver los horarios disponibles.</p>
                )}
                {treatmentId && slotsLoading && <p className="text-sm text-on-surface-variant">Cargando horarios…</p>}
                {treatmentId && !slotsLoading && filteredSlots.length === 0 && (
                  <p className="text-sm text-on-surface-variant">
                    No hay horarios para este tratamiento{professionalId ? " y profesional" : ""}. Probá otra combinación o
                    contactanos.
                  </p>
                )}
                {treatmentId &&
                  !slotsLoading &&
                  filteredSlots.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-surface-container-high"
                    >
                      <input type="radio" value={s.id} {...register("slotId")} />
                      <span className="text-sm">
                        {format(parseISO(s.startsAt), "EEEE d MMM · HH:mm", { locale: es })} — {s.professional.name}
                      </span>
                    </label>
                  ))}
              </div>
              {errors.slotId && <p className="mt-1 text-xs text-red-700">{errors.slotId.message}</p>}
            </div>
          </div>

          <div className="space-y-6 bg-surface-container-lowest p-5 shadow-soft sm:p-6 md:p-8">
            <div>
              <input
                className="w-full border-0 border-b border-outline-variant bg-transparent py-3 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
                placeholder="Nombre y apellido"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
            </div>
            <div>
              <input
                className="w-full border-0 border-b border-outline-variant bg-transparent py-3 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
                placeholder="Email"
                type="email"
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
            </div>
            <div>
              <input
                className="w-full border-0 border-b border-outline-variant bg-transparent py-3 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
                placeholder="Teléfono"
                {...register("phone")}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
            </div>
            <div>
              <textarea
                className="w-full border-0 border-b border-outline-variant bg-transparent py-3 placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-0"
                placeholder="Comentarios (opcional)"
                rows={3}
                {...register("message")}
              />
            </div>
            <label className="flex items-start gap-3 text-xs text-on-surface-variant">
              <input type="checkbox" className="mt-1" {...register("consent")} />
              <span>Entiendo que la solicitud queda pendiente de confirmación por el centro.</span>
            </label>
            {errors.consent && <p className="text-xs text-red-700">Debés confirmar para enviar.</p>}
            <button
              type="submit"
              className="w-full bg-on-primary-container py-4 font-label text-xs uppercase tracking-widest text-surface"
            >
              Enviar solicitud
            </button>
            {submitErr && <p className="text-sm text-red-700">{submitErr}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
