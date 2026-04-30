"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { buildCrmLeadWhatsAppMessage, phoneToWhatsAppUrl } from "@/lib/whatsapp-booking";

type Lead = {
  id: string;
  name: string;
  dni: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  lastInteractionAt: string;
  crmContacted: boolean;
  duplicateIntakeCount: number;
  _count: { bookings: number };
  chatConversationId: string | null;
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [siteName, setSiteName] = useState("Dermaclinic");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [patchErr, setPatchErr] = useState<string | null>(null);

  async function loadLeads() {
    const d = await apiFetch<{ leads: Lead[] }>("/api/admin/leads");
    setRows(d.leads);
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  async function setContacted(id: string, value: boolean) {
    setPatchErr(null);
    setBusyId(id);
    const prev = rows.find((r) => r.id === id);
    setRows((list) => list.map((r) => (r.id === id ? { ...r, crmContacted: value } : r)));
    try {
      await apiFetch(`/api/admin/leads/${id}`, { method: "PATCH", json: { crmContacted: value } });
    } catch (e) {
      setPatchErr(e instanceof Error ? e.message : "No se pudo guardar");
      if (prev) setRows((list) => list.map((r) => (r.id === id ? { ...r, crmContacted: prev.crmContacted } : r)));
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const d = await apiFetch<{ settings: Record<string, string> }>("/api/admin/settings");
        const n = d.settings["site.name"]?.trim();
        if (n) setSiteName(n);
      } catch {
        /* ignorar */
      }
    })();
  }, []);

  return (
    <div className="min-w-0">
      <h1 className="mb-6 font-headline text-2xl sm:text-3xl">Contactos / CRM</h1>
      <p className="mb-4 max-w-2xl text-sm text-on-surface-variant">
        Marcá <strong>Contactado</strong> cuando el equipo ya se comunicó con la persona. Por defecto queda en{" "}
        <strong>No</strong> hasta que alguien lo actualice (al lado del botón de WhatsApp).
      </p>
      {patchErr && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">{patchErr}</p>}
      <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs uppercase tracking-widest text-on-surface-variant">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Origen</th>
              <th className="px-3 py-2">Reservas</th>
              <th className="px-3 py-2">Reingresos</th>
              <th className="min-w-[200px] px-3 py-2 text-right">WhatsApp y seguimiento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const wa =
                l.phone &&
                phoneToWhatsAppUrl(l.phone, buildCrmLeadWhatsAppMessage(l.name, siteName));
              return (
                <tr key={l.id} className="border-t border-outline-variant/20">
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link className="underline" href={`/admin/leads/${l.id}`}>
                        {l.name}
                      </Link>
                      {l.duplicateIntakeCount > 0 ? (
                        <span
                          className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200"
                          title="Volvió a enviar datos desde la web con el mismo DNI; revisá notas automáticas."
                        >
                          Reingreso ×{l.duplicateIntakeCount}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-on-surface-variant">{l.dni || "—"}</td>
                  <td className="px-3 py-2">{l.email}</td>
                  <td className="px-3 py-2">{l.phone}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span>{l.source}</span>
                      {l.source === "CHATBOT" && l.chatConversationId ? (
                        <Link
                          href={`/admin/chat/${l.chatConversationId}`}
                          className="text-xs font-medium text-sky-700 underline hover:text-sky-900"
                        >
                          Ver chat
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">{l._count.bookings}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.duplicateIntakeCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-600/40 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="shrink-0 text-on-surface-variant">—</span>
                      )}
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs text-on-surface">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-secondary"
                          checked={l.crmContacted ?? false}
                          disabled={busyId === l.id}
                          aria-label={`${l.name}: contactado`}
                          onChange={(e) => void setContacted(l.id, e.target.checked)}
                        />
                        <span className="whitespace-nowrap">Contactado</span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
