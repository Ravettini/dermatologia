"use client";

import { useEffect, useState } from "react";
import { parseDdmmyyyyToYmd, ymdToDdmmyyyy } from "@/lib/date-format";

type Props = {
  label: string;
  valueYmd: string;
  onChangeYmd: (ymd: string) => void;
  className?: string;
};

/**
 * Campo de fecha siempre en convención día/mes/año (Argentina).
 * El valor hacia afuera sigue siendo yyyy-MM-dd para la API.
 */
export function DateFieldDdmmyyyy({ label, valueYmd, onChangeYmd, className }: Props) {
  const [text, setText] = useState(() => ymdToDdmmyyyy(valueYmd));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(ymdToDdmmyyyy(valueYmd));
    setError(null);
  }, [valueYmd]);

  function commit() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Ingresá una fecha.");
      setText(ymdToDdmmyyyy(valueYmd));
      return;
    }
    const res = parseDdmmyyyyToYmd(trimmed);
    if (!res.ok) {
      setError(res.message);
      setText(ymdToDdmmyyyy(valueYmd));
      return;
    }
    setError(null);
    onChangeYmd(res.ymd);
  }

  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
      />
      {error ? <p className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </label>
  );
}
