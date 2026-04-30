"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatDateTimeEs } from "@/lib/date-format";
import { AdminButton } from "@/components/admin/admin-button";

type Treatment = { id: string; name: string };
type Slot = {
  id: string;
  startsAt: string;
  professional: { id: string; name: string };
  treatment: { id: string; name: string };
};

export type ManualBookingFormProps = {
  variant: "dialog" | "page";
  /** Contacto existente: no pedir nombre/email/tel */
  contactLeadId?: string | null;
  linkedContactLabel?: string;
  prefilled?: { name?: string; email?: string; phone?: string };
  /** DNI ya cargado del contacto (solo dígitos o vacío). */
  prefilledDni?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Clave para resetear estado interno cuando el contacto enlazado cambia desde fuera */
  contactKey?: string;
};

export function ManualBookingForm({
  variant,
  contactLeadId,
  linkedContactLabel,
  prefilled,
  prefilledDni = "",
  onSuccess,
  onCancel,
  contactKey,
}: ManualBookingFormProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentId, setTreatmentId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState(prefilled?.name ?? "");
  const [email, setEmail] = useState(prefilled?.email ?? "");
  const [phone, setPhone] = useState(prefilled?.phone ?? "");
  const [dni, setDni] = useState(prefilledDni);
  const [confirmed, setConfirmed] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [message, setMessage] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const loadTreatments = useCallback(async () => {
    try {
      const d = await apiFetch<{ treatments: Treatment[] }>("/api/admin/treatments");
      setTreatments(d.treatments.filter((t) => (t as { active?: boolean }).active !== false));
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "No se pudieron cargar tratamientos");
    }
  }, []);

  const loadSlots = useCallback(async (tid: string) => {
    if (!tid) {
      setSlots([]);
      setSlotId("");
      return;
    }
    setSlotsLoading(true);
    setLoadErr(null);
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 120);
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        slotStatus: "AVAILABLE",
        treatmentId: tid,
      });
      const d = await apiFetch<{ slots: Slot[] }>(`/api/admin/availability?${params}`);
      const future = d.slots.filter((s) => new Date(s.startsAt).getTime() >= Date.now());
      setSlots(future);
      setSlotId("");
    } catch (e) {
      setSlots([]);
      setLoadErr(e instanceof Error ? e.message : "No se pudieron cargar cupos");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTreatments();
  }, [loadTreatments]);

  useEffect(() => {
    setName(prefilled?.name ?? "");
    setEmail(prefilled?.email ?? "");
    setPhone(prefilled?.phone ?? "");
  }, [prefilled?.name, prefilled?.email, prefilled?.phone]);

  useEffect(() => {
    setDni(prefilledDni);
  }, [prefilledDni, contactKey]);

  useEffect(() => {
    setOkMsg(null);
    setSubmitErr(null);
  }, [contactKey, contactLeadId]);

  useEffect(() => {
    if (!treatmentId) {
      setSlots([]);
      return;
    }
    void loadSlots(treatmentId);
  }, [treatmentId, loadSlots]);

  function resetAfterSuccess() {
    setTreatmentId("");
    setSlotId("");
    setMessage("");
    if (!contactLeadId) {
      setName("");
      setEmail("");
      setPhone("");
      setDni("");
    } else {
      setDni(prefilledDni);
    }
  }

  async function submit() {
    setSubmitErr(null);
    setOkMsg(null);
    if (!slotId) {
      setSubmitErr("Elegí un horario disponible.");
      return;
    }
    if (!dni.trim() || dni.replace(/\D/g, "").length < 7) {
      setSubmitErr("Indicá un DNI o documento válido (al menos 7 dígitos).");
      return;
    }
    if (!contactLeadId) {
      if (!name.trim()) {
        setSubmitErr("Indicá el nombre del paciente.");
        return;
      }
      if (!email.trim() && !phone.trim()) {
        setSubmitErr("Indicá al menos email o teléfono.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/admin/bookings/manual", {
        method: "POST",
        json: {
          availabilitySlotId: slotId,
          dni: dni.trim(),
          ...(contactLeadId ? { contactLeadId } : { name: name.trim(), email: email.trim(), phone: phone.trim() }),
          confirmed,
          notifyPatientEmail: notifyEmail,
          ...(message.trim() ? { patientMessage: message.trim() } : {}),
        },
      });
      resetAfterSuccess();
      setOkMsg(variant === "page" ? "Reserva creada correctamente." : "");
      onSuccess?.();
      if (variant === "dialog" && onCancel) onCancel();
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "No se pudo crear la reserva");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={variant === "page" ? "space-y-4" : "mt-4 space-y-4"}>
      {okMsg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
          {okMsg}
        </p>
      )}
      {loadErr && <p className="text-sm text-red-700">{loadErr}</p>}
      {submitErr && <p className="text-sm text-red-700">{submitErr}</p>}

      {contactLeadId ? (
        <div className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-950 ring-1 ring-sky-100">
          <span className="font-medium">Contacto seleccionado.</span>{" "}
          {linkedContactLabel ? <span>{linkedContactLabel}</span> : null}
        </div>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              DNI o documento
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ej. 12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </>
      )}

      {contactLeadId && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            DNI o documento
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ej. 12345678"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-slate-500">Se actualiza en el contacto al guardar la reserva.</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tratamiento</label>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={treatmentId}
          onChange={(e) => setTreatmentId(e.target.value)}
        >
          <option value="">Seleccioná…</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cupo disponible</label>
        {slotsLoading && <p className="text-sm text-slate-500">Cargando horarios…</p>}
        {!slotsLoading && treatmentId && slots.length === 0 && (
          <p className="text-sm text-amber-800">No hay cupos libres para este tratamiento en los próximos días.</p>
        )}
        {!slotsLoading && slots.length > 0 && (
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
          >
            <option value="">Elegí horario…</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDateTimeEs(s.startsAt)} — {s.professional.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Nota interna (opcional)
        </label>
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        Confirmar turno ya (si no, queda pendiente de confirmación)
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
        Enviar mail de confirmación si hay email (solo si está confirmado)
      </label>

      <div className={`flex flex-wrap gap-2 ${variant === "page" ? "pt-2" : "mt-6 justify-end"}`}>
        {variant === "dialog" && onCancel && (
          <AdminButton variant="ghost" className="!px-4" onClick={onCancel} disabled={submitting}>
            Cancelar
          </AdminButton>
        )}
        <AdminButton
          variant="success"
          className={variant === "page" ? "!px-6" : "!px-4"}
          onClick={() => void submit()}
          disabled={submitting}
        >
          {submitting ? "Guardando…" : "Crear reserva"}
        </AdminButton>
      </div>
    </div>
  );
}
