import { clsx } from "clsx";

const LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACT_PENDING: "Esperando WhatsApp",
  CONTACTED: "Contactado",
  PENDING_CONFIRMATION: "Pendiente confirmación",
  CONFIRMED: "Confirmado",
  RESCHEDULED: "Reprogramado",
  CANCELED: "Cancelado",
  CLOSED: "Cerrado",
};

export function bookingStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-slate-200 text-slate-800",
    CONTACT_PENDING: "bg-amber-100 text-amber-900",
    CONTACTED: "bg-sky-100 text-sky-900",
    PENDING_CONFIRMATION: "bg-orange-100 text-orange-900 ring-1 ring-orange-200",
    CONFIRMED: "bg-emerald-100 text-emerald-900",
    RESCHEDULED: "bg-indigo-100 text-indigo-900",
    CANCELED: "bg-red-100 text-red-900",
    CLOSED: "bg-zinc-200 text-zinc-800",
  };

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[status] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {bookingStatusLabel(status)}
    </span>
  );
}
