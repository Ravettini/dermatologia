"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Msg = { id: string; role: string; content: string; createdAt: string };

export default function AdminChatDetailPage() {
  const params = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Msg[]>([]);

  useEffect(() => {
    void (async () => {
      const d = await apiFetch<{ conversation: { messages: Msg[] } }>(`/api/admin/chat/conversations/${params.id}`);
      setMessages(d.conversation.messages);
    })();
  }, [params.id]);

  return (
    <div>
      <h1 className="mb-6 font-headline text-3xl">Conversación</h1>
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`rounded border border-outline-variant/30 p-3 text-sm ${m.role === "user" ? "bg-surface-container-high" : ""}`}>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant">{m.role}</div>
            <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
