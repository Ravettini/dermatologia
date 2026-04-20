"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const d = await apiFetch<{ settings: Record<string, string> }>("/api/admin/settings");
      setSettings(d.settings);
    })();
  }, []);

  function update(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    await apiFetch("/api/admin/settings", { method: "PATCH", json: settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const keys = [
    "site.name",
    "contact.address",
    "contact.phone",
    "contact.email",
    "contact.hours",
    "contact.mapImageUrl",
    "legal.disclaimer",
    "chatbot.systemPrompt",
    "chatbot.welcomeMessage",
    "chatbot.tone",
    "chatbot.humanHandoffHint",
    "chatbot.fallbackMessage",
  ];

  return (
    <div className="min-w-0">
      <h1 className="mb-6 font-headline text-2xl sm:text-3xl">Configuración del sitio</h1>
      <div className="max-w-3xl space-y-4">
        {keys.map((k) => (
          <label key={k} className="block text-sm">
            <div className="mb-1 text-xs uppercase tracking-widest text-on-surface-variant">{k}</div>
            <textarea
              className="min-w-0 w-full max-w-full border border-outline-variant/40 p-2"
              rows={k.includes("Prompt") || k.includes("disclaimer") ? 5 : 2}
              value={settings[k] ?? ""}
              onChange={(e) => update(k, e.target.value)}
            />
          </label>
        ))}
        <button
          type="button"
          className="bg-on-primary-container px-6 py-3 text-xs uppercase tracking-widest text-surface"
          onClick={() => void save()}
        >
          Guardar
        </button>
        {saved && <p className="text-sm text-secondary">Cambios guardados.</p>}
      </div>
    </div>
  );
}
