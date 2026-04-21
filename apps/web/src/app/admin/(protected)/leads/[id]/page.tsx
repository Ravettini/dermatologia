"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type LeadDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  crmContacted: boolean;
  notes: { id: string; body: string; createdAt: string }[];
  bookings: { id: string; status: string; treatment: { name: string } }[];
};

export default function AdminLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState("");
  const [crmBusy, setCrmBusy] = useState(false);
  const [crmErr, setCrmErr] = useState<string | null>(null);

  async function load() {
    const d = await apiFetch<{ lead: LeadDetail }>(`/api/admin/leads/${params.id}`);
    setLead(d.lead);
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
      <h1 className="mb-2 break-words font-headline text-2xl sm:text-3xl">{lead.name}</h1>
      <p className="mb-4 break-words text-sm text-on-surface-variant">
        {lead.email} · {lead.phone}
      </p>

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
