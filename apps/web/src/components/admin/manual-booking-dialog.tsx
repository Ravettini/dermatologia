"use client";

import { ManualBookingForm } from "@/components/admin/manual-booking-form";

export type ManualBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  contactLeadId?: string;
  linkedContactLabel?: string;
  prefilled?: { name?: string; email?: string; phone?: string };
  prefilledDni?: string;
};

export function ManualBookingDialog({
  open,
  onOpenChange,
  onSuccess,
  contactLeadId,
  linkedContactLabel,
  prefilled,
  prefilledDni = "",
}: ManualBookingDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 className="font-headline text-xl text-slate-900">Turno manual</h2>
        <p className="mt-1 text-sm text-slate-600">
          Asigná un cupo libre del calendario. El tratamiento debe coincidir con el cupo elegido.
        </p>
        <ManualBookingForm
          variant="dialog"
          contactLeadId={contactLeadId}
          linkedContactLabel={linkedContactLabel}
          prefilled={prefilled}
          prefilledDni={prefilledDni}
          contactKey={`${contactLeadId ?? "x"}-${prefilledDni}`}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </div>
    </div>
  );
}
