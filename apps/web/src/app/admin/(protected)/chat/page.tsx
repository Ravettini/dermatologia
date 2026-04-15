"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Conv = {
  id: string;
  visitorId: string;
  updatedAt: string;
  messages: { content: string }[];
};

export default function AdminChatPage() {
  const [rows, setRows] = useState<Conv[]>([]);

  useEffect(() => {
    void (async () => {
      const d = await apiFetch<{ conversations: Conv[] }>("/api/admin/chat/conversations");
      setRows(d.conversations);
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-headline text-3xl">Conversaciones (chatbot)</h1>
      <ul className="space-y-3 text-sm">
        {rows.map((c) => (
          <li key={c.id} className="border border-outline-variant/30 p-4">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{new Date(c.updatedAt).toLocaleString()}</span>
              <span>{c.visitorId}</span>
            </div>
            <p className="mt-2 line-clamp-2">{c.messages[0]?.content ?? "—"}</p>
            <Link className="mt-2 inline-block text-xs underline" href={`/admin/chat/${c.id}`}>
              Ver conversación
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
