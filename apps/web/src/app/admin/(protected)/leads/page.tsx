"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  lastInteractionAt: string;
  _count: { bookings: number };
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);

  useEffect(() => {
    void (async () => {
      const d = await apiFetch<{ leads: Lead[] }>("/api/admin/leads");
      setRows(d.leads);
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-headline text-3xl">Contactos / CRM</h1>
      <div className="overflow-x-auto border border-outline-variant/30">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs uppercase tracking-widest text-on-surface-variant">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Origen</th>
              <th className="px-3 py-2">Reservas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-outline-variant/20">
                <td className="px-3 py-2">
                  <Link className="underline" href={`/admin/leads/${l.id}`}>
                    {l.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{l.email}</td>
                <td className="px-3 py-2">{l.phone}</td>
                <td className="px-3 py-2">{l.source}</td>
                <td className="px-3 py-2">{l._count.bookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
