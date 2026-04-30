"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AdminButton } from "@/components/admin/admin-button";
import { BookingStatusBadge } from "@/components/admin/booking-status";
import { RescheduleBookingDialog } from "@/components/admin/reschedule-booking-dialog";
import { formatDateTimeEs } from "@/lib/date-format";
import { buildBookingWhatsAppMessage, phoneToWhatsAppUrl } from "@/lib/whatsapp-booking";

type Booking = {
  id: string;
  status: string;
  createdAt: string;
  contactLead: { name: string; dni: string | null; email: string | null; phone: string | null };
  treatment: { id: string; name: string };
  professional: { name: string } | null;
  availabilitySlot: { startsAt: string } | null;
};

type TabId = "pending" | "confirmed" | "canceled" | "history" | "all";

const TABS: { id: TabId; label: string; hint: string; query?: string }[] = [
  {
    id: "pending",
    label: "Por confirmar",
    hint: "Solicitudes que necesitan tu respuesta",
    query: "statuses=PENDING_CONFIRMATION,NEW,CONTACT_PENDING",
  },
  { id: "confirmed", label: "Confirmados", hint: "Turnos ya confirmados con el paciente", query: "status=CONFIRMED" },
  { id: "canceled", label: "Cancelados", hint: "Solicitudes rechazadas o canceladas", query: "status=CANCELED" },
  {
    id: "history",
    label: "Historial",
    hint: "Cerrados o reprogramados (seguimiento finalizado)",
    query: "statuses=CLOSED,RESCHEDULED,CONTACTED",
  },
  { id: "all", label: "Todos", hint: "Listado completo (últimos registros)", query: undefined },
];

