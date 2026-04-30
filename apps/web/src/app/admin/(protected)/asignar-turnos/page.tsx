"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ManualBookingForm } from "@/components/admin/manual-booking-form";

type LeadRow = { id: string; name: string; dni: string | null; email: string | null; phone: string | null };

type Source = "new" | "existing";

export default function AdminAsignarTurnosPage() {
  const [source, setSource] = useState<Source>("new");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [leadId, setLeadId] = useState("");
  const [leadsErr, setLeadsErr] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLeadsErr(null);
    try {
      const d = await apiFetch<{ leads: LeadRow[] }>("/api/admin/leads");
      setLeads(d.leads);
    } catch (e) {
      setLeadsErr(e instanceof Error ? e.message : "No se pudieron cargar contactos");
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const selected = leads.find((l) => l.id === leadId);
  const linkedLabel = selected
    ? `${selected.name} · ${selected.email ?? "sin email"} · ${selected.phone ?? "sin tel."}`
    : undefined;

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Asignar turnos</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Cargá cupos en{" "}
          <Link href="/admin/availability" className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900">
            Calendario y turnos
          </Link>
          . Desde acá asignás un horario libre a una persona nueva o a un contacto ya cargado. Para reprogramar una reserva
          existente, usá{" "}
          <Link href="/admin/bookings" className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900">
            Reservas
          </Link>
          .
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="font-headline text-lg text-slate-900">Nueva asignación</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSource("new");
              setLeadId("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              source === "new" ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Persona nueva (sin contacto)
          </button>
          <button
            type="button"
            onClick={() => {
              setSource("existing");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              source === "existing" ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Contacto existente
          </button>
        </div>

        {source === "existing" && (
          <div className="mt-6">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Elegí contacto
            </label>
            {leadsErr && <p className="mb-2 text-sm text-red-700">{leadsErr}</p>}
            <select
              className="w-full max-w-xl rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
            >
              <option value="">Seleccioná…</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                  {l.phone ? ` · ${l.phone}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Listado de los últimos contactos. ¿Falta alguien?{" "}
              <Link href="/admin/leads" className="text-sky-700 underline underline-offset-2">
                Ver todos en Contactos
              </Link>
              .
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6">
          {source === "existing" && !leadId ? (
            <p className="text-sm text-slate-500">Seleccioná un contacto arriba para cargar el turno.</p>
          ) : (
            <ManualBookingForm
              key={source === "new" ? "new-person" : `lead-${leadId}`}
              variant="page"
              contactLeadId={source === "existing" && leadId ? leadId : null}
              linkedContactLabel={source === "existing" && leadId ? linkedLabel : undefined}
              prefilledDni={source === "existing" && selected?.dni ? selected.dni : ""}
              contactKey={`${source}-${leadId}`}
              onSuccess={() => void loadLeads()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
