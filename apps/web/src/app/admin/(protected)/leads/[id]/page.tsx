"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ManualBookingDialog } from "@/components/admin/manual-booking-dialog";
import { AdminButton } from "@/components/admin/admin-button";

type LeadDetail = {
  id: string;
  name: string;
  dni: string | null;
  email: string | null;
  phone: string | null;
  crmContacted: boolean;
  duplicateIntakeCount: number;
  notes: { id: string; body: string; createdAt: string }[];
  bookings: { id: string; status: string; treatment: { name: string } }[];
};

export default function AdminLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState("");
  const [crmBusy, setCrmBusy] = useState(false);
  const [crmErr, setCrmErr] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [dniEdit, setDniEdit] = useState("");
  const [dniBusy, setDniBusy] = useState(false);
  const [dniErr, setDniErr] = useState<string | null>(null);

  async function load() {
    const d = await apiFetch<{ lead: LeadDetail }>(`/api/admin/leads/${params.id}`);
    setLead(d.lead);
    setDniEdit(d.lead.dni || "");
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function addNote() {
    if (!note.trim()) return;
    await apiFetch(`/api/admin/leads/${params.id}/notes`, { method: "POST", json: { body: note } });
    setNote("");
    await load();
  }

  async function saveDni() {
    if (!lead) return;
    const digits = dniEdit.replace(/\D/g, "");
    if (dniEdit.trim() && digits.length < 7) {
      setDniErr("DNI inválido (mínimo 7 dígitos).");
      return;
    }
    setDniErr(null);
    setDniBusy(true);
    try {
      const payload =
        !dniEdit.trim() ? { dni: null } : { dni: dniEdit.trim() };
      await apiFetch(`/api/admin/leads/${params.id}`, { method: "PATCH", json: payload });
      await load();
    } catch (e) {
      setDniErr(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setDniBusy(false);
    }
  }

  async function setContacted(value: boolean) {
    if (!lead) return;
    setCrmErr(null);
    setCrmBusy(true);
    const prev = lead.crmContacted;
    setLead({ ...lead, crmContacted: value });
    try {
      await apiFetch(`/api/admin/leads/${params.id}`, { method: "PATCH", json: { crmContacted: value } });
    } catch (e) {
      setCrmErr(e instanceof Error ? e.message : "No se pudo guardar");
      setLead({ ...lead, crmContacted: prev });
    } finally {
      setCrmBusy(false);
    }
  }

  if (!lead) return <p className="text-sm text-on-surface-variant">Cargando…</p>;

  return (
    <div className="min-w-0">
      <ManualBookingDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSuccess={() => void load()}
        contactLeadId={lead.id}
        linkedContactLabel={`${lead.name} · ${lead.email ?? "sin email"} · ${lead.phone ?? "sin tel."}`}
        prefilledDni={lead.dni || ""}
      />

      <h1 className="mb-2 break-words font-headline text-2xl sm:text-3xl">{lead.name}</h1>
      <p className="mb-4 break-words text-sm text-on-surface-variant">
        {lead.email} · {lead.phone}
      </p>

      {lead.duplicateIntakeCount > 0 ? (
        <div
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-medium">Reingresos detectados ({lead.duplicateIntakeCount})</p>
          <p className="mt-1 text-amber-900/90">
            Esta persona volvió a enviar sus datos desde la web, el formulario de turnos o el chat usando el mismo DNI.
            Cada vez se registró una nota automática y se actualizó la ficha; revisá el historial abajo.
          </p>
        </div>
      ) : null}

      <div className="mb-6 rounded-lg border border-outline-variant/30 bg-surface-container-low/50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">DNI / documento</p>
        {dniErr && <p className="mb-2 text-sm text-red-700">{dniErr}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input
            className="w-full max-w-xs border border-outline-variant/40 bg-transparent px-3 py-2 text-sm sm:flex-1"
            value={dniEdit}
            onChange={(e) => setDniEdit(e.target.value)}
            placeholder="Sin cargar"
          />
          <button
            type="button"
            disabled={dniBusy}
            className="bg-on-primary-container px-4 py-2 text-xs uppercase tracking-widest text-surface disabled:opacity-50"
            onClick={() => void saveDni()}
          >
            {dniBusy ? "Guardando…" : "Guardar DNI"}
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-outline-variant/30 bg-surface-container-low/50 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-on-surface-variant">CRM</p>
        {crmErr && <p className="mb-2 text-sm text-red-700">{crmErr}</p>}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant accent-secondary"
            checked={lead.crmContacted ?? false}
            disabled={crmBusy}
            onChange={(e) => void setContacted(e.target.checked)}
          />
          <span>Contactado</span>
        </label>
      </div>

      <div className="mb-8">
        <AdminButton variant="success" className="!px-4" onClick={() => setManualOpen(true)}>
          Asignar turno a este contacto
        </AdminButton>
        <p className="mt-2 text-xs text-on-surface-variant">
          Crea una reserva manual usando un cupo del calendario. Para cambiar un turno ya cargado, andá a{" "}
          <Link href="/admin/bookings" className="font-medium text-secondary underline underline-offset-2">
            Reservas
          </Link>
          .
        </p>
      </div>

      <h2 className="mb-3 font-headline text-xl">Reservas</h2>
      <ul className="mb-8 space-y-2 text-sm">
        {lead.bookings.map((b) => (
          <li key={b.id}>
            {b.treatment.name} — {b.status}
          </li>
        ))}
      </ul>

      <h2 className="mb-3 font-headline text-xl">Notas internas</h2>
      <ul className="mb-4 space-y-3 text-sm">
        {lead.notes.map((n) => (
          <li key={n.id} className="border-b border-outline-variant/20 pb-2">
            <div className="text-xs text-on-surface-variant">{new Date(n.createdAt).toLocaleString()}</div>
            <div>{n.body}</div>
          </li>
        ))}
      </ul>
      <textarea
        className="mb-2 w-full border border-outline-variant/40 p-2 text-sm"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nueva nota…"
      />
      <button type="button" className="bg-on-primary-container px-4 py-2 text-xs uppercase tracking-widest text-surface" onClick={() => void addNote()}>
        Guardar nota
      </button>
    </div>
  );
}
