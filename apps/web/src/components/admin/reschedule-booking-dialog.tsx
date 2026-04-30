"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatDateTimeEs } from "@/lib/date-format";
import { AdminButton } from "@/components/admin/admin-button";

type Slot = {
  id: string;
  startsAt: string;
  professional: { id: string; name: string };
};

export type RescheduleBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  bookingId: string;
  treatmentId: string;
  treatmentName: string;
  /** Si es null, es primera asignación de cupo */
  currentSlotStartsAt: string | null;
  mode: "assign" | "reschedule";
};

export function RescheduleBookingDialog({
  open,
  onOpenChange,
  onSuccess,
  bookingId,
  treatmentId,
  treatmentName,
  currentSlotStartsAt,
  mode,
}: RescheduleBookingDialogProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = useCallback(async () => {
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
        treatmentId,
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
  }, [treatmentId]);

  useEffect(() => {
    if (!open || !treatmentId) return;
    setSubmitErr(null);
    void loadSlots();
  }, [open, treatmentId, loadSlots]);

  async function submit() {
    if (!slotId) {
      setSubmitErr("Elegí un horario.");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    try {
      await apiFetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        json: { availabilitySlotId: slotId },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "No se pudo actualizar");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const title = mode === "assign" ? "Asignar cupo" : "Reprogramar turno";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative max-h-[min(88vh,560px)] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 className="font-headline text-xl text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tratamiento: <strong>{treatmentName}</strong>
          {currentSlotStartsAt ? (
            <>
              . Horario actual: <strong>{formatDateTimeEs(currentSlotStartsAt)}</strong>
            </>
          ) : (
            <> . Esta solicitud aún no tiene cupo.</>
          )}
        </p>

        {loadErr && <p className="mt-3 text-sm text-red-700">{loadErr}</p>}
        {submitErr && <p className="mt-3 text-sm text-red-700">{submitErr}</p>}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nuevo cupo libre
          </label>
          {slotsLoading && <p className="text-sm text-slate-500">Cargando…</p>}
          {!slotsLoading && slots.length === 0 && (
            <p className="text-sm text-amber-800">No hay cupos disponibles para este tratamiento.</p>
          )}
          {!slotsLoading && slots.length > 0 && (
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            >
              <option value="">Elegí…</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDateTimeEs(s.startsAt)} — {s.professional.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AdminButton variant="ghost" className="!px-4" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </AdminButton>
          <AdminButton variant="success" className="!px-4" onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Guardando…" : mode === "assign" ? "Asignar" : "Reprogramar"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
