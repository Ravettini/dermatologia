"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { apiFetch } from "@/lib/api";
import { formatYmdToEs } from "@/lib/date-format";
import { AdminButton } from "@/components/admin/admin-button";
import { DateFieldDdmmyyyy } from "@/components/admin/date-field-ddmmyyyy";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  professional: { id: string; name: string };
  treatment: { id: string; name: string };
};

type Professional = { id: string; name: string };
type Treatment = { id: string; name: string; active?: boolean };

const SLOT_STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  BLOCKED: "bg-red-500",
};

export default function AdminAvailabilityPage() {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newProf, setNewProf] = useState("");
  const [newTreat, setNewTreat] = useState("");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("09:45");

  const [bulkFrom, setBulkFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [bulkTo, setBulkTo] = useState(() => format(addMonths(new Date(), 1), "yyyy-MM-dd"));
  const [bulkProf, setBulkProf] = useState("");
  const [bulkTreat, setBulkTreat] = useState("");
  const [bulkStart1, setBulkStart1] = useState("10:00");
  const [bulkEnd1, setBulkEnd1] = useState("10:45");
  const [bulkStart2, setBulkStart2] = useState("16:30");
  const [bulkEnd2, setBulkEnd2] = useState("17:15");
  const [bulkUseSecond, setBulkUseSecond] = useState(true);
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const [delFrom, setDelFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [delTo, setDelTo] = useState(() => format(addMonths(new Date(), 1), "yyyy-MM-dd"));
  const [delProf, setDelProf] = useState("");
  const [delBlocked, setDelBlocked] = useState(false);
  const [delPending, setDelPending] = useState(false);

  const calendarRange = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return { start, end };
  }, [viewMonth]);

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarRange.start, end: calendarRange.end }),
    [calendarRange]
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = format(new Date(s.startsAt), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }
    return map;
  }, [slots]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const from = calendarRange.start.toISOString();
      const to = calendarRange.end.toISOString();
      const d = await apiFetch<{ slots: Slot[] }>(`/api/admin/availability?from=${from}&to=${to}`);
      setSlots(d.slots);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  }, [calendarRange.end, calendarRange.start]);

  useEffect(() => {
    void (async () => {
      try {
        const [p, t] = await Promise.all([
          apiFetch<{ professionals: Professional[] }>("/api/admin/professionals"),
          apiFetch<{ treatments: Treatment[] }>("/api/admin/treatments"),
        ]);
        setProfessionals(p.professionals);
        const activeTreat = t.treatments.filter((x) => x.active !== false);
        setTreatments(activeTreat);
        const firstT = activeTreat[0]?.id ?? "";
        setNewProf((prev) => prev || p.professionals[0]?.id || "");
        setBulkProf((prev) => prev || p.professionals[0]?.id || "");
        setNewTreat((prev) => prev || firstT);
        setBulkTreat((prev) => prev || firstT);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error al cargar datos");
      }
    })();
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (selectedDay && !isSameMonth(selectedDay, viewMonth)) {
      setSelectedDay(null);
    }
  }, [viewMonth, selectedDay]);

  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const daySlots = selectedKey ? slotsByDay.get(selectedKey) ?? [] : [];
  const selectedDayIsPast = selectedDay ? isBefore(startOfDay(selectedDay), startOfDay(new Date())) : false;

  async function addSlotForDay() {
    if (!selectedDay || !newProf || !newTreat) {
      setErr("Elegí día, profesional y tratamiento.");
      return;
    }
    if (isBefore(startOfDay(selectedDay), startOfDay(new Date()))) {
      setErr("No se pueden cargar turnos en fechas pasadas.");
      return;
    }
    setMsg(null);
    const [y, m, d] = [selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()];
    const [sh, sm] = newStart.split(":").map(Number);
    const [eh, em] = newEnd.split(":").map(Number);
    const startsAt = new Date(y, m, d, sh, sm, 0, 0);
    const endsAt = new Date(y, m, d, eh, em, 0, 0);
    if (endsAt <= startsAt) {
      setErr("La hora de fin debe ser posterior al inicio.");
      return;
    }
    if (startsAt.getTime() < Date.now()) {
      setErr("Elegí un horario posterior al momento actual.");
      return;
    }
    await apiFetch("/api/admin/availability", {
      method: "POST",
      json: {
        professionalId: newProf,
        treatmentId: newTreat,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      },
    });
    setMsg("Turno agregado.");
    await loadSlots();
  }

  async function removeSlot(id: string) {
    if (!confirm("¿Eliminar este horario de la agenda?")) return;
    await apiFetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    await loadSlots();
  }

  function toggleWeekday(day: number) {
    setWeekdays((w) => (w.includes(day) ? w.filter((x) => x !== day) : [...w, day].sort()));
  }

  async function runBulk() {
    setErr(null);
    setMsg(null);
    try {
      if (!bulkProf || !bulkTreat || weekdays.length === 0) {
        setErr("Seleccioná profesional, tratamiento y al menos un día de la semana.");
        return;
      }
      const todayYmd = format(new Date(), "yyyy-MM-dd");
      if (bulkFrom < todayYmd) {
        setErr("La fecha desde no puede ser anterior a hoy.");
        return;
      }
      const templates = [{ start: bulkStart1, end: bulkEnd1 }];
      if (bulkUseSecond) templates.push({ start: bulkStart2, end: bulkEnd2 });
      const res = await apiFetch<{ created: number; totalGenerated: number; skippedPast?: number }>(
        "/api/admin/availability/batch",
        {
          method: "POST",
          json: {
            professionalId: bulkProf,
            treatmentId: bulkTreat,
            dateFrom: bulkFrom,
            dateTo: bulkTo,
            weekdays,
            slotTemplates: templates,
            skipDuplicates: true,
          },
        }
      );
      const skipped = res.skippedPast ? ` · ${res.skippedPast} ya pasados omitidos` : "";
      setMsg(`Listo: se crearon ${res.created} turnos (${res.totalGenerated} combinaciones evaluadas)${skipped}.`);
      await loadSlots();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo generar la carga masiva.");
    }
  }

  async function runBulkDelete() {
    setErr(null);
    setMsg(null);
    const statuses: string[] = ["AVAILABLE"];
    if (delBlocked) statuses.push("BLOCKED");
    if (delPending) statuses.push("PENDING");

    const lines = [
      `Se eliminarán horarios con estado: ${statuses.join(", ")}`,
      `entre ${formatYmdToEs(delFrom)} y ${formatYmdToEs(delTo)}`,
      delProf ? "solo del profesional seleccionado." : "de todos los profesionales.",
    ];
    if (delPending) {
      lines.push("Atención: incluye solicitudes pendientes; puede haber reservas en curso.");
    }
    if (!confirm(`${lines.join(" ")}\n\n¿Continuar?`)) return;

    try {
      const res = await apiFetch<{ deleted: number }>("/api/admin/availability/bulk-delete", {
        method: "POST",
        json: {
          dateFrom: delFrom,
          dateTo: delTo,
          professionalId: delProf || undefined,
          statuses,
        },
      });
      setMsg(`Eliminados ${res.deleted} horario(s).`);
      await loadSlots();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo eliminar en bloque.");
    }
  }

  return (
    <div className="min-w-0 space-y-8" lang="es-AR">
      <div>
        <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Calendario y disponibilidad</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          <strong className="text-emerald-800">Verde</strong> = libre en web · <strong className="text-amber-700">Ámbar</strong> = solicitud
          pendiente · <strong className="text-sky-800">Azul</strong> = turno ya confirmado ·{" "}
          <strong className="text-red-700">Rojo</strong> = bloqueado. Cada cupo va asociado a un <strong>tratamiento</strong>{" "}
          (obligatorio al cargar). No se pueden crear turnos en el pasado; los cupos libres vencidos quedan bloqueados y no
          se ofrecen en la web.
        </p>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}
      {msg && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">{msg}</p>}

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AdminButton variant="ghost" className="!px-2" onClick={() => setViewMonth((m) => addMonths(m, -1))}>
              ‹
            </AdminButton>
            <h2 className="min-w-[180px] text-center font-headline text-xl capitalize text-slate-900">
              {format(viewMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <AdminButton variant="ghost" className="!px-2" onClick={() => setViewMonth((m) => addMonths(m, 1))}>
              ›
            </AdminButton>
            <AdminButton variant="ghost" className="text-xs" onClick={() => setViewMonth(new Date())}>
              Hoy
            </AdminButton>
          </div>
          <span className="text-xs text-slate-500">{loading ? "Actualizando…" : `${slots.length} horarios en esta vista`}</span>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 md:mx-0 md:overflow-visible md:px-0">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-slate-500">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, viewMonth);
            const dayPast = isBefore(startOfDay(day), startOfDay(new Date()));
            const list = slotsByDay.get(key) ?? [];
            const counts = list.reduce(
              (acc, s) => {
                acc[s.status] = (acc[s.status] ?? 0) + 1;
                return acc;
              },
              {} as Record<string, number>
            );
            const selected =
              selectedDay && format(selectedDay, "yyyy-MM-dd") === key ? "ring-2 ring-sky-500 ring-offset-2" : "";

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex min-h-[72px] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[88px] sm:p-2 ${
                  inMonth ? "border-slate-200 bg-white hover:bg-slate-50" : "border-transparent bg-slate-50/60 text-slate-400"
                } ${dayPast ? "opacity-60" : ""} ${isToday(day) ? "border-sky-300 bg-sky-50/50" : ""} ${selected}`}
              >
                <span className={`text-sm font-semibold ${inMonth ? "text-slate-900" : ""}`}>{format(day, "d")}</span>
                <div className="mt-auto flex flex-wrap gap-1">
                  {Object.entries(counts).map(([st, n]) => (
                    <span
                      key={st}
                      className={`h-2 w-2 rounded-full ${SLOT_STATUS_STYLE[st] ?? "bg-slate-300"}`}
                      title={`${st}: ${n}`}
                    />
                  ))}
                  {list.length > 0 && <span className="text-[10px] text-slate-500">{list.length}</span>}
                </div>
              </button>
            );
          })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
          {(["AVAILABLE", "PENDING", "CONFIRMED", "BLOCKED"] as const).map((st) => (
            <span key={st} className="inline-flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${SLOT_STATUS_STYLE[st]}`} />
              {st === "AVAILABLE" && "Disponible web"}
              {st === "PENDING" && "Pendiente"}
              {st === "CONFIRMED" && "Confirmado"}
              {st === "BLOCKED" && "Bloqueado"}
            </span>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h3 className="font-headline text-xl text-slate-900">
            Día seleccionado: {format(selectedDay, "EEEE d MMMM", { locale: es })}
          </h3>
          <p className="mt-1 text-sm text-slate-500">Horarios cargados para ese día</p>

          <div className="mt-4 space-y-2">
            {daySlots.length === 0 && <p className="text-sm text-slate-500">No hay horarios. Agregá uno abajo o usá la carga masiva.</p>}
            {daySlots.map((s) => {
              const slotStarted = new Date(s.startsAt).getTime() < Date.now();
              return (
                <div
                  key={s.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 ${
                    slotStarted ? "bg-slate-100/90 opacity-90" : "bg-slate-50/80"
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {format(new Date(s.startsAt), "HH:mm")} – {format(new Date(s.endsAt), "HH:mm")}
                    </div>
                    <div className="text-xs text-slate-600">
                      {s.professional.name} · {s.treatment.name}
                      {slotStarted && <span className="ml-2 text-slate-500">(pasado)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block min-w-[5rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold text-white shadow-sm ${
                        SLOT_STATUS_STYLE[s.status] ?? "bg-slate-400"
                      }`}
                    >
                      {s.status}
                    </span>
                    <AdminButton variant="danger" className="!px-2 !py-1 text-xs" onClick={() => void removeSlot(s.id)}>
                      Quitar
                    </AdminButton>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-800">Agregar turnos este día</h4>
            {selectedDayIsPast && (
              <p className="mt-2 text-sm text-amber-800">
                Este día ya pasó: no se pueden cargar cupos nuevos. Podés ver o quitar horarios históricos.
              </p>
            )}
            <div className={`mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4 ${selectedDayIsPast ? "pointer-events-none opacity-50" : ""}`}>
              <label className="text-xs font-medium text-slate-600">
                Profesional
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newProf}
                  onChange={(e) => setNewProf(e.target.value)}
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Tratamiento
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newTreat}
                  onChange={(e) => setNewTreat(e.target.value)}
                  disabled={treatments.length === 0}
                >
                  {treatments.length === 0 ? (
                    <option value="">Sin tratamientos activos</option>
                  ) : (
                    treatments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Desde
                <input
                  type="time"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                Hasta
                <input
                  type="time"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                />
              </label>
            </div>
            <AdminButton variant="success" className="mt-4" disabled={selectedDayIsPast} onClick={() => void addSlotForDay()}>
              Guardar turno en este día
            </AdminButton>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/40 p-6">
        <h3 className="font-headline text-xl text-slate-900">Carga masiva (varios días)</h3>
        <p className="mt-2 text-sm text-slate-600">
          Generá los mismos horarios en un rango de fechas, solo en los días de la semana que elijas (por ejemplo lun–vie).
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DateFieldDdmmyyyy label="Desde (día / mes / año)" valueYmd={bulkFrom} onChangeYmd={setBulkFrom} />
          <DateFieldDdmmyyyy label="Hasta (día / mes / año)" valueYmd={bulkTo} onChangeYmd={setBulkTo} />
          <label className="text-xs font-medium text-slate-700">
            Profesional
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={bulkProf}
              onChange={(e) => setBulkProf(e.target.value)}
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-700">
            Tratamiento
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={bulkTreat}
              onChange={(e) => setBulkTreat(e.target.value)}
              disabled={treatments.length === 0}
            >
              {treatments.length === 0 ? (
                <option value="">Sin tratamientos activos</option>
              ) : (
                treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-700">Días de la semana</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { n: 1, l: "Lun" },
              { n: 2, l: "Mar" },
              { n: 3, l: "Mié" },
              { n: 4, l: "Jue" },
              { n: 5, l: "Vie" },
              { n: 6, l: "Sáb" },
              { n: 0, l: "Dom" },
            ].map((d) => (
              <button
                key={d.n}
                type="button"
                onClick={() => toggleWeekday(d.n)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  weekdays.includes(d.n) ? "bg-sky-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-xs font-semibold text-slate-700">Franja 1</p>
            <div className="mt-2 flex gap-2">
              <input type="time" className="rounded-lg border border-slate-200 px-2 py-2 text-sm" value={bulkStart1} onChange={(e) => setBulkStart1(e.target.value)} />
              <span className="self-center text-slate-400">→</span>
              <input type="time" className="rounded-lg border border-slate-200 px-2 py-2 text-sm" value={bulkEnd1} onChange={(e) => setBulkEnd1(e.target.value)} />
            </div>
          </div>
          <div className={`rounded-xl bg-white p-4 ring-1 ring-slate-200 ${!bulkUseSecond ? "opacity-50" : ""}`}>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={bulkUseSecond} onChange={(e) => setBulkUseSecond(e.target.checked)} />
              Franja 2 (opcional, ej. tarde)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="time"
                disabled={!bulkUseSecond}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={bulkStart2}
                onChange={(e) => setBulkStart2(e.target.value)}
              />
              <span className="self-center text-slate-400">→</span>
              <input
                type="time"
                disabled={!bulkUseSecond}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={bulkEnd2}
                onChange={(e) => setBulkEnd2(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AdminButton variant="primary" className="mt-6" onClick={() => void runBulk()}>
          Generar turnos en bloque
        </AdminButton>
      </div>

      <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6">
        <h3 className="font-headline text-xl text-slate-900">Eliminación masiva</h3>
        <p className="mt-2 text-sm text-slate-600">
          Quitá de la agenda muchos horarios a la vez. Por defecto solo se borran cupos <strong>libres</strong> (aún no
          confirmados con paciente). Los turnos ya confirmados no se eliminan desde aquí.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DateFieldDdmmyyyy label="Desde (día / mes / año)" valueYmd={delFrom} onChangeYmd={setDelFrom} />
          <DateFieldDdmmyyyy label="Hasta (día / mes / año)" valueYmd={delTo} onChangeYmd={setDelTo} />
          <label className="text-xs font-medium text-slate-800 md:col-span-2">
            Profesional (opcional)
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={delProf}
              onChange={(e) => setDelProf(e.target.value)}
            >
              <option value="">Todos los profesionales</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-white/80 p-4 text-sm text-slate-700 ring-1 ring-red-100">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delBlocked} onChange={(e) => setDelBlocked(e.target.checked)} />
            Incluir también horarios <strong>bloqueados</strong> (BLOCKED)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delPending} onChange={(e) => setDelPending(e.target.checked)} />
            Incluir horarios <strong>pendientes de confirmación</strong> (PENDING) — usá solo si sabés que no hay reserva
            válida
          </label>
        </div>

        <AdminButton variant="danger" className="mt-6" onClick={() => void runBulkDelete()}>
          Eliminar horarios en bloque
        </AdminButton>
      </div>
    </div>
  );
}
