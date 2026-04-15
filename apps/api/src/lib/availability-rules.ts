import { AppError } from "./errors";

export function startOfTodayLocal(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
}

/** No crear turnos cuyo inicio sea ya pasado (incluye hoy si la hora ya pasó). */
export function assertSlotStartNotInPast(startsAt: Date): void {
  if (startsAt.getTime() < Date.now()) {
    throw new AppError(
      400,
      "No se pueden cargar turnos en el pasado. Elegí el día de hoy o una fecha futura y un horario posterior al actual."
    );
  }
}

/** Carga masiva: el día inicial del rango no puede ser anterior a hoy. */
export function assertDateRangeStartsNotBeforeToday(rangeStart: Date): void {
  const today = startOfTodayLocal();
  if (rangeStart < today) {
    throw new AppError(400, "La fecha desde no puede ser anterior a hoy.");
  }
}
