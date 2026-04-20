"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { buildCrmLeadWhatsAppMessage, phoneToWhatsAppUrl } from "@/lib/whatsapp-booking";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  lastInteractionAt: string;
  _count: { bookings: number };
  chatConversationId: string | null;
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [siteName, setSiteName] = useState("Dermaclinic");

  useEffect(() => {
    void (async () => {
      const d = await apiFetch<{ leads: Lead[] }>("/api/admin/leads");
      setRows(d.leads);
    })();
  }, []);

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
      <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs uppercase tracking-widest text-on-surface-variant">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Origen</th>
              <th className="px-3 py-2">Reservas</th>
              <th className="px-3 py-2">WhatsApp</th>
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
                  <Link className="underline" href={`/admin/leads/${l.id}`}>
                    {l.name}
                  </Link>
                </td>
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
                <td className="px-3 py-2">
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-emerald-600/40 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <span className="text-on-surface-variant">—</span>
                  )}
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