export default function AdminBookingsPage() {
  const [tab, setTab] = useState<TabId>("pending");
  const [rows, setRows] = useState<Booking[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rescheduleFor, setRescheduleFor] = useState<Booking | null>(null);
  const [rescheduleMode, setRescheduleMode] = useState<"assign" | "reschedule">("reschedule");

  const activeTab = useMemo(() => TABS.find((t) => t.id === tab)!, [tab]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = activeTab.query;
      const url = q ? `/api/admin/bookings?${q}` : "/api/admin/bookings";
      const d = await apiFetch<{ bookings: Booking[] }>(url);
      setRows(d.bookings);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [activeTab.query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, status: string) {
    await apiFetch(`/api/admin/bookings/${id}`, { method: "PATCH", json: { status } });
    await load();
  }

  async function openWhatsApp(b: Booking) {
    setErr(null);
    const phone = b.contactLead.phone?.trim();
    if (!phone) {
      setErr("Este contacto no tiene teléfono cargado. Agregalo en Contactos o pedile el número al paciente.");
      return;
    }
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "el centro";
    const text = buildBookingWhatsAppMessage({
      patientName: b.contactLead.name,
      siteName: siteName,
      treatmentName: b.treatment.name,
      professionalName: b.professional?.name ?? null,
      slotStartsAt: b.availabilitySlot?.startsAt ?? null,
    });
    const url = phoneToWhatsAppUrl(phone, text);
    if (!url) {
      setErr("No se pudo armar el enlace de WhatsApp. Revisá el formato del teléfono.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");

    if (b.status === "NEW" || b.status === "PENDING_CONFIRMATION") {
      try {
        await apiFetch(`/api/admin/bookings/${b.id}`, { method: "PATCH", json: { status: "CONTACT_PENDING" } });
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
      }
    }
  }

  function openReschedule(b: Booking, mode: "assign" | "reschedule") {
    setRescheduleMode(mode);
    setRescheduleFor(b);
  }

  return (
    <div className="min-w-0 space-y-6">
      {rescheduleFor && (
        <RescheduleBookingDialog
          open
          onOpenChange={(v) => {
            if (!v) setRescheduleFor(null);
          }}
          onSuccess={() => void load()}
          bookingId={rescheduleFor.id}
          treatmentId={rescheduleFor.treatment.id}
          treatmentName={rescheduleFor.treatment.name}
          currentSlotStartsAt={rescheduleFor.availabilitySlot?.startsAt ?? null}
          mode={rescheduleMode}
        />
      )}

      <div>
        <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Reservas y solicitudes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          En <strong className="text-slate-800">Por confirmar</strong>, el flujo recomendado es: primero{" "}
          <strong>WhatsApp</strong> al paciente (queda registrado como &quot;Esperando WhatsApp&quot;). Cuando la persona
          confirma por chat, usá <strong>Confirmar</strong> o <strong>Rechazar</strong> según corresponda. Los turnos
          confirmados pasan a la pestaña &quot;Confirmados&quot;; al confirmar, el cupo deja de ofrecerse en la web. Para
          dar de alta un turno manual (persona nueva o contacto), usá la pestaña{" "}
          <Link href="/admin/asignar-turnos" className="font-medium text-sky-700 underline underline-offset-2">
            Asignar turnos
          </Link>
          .
        </p>
      </div>

      <div className="-mx-1 overflow-x-auto rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80 md:mx-0">
        <div className="flex w-max min-w-full flex-nowrap gap-2 md:flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? "bg-sky-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">{activeTab.label}:</span> {activeTab.hint}
      </p>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Tratamiento</th>
                <th className="px-4 py-3">Profesional</th>
                <th className="px-4 py-3">Fecha / hora</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No hay registros en esta vista.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{b.contactLead.name}</div>
                      <div className="text-xs text-slate-500">DNI: {b.contactLead.dni || "—"}</div>
                      <div className="text-xs text-slate-500">{b.contactLead.email ?? "—"}</div>
                      <div className="text-xs text-slate-500">{b.contactLead.phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{b.treatment.name}</td>
                    <td className="px-4 py-3">{b.professional?.name ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {b.availabilitySlot ? formatDateTimeEs(b.availabilitySlot.startsAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(b.status === "PENDING_CONFIRMATION" ||
                          b.status === "NEW" ||
                          b.status === "CONTACT_PENDING" ||
                          b.status === "CONTACTED") && (
                          <>
                            {!b.availabilitySlot && (
                              <AdminButton
                                variant="primary"
                                className="!px-3 !py-1.5 text-xs"
                                onClick={() => openReschedule(b, "assign")}
                              >
                                Asignar cupo
                              </AdminButton>
                            )}
                            {b.availabilitySlot && (
                              <AdminButton
                                variant="primary"
                                className="!px-3 !py-1.5 text-xs"
                                onClick={() => openReschedule(b, "reschedule")}
                              >
                                Cambiar cupo
                              </AdminButton>
                            )}
                            <button
                              type="button"
                              title={b.contactLead.phone ? "Abrir WhatsApp con mensaje sugerido" : "Falta teléfono del paciente"}
                              disabled={!b.contactLead.phone}
                              onClick={() => void openWhatsApp(b)}
                              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                                <path
                                  fill="currentColor"
                                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                                />
                              </svg>
                              WhatsApp
                            </button>
                            <AdminButton variant="success" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CONFIRMED")}>
                              Confirmar turno
                            </AdminButton>
                            <AdminButton variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CANCELED")}>
                              Rechazar
                            </AdminButton>
                          </>
                        )}
                        {b.status === "CONFIRMED" && (
                          <>
                            <AdminButton
                              variant="primary"
                              className="!px-3 !py-1.5 text-xs"
                              onClick={() => openReschedule(b, "reschedule")}
                            >
                              Reprogramar
                            </AdminButton>
                            <AdminButton variant="neutral" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CLOSED")}>
                              Marcar cerrado
                            </AdminButton>
                            <AdminButton variant="warning" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CANCELED")}>
                              Cancelar turno
                            </AdminButton>
                          </>
                        )}
                        {b.status === "RESCHEDULED" && b.availabilitySlot && (
                          <>
                            <AdminButton
                              variant="primary"
                              className="!px-3 !py-1.5 text-xs"
                              onClick={() => openReschedule(b, "reschedule")}
                            >
                              Reprogramar
                            </AdminButton>
                            <AdminButton variant="warning" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CANCELED")}>
                              Cancelar
                            </AdminButton>
                          </>
                        )}
                        {b.status !== "CANCELED" &&
                          b.status !== "CLOSED" &&
                          b.status !== "PENDING_CONFIRMATION" &&
                          b.status !== "NEW" &&
                          b.status !== "CONTACT_PENDING" &&
                          b.status !== "CONFIRMED" &&
                          b.status !== "RESCHEDULED" && (
                            <AdminButton variant="warning" className="!px-3 !py-1.5 text-xs" onClick={() => void patch(b.id, "CANCELED")}>
                              Cancelar
                            </AdminButton>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
