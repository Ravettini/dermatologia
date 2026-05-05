import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dniSchema, dniToStore } from "@derma/shared";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";
import { signAdminToken } from "../lib/jwt";
import { AppError, friendlyError } from "../lib/errors";
import { getAllSettingsMap, invalidateSettingsCache } from "../lib/settings";
import { sanitizeText } from "../lib/sanitize";
import { BookingStatus, LeadSource, Prisma, SlotStatus } from "@prisma/client";
import { emailPatientBookingCanceled, emailPatientBookingConfirmed } from "../lib/email";
import {
  assertDateRangeStartsNotBeforeToday,
  assertSlotStartNotInPast,
} from "../lib/availability-rules";
import { parseExportFormat, sendTable } from "../lib/export-format";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Vercel + API en otro dominio (p. ej. Render): el fetch es cross-site; hace falta SameSite=None + Secure. */
function adminTokenCookieBase(): {
  httpOnly: true;
  sameSite: "lax" | "none";
  secure: boolean;
  path: "/";
} {
  const frontend = (process.env.FRONTEND_URL || "").trim();
  const isLocal =
    !frontend ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\b/i.test(frontend);
  const crossSite = process.env.NODE_ENV === "production" && !isLocal;
  return {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite ? true : process.env.NODE_ENV === "production",
    path: "/",
  };
}

router.post("/auth/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos");
    const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (!admin || !bcrypt.compareSync(parsed.data.password, admin.passwordHash)) {
      throw new AppError(401, "Credenciales inválidas");
    }
    const token = signAdminToken({ sub: admin.id, email: admin.email });
    res.cookie("admin_token", token, {
      ...adminTokenCookieBase(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ ok: true, email: admin.email, name: admin.name });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("admin_token", adminTokenCookieBase());
  res.json({ ok: true });
});

router.get("/auth/me", requireAdmin, (req, res) => {
  res.json({ ok: true, email: req.admin?.email });
});

router.use(requireAdmin);

router.get("/dashboard", async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      pending,
      newReq,
      confirmedToday,
      canceled,
      bySource,
      topTreatments,
      weekCount,
      monthCount,
      upcomingBookingsRaw,
    ] = await Promise.all([
      prisma.bookingRequest.count({ where: { status: BookingStatus.PENDING_CONFIRMATION } }),
      prisma.bookingRequest.count({ where: { status: BookingStatus.NEW } }),
      prisma.bookingRequest.count({
        where: { status: BookingStatus.CONFIRMED, updatedAt: { gte: startOfDay } },
      }),
      prisma.bookingRequest.count({ where: { status: BookingStatus.CANCELED } }),
      prisma.bookingRequest.groupBy({
        by: ["source"],
        _count: { _all: true },
      }),
      prisma.bookingRequest.groupBy({
        by: ["treatmentId"],
        _count: { _all: true },
        orderBy: { _count: { treatmentId: "desc" } },
        take: 5,
      }),
      prisma.bookingRequest.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.bookingRequest.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.bookingRequest.findMany({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED] },
          availabilitySlot: { startsAt: { gte: now } },
        },
        select: {
          id: true,
          status: true,
          contactLead: { select: { name: true, phone: true, email: true, dni: true } },
          treatment: { select: { name: true } },
          professional: { select: { name: true } },
          availabilitySlot: { select: { startsAt: true } },
        },
        orderBy: { availabilitySlot: { startsAt: "asc" } },
        take: 30,
      }),
    ]);

    const treatmentIds = topTreatments.map((t) => t.treatmentId);
    const treatments = await prisma.treatment.findMany({
      where: { id: { in: treatmentIds } },
      select: { id: true, name: true },
    });
    const tmap = new Map(treatments.map((t) => [t.id, t.name]));

    const upcomingBookings = upcomingBookingsRaw
      .filter((b) => b.availabilitySlot)
      .map((b) => ({
        id: b.id,
        status: b.status,
        startsAt: b.availabilitySlot!.startsAt.toISOString(),
        patientName: b.contactLead.name,
        patientPhone: b.contactLead.phone,
        patientEmail: b.contactLead.email,
        patientDni: b.contactLead.dni,
        treatmentName: b.treatment.name,
        professionalName: b.professional?.name ?? null,
      }));

    res.json({
      metrics: {
        pendingConfirmation: pending,
        newRequests: newReq,
        confirmedToday,
        canceledTotal: canceled,
        bookingsLastWeek: weekCount,
        bookingsLastMonth: monthCount,
      },
      upcomingBookings,
      bySource: bySource.map((b) => ({ source: b.source, count: b._count._all })),
      topTreatments: topTreatments.map((t) => ({
        treatmentId: t.treatmentId,
        name: tmap.get(t.treatmentId) ?? t.treatmentId,
        count: t._count._all,
      })),
    });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const raw = req.query.status;
    const statusesRaw = req.query.statuses;
    let statusFilter: BookingStatus | { in: BookingStatus[] } | undefined;

    if (typeof statusesRaw === "string" && statusesRaw.length > 0) {
      const parts = statusesRaw.split(",").map((s) => s.trim()) as BookingStatus[];
      const valid = parts.filter((s) => Object.values(BookingStatus).includes(s));
      if (valid.length === 1) statusFilter = valid[0];
      else if (valid.length > 1) statusFilter = { in: valid };
    } else if (typeof raw === "string" && raw.length > 0) {
      statusFilter = raw as BookingStatus;
    }

    const list = await prisma.bookingRequest.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        contactLead: true,
        treatment: true,
        professional: true,
        availabilitySlot: true,
      },
      take: 300,
    });
    res.json({ bookings: list });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

const manualBookingSchema = z
  .object({
    availabilitySlotId: z.string().min(1),
    contactLeadId: z.string().optional(),
    dni: dniSchema,
    name: z.string().max(120).optional(),
    email: z.union([z.string().email(), z.literal("")]).optional(),
    phone: z.string().max(40).optional(),
    confirmed: z.boolean().optional().default(true),
    patientMessage: z.string().max(2000).optional(),
    notifyPatientEmail: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.contactLeadId) return;
    if (!data.name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre requerido.", path: ["name"] });
    }
    if (!data.email?.trim() && !data.phone?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indicá al menos email o teléfono.", path: ["phone"] });
    }
  });

router.post("/bookings/manual", async (req, res) => {
  try {
    const parsed = manualBookingSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos");

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: parsed.data.availabilitySlotId },
    });
    if (!slot || slot.status !== SlotStatus.AVAILABLE) {
      throw new AppError(409, "Ese horario no está disponible. Elegí otro cupo.");
    }
    if (slot.startsAt.getTime() < Date.now()) {
      throw new AppError(400, "No se puede asignar un horario que ya pasó.");
    }

    let contactLeadId: string;
    let leadEmail: string | null;
    let leadName: string;

    const dniStored = dniToStore(parsed.data.dni);

    if (parsed.data.contactLeadId) {
      const lead = await prisma.contactLead.findUnique({ where: { id: parsed.data.contactLeadId } });
      if (!lead) throw new AppError(404, "Contacto no encontrado.");
      contactLeadId = lead.id;
      leadEmail = lead.email;
      leadName = lead.name;
      await prisma.contactLead.update({
        where: { id: lead.id },
        data: { dni: dniStored, lastInteractionAt: new Date() },
      });
    } else {
      const existingByDni = await prisma.contactLead.findUnique({ where: { dni: dniStored } });
      if (existingByDni) {
        const updated = await prisma.contactLead.update({
          where: { id: existingByDni.id },
          data: {
            name: sanitizeText(parsed.data.name!.trim(), 120),
            email: parsed.data.email?.trim() ? sanitizeText(parsed.data.email.trim(), 255) : null,
            phone: parsed.data.phone?.trim() ? sanitizeText(parsed.data.phone.trim(), 40) : null,
            lastInteractionAt: new Date(),
          },
        });
        contactLeadId = updated.id;
        leadEmail = updated.email;
        leadName = updated.name;
      } else {
        const lead = await prisma.contactLead.create({
          data: {
            name: sanitizeText(parsed.data.name!.trim(), 120),
            dni: dniStored,
            email: parsed.data.email?.trim() ? sanitizeText(parsed.data.email.trim(), 255) : null,
            phone: parsed.data.phone?.trim() ? sanitizeText(parsed.data.phone.trim(), 40) : null,
            source: LeadSource.MANUAL,
            lastInteractionAt: new Date(),
          },
        });
        contactLeadId = lead.id;
        leadEmail = lead.email;
        leadName = lead.name;
      }
    }

    const confirmed = parsed.data.confirmed !== false;
    const bookingStatus = confirmed ? BookingStatus.CONFIRMED : BookingStatus.PENDING_CONFIRMATION;
    const slotStatusNext = confirmed ? SlotStatus.CONFIRMED : SlotStatus.PENDING;

    const booking = await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { status: slotStatusNext },
      });
      return tx.bookingRequest.create({
        data: {
          contactLeadId,
          treatmentId: slot.treatmentId,
          professionalId: slot.professionalId,
          availabilitySlotId: slot.id,
          status: bookingStatus,
          source: LeadSource.MANUAL,
          patientMessage: parsed.data.patientMessage?.trim()
            ? sanitizeText(parsed.data.patientMessage, 2000)
            : null,
          consentAccepted: true,
        },
        include: {
          contactLead: true,
          treatment: true,
          professional: true,
          availabilitySlot: true,
        },
      });
    });

    if (confirmed && parsed.data.notifyPatientEmail !== false && leadEmail?.trim()) {
      const settings = await getAllSettingsMap();
      const clinicAddress = settings.get("contact.address")?.trim() || "Camino Boulogne Bancalari 3350, Victoria";
      const clinicPhone = settings.get("contact.phone")?.trim() || "+54 9 11 2699-2405";
      const siteUrl = process.env.WEB_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
      const logoUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/branding/logo-tod.png` : null;

      void emailPatientBookingConfirmed({
        to: leadEmail,
        patientName: leadName,
        treatmentName: booking.treatment?.name ?? "Turno",
        professionalName: booking.professional?.name ?? null,
        startsAtIso: booking.availabilitySlot?.startsAt?.toISOString() ?? null,
        clinicAddress,
        clinicPhone,
        logoUrl,
      });
    }

    res.status(201).json({ booking });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
      include: {
        contactLead: { include: { notes: { orderBy: { createdAt: "desc" }, take: 20 } } },
        treatment: true,
        professional: true,
        availabilitySlot: true,
      },
    });
    if (!booking) throw new AppError(404, "No encontrado");
    res.json({ booking });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

const patchBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  internalNotes: z.string().max(8000).optional(),
  availabilitySlotId: z.string().optional().nullable(),
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const parsed = patchBookingSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos");
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
      include: {
        availabilitySlot: true,
        contactLead: true,
        treatment: true,
        professional: true,
      },
    });
    if (!booking) throw new AppError(404, "No encontrado");

    await prisma.$transaction(async (tx) => {
      if (parsed.data.availabilitySlotId && parsed.data.availabilitySlotId !== booking.availabilitySlotId) {
        const newSlot = await tx.availabilitySlot.findUnique({
          where: { id: parsed.data.availabilitySlotId },
        });
        if (!newSlot || newSlot.status !== SlotStatus.AVAILABLE) {
          throw new AppError(409, "El nuevo horario no está disponible");
        }
        if (newSlot.treatmentId !== booking.treatmentId) {
          throw new AppError(400, "El cupo es de otro tratamiento. Elegí un horario del mismo tratamiento.");
        }
        if (booking.status === BookingStatus.CANCELED || booking.status === BookingStatus.CLOSED) {
          throw new AppError(400, "No se puede reprogramar una reserva cancelada o cerrada.");
        }

        const wasConfirmed = booking.status === BookingStatus.CONFIRMED;
        const keepPendingFamily =
          booking.status === BookingStatus.PENDING_CONFIRMATION ||
          booking.status === BookingStatus.NEW ||
          booking.status === BookingStatus.CONTACT_PENDING ||
          booking.status === BookingStatus.CONTACTED;

        const nextSlotStatus = wasConfirmed ? SlotStatus.CONFIRMED : SlotStatus.PENDING;
        const nextBookingStatus = wasConfirmed
          ? BookingStatus.CONFIRMED
          : keepPendingFamily
            ? booking.status
            : booking.status === BookingStatus.RESCHEDULED
              ? BookingStatus.RESCHEDULED
              : BookingStatus.RESCHEDULED;

        if (booking.availabilitySlotId) {
          await tx.availabilitySlot.update({
            where: { id: booking.availabilitySlotId },
            data: { status: SlotStatus.AVAILABLE },
          });
        }
        await tx.availabilitySlot.update({
          where: { id: newSlot.id },
          data: { status: nextSlotStatus },
        });
        await tx.bookingRequest.update({
          where: { id: booking.id },
          data: {
            availabilitySlotId: newSlot.id,
            professionalId: newSlot.professionalId,
            status: nextBookingStatus,
            internalNotes: parsed.data.internalNotes ?? booking.internalNotes,
          },
        });
        return;
      }

      let slotUpdate: { status: SlotStatus } | undefined;
      if (parsed.data.status === BookingStatus.CONFIRMED) slotUpdate = { status: SlotStatus.CONFIRMED };
      if (parsed.data.status === BookingStatus.CANCELED || parsed.data.status === BookingStatus.CLOSED) {
        slotUpdate = { status: SlotStatus.AVAILABLE };
      }

      if (slotUpdate && booking.availabilitySlotId) {
        await tx.availabilitySlot.update({
          where: { id: booking.availabilitySlotId },
          data: slotUpdate,
        });
      }

      await tx.bookingRequest.update({
        where: { id: booking.id },
        data: {
          status: parsed.data.status ?? undefined,
          internalNotes: parsed.data.internalNotes ?? undefined,
        },
      });
    });

    const updated = await prisma.bookingRequest.findUnique({
      where: { id: req.params.id },
      include: {
        availabilitySlot: true,
        contactLead: true,
        treatment: true,
        professional: true,
      },
    });

    if (
      parsed.data.status === BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.CONFIRMED &&
      updated?.contactLead?.email
    ) {
      const settings = await getAllSettingsMap();
      const clinicAddress = settings.get("contact.address")?.trim() || "Camino Boulogne Bancalari 3350, Victoria";
      const clinicPhone = settings.get("contact.phone")?.trim() || "+54 9 11 2699-2405";
      const siteUrl = process.env.WEB_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
      const logoUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/branding/logo-tod.png` : null;

      void emailPatientBookingConfirmed({
        to: updated.contactLead.email,
        patientName: updated.contactLead.name,
        treatmentName: updated.treatment?.name ?? "Turno confirmado",
        professionalName: updated.professional?.name ?? null,
        startsAtIso: updated.availabilitySlot?.startsAt?.toISOString() ?? null,
        clinicAddress,
        clinicPhone,
        logoUrl,
      });
    }

    if (
      parsed.data.status === BookingStatus.CANCELED &&
      booking.status !== BookingStatus.CANCELED &&
      updated?.contactLead?.email
    ) {
      const settings = await getAllSettingsMap();
      const clinicPhone = settings.get("contact.phone")?.trim() || "+54 9 11 2699-2405";

      void emailPatientBookingCanceled({
        to: updated.contactLead.email,
        patientName: updated.contactLead.name,
        treatmentName: updated.treatment?.name ?? "Turno",
        professionalName: updated.professional?.name ?? null,
        startsAtIso: updated.availabilitySlot?.startsAt?.toISOString() ?? null,
        clinicPhone,
      });
    }

    res.json({ booking: updated });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/availability", async (req, res) => {
  try {
    await prisma.availabilitySlot.updateMany({
      where: { status: SlotStatus.AVAILABLE, startsAt: { lt: new Date() } },
      data: { status: SlotStatus.BLOCKED },
    });

    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    const to = req.query.to
      ? new Date(String(req.query.to))
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const slotStatusQ = typeof req.query.slotStatus === "string" ? req.query.slotStatus : "";
    const treatmentIdQ = typeof req.query.treatmentId === "string" ? req.query.treatmentId.trim() : "";

    const where: Prisma.AvailabilitySlotWhereInput = {
      startsAt: { gte: from, lte: to },
    };
    if (slotStatusQ === "AVAILABLE") where.status = SlotStatus.AVAILABLE;
    if (treatmentIdQ) where.treatmentId = treatmentIdQ;

    const slots = await prisma.availabilitySlot.findMany({
      where,
      include: { professional: true, treatment: true },
      orderBy: { startsAt: "asc" },
    });
    res.json({ slots });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

const slotCreateSchema = z.object({
  professionalId: z.string(),
  treatmentId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: z.nativeEnum(SlotStatus).optional(),
});

router.post("/availability", async (req, res) => {
  try {
    const parsed = slotCreateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos");
    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    assertSlotStartNotInPast(startsAt);
    if (endsAt <= startsAt) throw new AppError(400, "La hora de fin debe ser posterior al inicio.");
    const slot = await prisma.availabilitySlot.create({
      data: {
        professionalId: parsed.data.professionalId,
        treatmentId: parsed.data.treatmentId,
        startsAt,
        endsAt,
        status: parsed.data.status ?? SlotStatus.AVAILABLE,
      },
    });
    res.status(201).json({ slot });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

const batchAvailabilitySchema = z.object({
  professionalId: z.string().min(1),
  treatmentId: z.string().min(1),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** 0 = domingo … 6 = sábado (igual que Date#getDay) */
  weekdays: z.array(z.number().int().min(0).max(6)).min(1),
  slotTemplates: z
    .array(
      z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .min(1),
  skipDuplicates: z.boolean().optional(),
});

function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function combineLocalDateTime(day: Date, hm: string): Date {
  const [hh, mm] = hm.split(":").map(Number);
  const x = new Date(day);
  x.setHours(hh, mm, 0, 0);
  return x;
}

router.post("/availability/batch", async (req, res) => {
  try {
    const parsed = batchAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos para carga masiva");
    const { professionalId, treatmentId, dateFrom, dateTo, weekdays, slotTemplates, skipDuplicates } = parsed.data;

    const from = parseYmdLocal(dateFrom);
    const to = parseYmdLocal(dateTo);
    if (from > to) throw new AppError(400, "La fecha desde debe ser anterior a hasta");
    assertDateRangeStartsNotBeforeToday(from);

    const rows: { professionalId: string; treatmentId: string; startsAt: Date; endsAt: Date; status: SlotStatus }[] = [];

    const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cur <= end) {
      const wd = cur.getDay();
      if (weekdays.includes(wd)) {
        for (const t of slotTemplates) {
          const startsAt = combineLocalDateTime(cur, t.start);
          const endsAt = combineLocalDateTime(cur, t.end);
          if (endsAt <= startsAt) continue;
          rows.push({
            professionalId,
            treatmentId,
            startsAt,
            endsAt,
            status: SlotStatus.AVAILABLE,
          });
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    const now = Date.now();
    const futureRows = rows.filter((r) => r.startsAt.getTime() >= now);

    if (futureRows.length === 0) {
      res.status(201).json({
        created: 0,
        totalGenerated: rows.length,
        skippedPast: rows.length > 0 ? rows.length : 0,
      });
      return;
    }

    const minStart = new Date(Math.min(...futureRows.map((r) => r.startsAt.getTime())));
    const maxStart = new Date(Math.max(...futureRows.map((r) => r.startsAt.getTime())));

    const existingRows = await prisma.availabilitySlot.findMany({
      where: {
        professionalId,
        startsAt: { gte: minStart, lte: maxStart },
      },
      select: { startsAt: true },
    });
    const existingTimes = new Set(existingRows.map((e) => e.startsAt.getTime()));

    let toCreate = futureRows;
    if (skipDuplicates !== false) {
      toCreate = futureRows.filter((r) => !existingTimes.has(r.startsAt.getTime()));
    }

    const seen = new Set<number>();
    toCreate = toCreate.filter((r) => {
      const t = r.startsAt.getTime();
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });

    if (toCreate.length === 0) {
      res.status(201).json({
        created: 0,
        totalGenerated: rows.length,
        skippedPast: rows.length - futureRows.length,
      });
      return;
    }

    const result = await prisma.availabilitySlot.createMany({ data: toCreate });

    res.status(201).json({
      created: result.count,
      totalGenerated: rows.length,
      skippedPast: rows.length - futureRows.length,
    });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

const bulkDeleteAvailabilitySchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  professionalId: z.string().optional(),
  /** Por defecto solo horarios aún libres (AVAILABLE). */
  statuses: z.array(z.nativeEnum(SlotStatus)).optional(),
});

router.post("/availability/bulk-delete", async (req, res) => {
  try {
    const parsed = bulkDeleteAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos para eliminación masiva");
    const { dateFrom, dateTo, professionalId } = parsed.data;
    const statuses = parsed.data.statuses?.length ? parsed.data.statuses : [SlotStatus.AVAILABLE];

    const fromStart = parseYmdLocal(dateFrom);
    const toDay = parseYmdLocal(dateTo);
    if (fromStart > toDay) throw new AppError(400, "La fecha desde debe ser anterior a hasta");

    const toEnd = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate(), 23, 59, 59, 999);

    const result = await prisma.availabilitySlot.deleteMany({
      where: {
        startsAt: { gte: fromStart, lte: toEnd },
        status: { in: statuses },
        ...(professionalId ? { professionalId } : {}),
      },
    });

    res.json({ deleted: result.count });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.patch("/availability/:id", async (req, res) => {
  try {
    const body = z
      .object({
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        status: z.nativeEnum(SlotStatus).optional(),
        treatmentId: z.string().min(1).optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    if (body.data.startsAt) assertSlotStartNotInPast(new Date(body.data.startsAt));
    const slot = await prisma.availabilitySlot.update({
      where: { id: req.params.id },
      data: {
        startsAt: body.data.startsAt ? new Date(body.data.startsAt) : undefined,
        endsAt: body.data.endsAt ? new Date(body.data.endsAt) : undefined,
        status: body.data.status,
        treatmentId: body.data.treatmentId,
      },
    });
    res.json({ slot });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.delete("/availability/:id", async (req, res) => {
  try {
    await prisma.availabilitySlot.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/leads", async (_req, res) => {
  try {
    const rows = await prisma.contactLead.findMany({
      orderBy: { updatedAt: "desc" },
      take: 300,
      include: {
        _count: { select: { bookings: true } },
        chatConversations: {
          select: { id: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });
    const leads = rows.map((l) => {
      const { chatConversations, ...rest } = l;
      return {
        ...rest,
        chatConversationId: chatConversations[0]?.id ?? null,
      };
    });
    res.json({ leads });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const lead = await prisma.contactLead.findUnique({
      where: { id: req.params.id },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        bookings: { orderBy: { createdAt: "desc" }, include: { treatment: true } },
      },
    });
    if (!lead) throw new AppError(404, "No encontrado");
    res.json({ lead });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(2).optional(),
        dni: z.union([dniSchema, z.literal(""), z.null()]).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        crmContacted: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    const dniNext =
      body.data.dni === undefined
        ? undefined
        : body.data.dni === "" || body.data.dni === null
          ? null
          : dniToStore(body.data.dni);
    const lead = await prisma.contactLead.update({
      where: { id: req.params.id },
      data: {
        name: body.data.name,
        ...(dniNext !== undefined ? { dni: dniNext } : {}),
        email: body.data.email ?? undefined,
        phone: body.data.phone ?? undefined,
        ...(body.data.crmContacted !== undefined ? { crmContacted: body.data.crmContacted } : {}),
        lastInteractionAt: new Date(),
      },
    });
    res.json({ lead });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/leads/:id/notes", async (req, res) => {
  try {
    const body = z.object({ body: z.string().min(1).max(8000) }).safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    const adminId = req.admin?.sub;
    const note = await prisma.leadNote.create({
      data: {
        contactId: req.params.id,
        body: sanitizeText(body.data.body, 8000),
        adminId: adminId ?? null,
      },
    });
    res.status(201).json({ note });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/professionals", async (_req, res) => {
  try {
    const professionals = await prisma.professional.findMany({
      orderBy: { sortOrder: "asc" },
      where: { deletedAt: null },
      include: { specialtyTreatment: { select: { id: true, name: true, slug: true } } },
    });
    res.json({ professionals });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/professionals", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(2),
        /** Tratamiento de la pestaña Tratamientos: define la especialidad mostrada. */
        treatmentId: z.string().min(1),
        bio: z.string().optional(),
        imageUrl: z.string().url().optional().or(z.literal("")),
        active: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    const tr = await prisma.treatment.findFirst({
      where: { id: body.data.treatmentId, deletedAt: null },
    });
    if (!tr) throw new AppError(400, "Tratamiento no encontrado o inactivo.");
    const p = await prisma.professional.create({
      data: {
        name: body.data.name,
        specialty: tr.name,
        specialtyTreatmentId: tr.id,
        bio: body.data.bio,
        imageUrl: body.data.imageUrl || null,
        active: body.data.active ?? true,
      },
      include: { specialtyTreatment: { select: { id: true, name: true, slug: true } } },
    });
    res.status(201).json({ professional: p });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.patch("/professionals/:id", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(2).optional(),
        treatmentId: z.string().min(1).optional(),
        bio: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        active: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");

    let specialty: string | undefined;
    let specialtyTreatmentId: string | null | undefined;
    if (body.data.treatmentId) {
      const tr = await prisma.treatment.findFirst({
        where: { id: body.data.treatmentId, deletedAt: null },
      });
      if (!tr) throw new AppError(400, "Tratamiento no encontrado.");
      specialty = tr.name;
      specialtyTreatmentId = tr.id;
    }

    const p = await prisma.professional.update({
      where: { id: req.params.id },
      data: {
        name: body.data.name,
        bio: body.data.bio,
        imageUrl: body.data.imageUrl,
        active: body.data.active,
        sortOrder: body.data.sortOrder,
        ...(specialty !== undefined ? { specialty, specialtyTreatmentId } : {}),
      },
      include: { specialtyTreatment: { select: { id: true, name: true, slug: true } } },
    });
    res.json({ professional: p });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.delete("/professionals/:id", async (req, res) => {
  try {
    const existing = await prisma.professional.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) throw new AppError(404, "Profesional no encontrado.");
    await prisma.professional.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), active: false },
    });
    res.json({ ok: true });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/treatments", async (_req, res) => {
  try {
    const treatments = await prisma.treatment.findMany({
      orderBy: { sortOrder: "asc" },
      where: { deletedAt: null },
    });
    res.json({ treatments });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/treatments", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().min(2),
        durationMinutes: z.number().min(5).max(600).optional(),
        category: z.string().min(2),
        active: z.boolean().optional(),
        requiresPriorEval: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    const t = await prisma.treatment.create({ data: { ...body.data, active: body.data.active ?? true } });
    res.status(201).json({ treatment: t });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.patch("/treatments/:id", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        durationMinutes: z.number().optional(),
        category: z.string().optional(),
        active: z.boolean().optional(),
        requiresPriorEval: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw new AppError(400, "Datos inválidos");
    const existing = await prisma.treatment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) throw new AppError(404, "Tratamiento no encontrado.");

    const t = await prisma.treatment.update({
      where: { id: req.params.id },
      data: body.data,
    });
    res.json({ treatment: t });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.delete("/treatments/:id", async (req, res) => {
  try {
    const existing = await prisma.treatment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) throw new AppError(404, "Tratamiento no encontrado.");

    await prisma.$transaction([
      prisma.professional.updateMany({
        where: { specialtyTreatmentId: req.params.id },
        data: { specialtyTreatmentId: null },
      }),
      prisma.treatment.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date(), active: false },
      }),
    ]);

    res.json({ ok: true });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/settings", async (_req, res) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const body = z.record(z.string()).safeParse(req.body);
    if (!body.success) throw new AppError(400, "Formato inválido");
    for (const [key, value] of Object.entries(body.data)) {
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    invalidateSettingsCache();
    const rows = await prisma.siteSetting.findMany();
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/chat/conversations", async (_req, res) => {
  try {
    const list = await prisma.chatConversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        contactLead: { select: { id: true, name: true, email: true, phone: true, dni: true } },
      },
    });
    const ids = list.map((c) => c.id);
    const lastMessages =
      ids.length === 0
        ? []
        : await Promise.all(
            ids.map((conversationId) =>
              prisma.chatMessage.findFirst({
                where: { conversationId },
                orderBy: { createdAt: "desc" },
                select: { content: true },
              }),
            ),
          );
    const conversations = list.map((c, i) => ({
      ...c,
      messages: lastMessages[i] ? [{ content: lastMessages[i]!.content }] : [],
    }));
    res.json({ conversations });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/chat/conversations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const conv = await prisma.chatConversation.findUnique({
      where: { id },
      include: { contactLead: true },
    });
    if (!conv) throw new AppError(404, "No encontrado");
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ conversation: { ...conv, messages } });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/export/:dataset", async (req, res) => {
  try {
    const format = parseExportFormat(req.query.format);
    const dataset = req.params.dataset;

    if (dataset === "bookings") {
      const list = await prisma.bookingRequest.findMany({
        take: 8000,
        orderBy: { createdAt: "desc" },
        include: {
          contactLead: true,
          treatment: true,
          professional: true,
          availabilitySlot: true,
        },
      });
      const headers = [
        "id",
        "estado",
        "creado",
        "actualizado",
        "paciente",
        "dni",
        "email",
        "telefono",
        "tratamiento",
        "profesional",
        "inicio_turno",
        "origen",
        "mensaje_paciente",
      ];
      const rows = list.map((b) => [
        b.id,
        b.status,
        b.createdAt.toISOString(),
        b.updatedAt.toISOString(),
        b.contactLead.name,
        b.contactLead.dni ?? "",
        b.contactLead.email ?? "",
        b.contactLead.phone ?? "",
        b.treatment.name,
        b.professional?.name ?? "",
        b.availabilitySlot?.startsAt.toISOString() ?? "",
        b.source,
        (b.patientMessage ?? "").replace(/\r?\n/g, " ").slice(0, 2000),
      ]);
      return sendTable(res, format, "reservas", "Reservas", headers, rows);
    }

    if (dataset === "leads") {
      const list = await prisma.contactLead.findMany({
        take: 8000,
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { bookings: true } } },
      });
      const headers = [
        "id",
        "nombre",
        "dni",
        "email",
        "telefono",
        "origen",
        "contactado",
        "reingresos_mismo_dni",
        "ultima_interaccion",
        "creado",
        "reservas_relacionadas",
      ];
      const rows = list.map((c) => [
        c.id,
        c.name,
        c.dni ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.source,
        c.crmContacted ? "sí" : "no",
        String(c.duplicateIntakeCount),
        c.lastInteractionAt.toISOString(),
        c.createdAt.toISOString(),
        String(c._count.bookings),
      ]);
      return sendTable(res, format, "contactos", "Contactos", headers, rows);
    }

    if (dataset === "professionals") {
      const list = await prisma.professional.findMany({
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: { specialtyTreatment: { select: { name: true, slug: true } } },
      });
      const headers = ["id", "nombre", "especialidad", "tratamiento_vinculado_slug", "activo", "orden", "creado"];
      const rows = list.map((p) => [
        p.id,
        p.name,
        p.specialty,
        p.specialtyTreatment?.slug ?? "",
        p.active ? "sí" : "no",
        String(p.sortOrder),
        p.createdAt.toISOString(),
      ]);
      return sendTable(res, format, "profesionales", "Profesionales", headers, rows);
    }

    if (dataset === "treatments") {
      const list = await prisma.treatment.findMany({
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      });
      const headers = [
        "id",
        "nombre",
        "slug",
        "categoria",
        "duracion_min",
        "activo",
        "requiere_evaluacion_previa",
        "orden",
        "descripcion",
      ];
      const rows = list.map((t) => [
        t.id,
        t.name,
        t.slug,
        t.category,
        String(t.durationMinutes),
        t.active ? "sí" : "no",
        t.requiresPriorEval ? "sí" : "no",
        String(t.sortOrder),
        t.description.replace(/\r?\n/g, " ").slice(0, 4000),
      ]);
      return sendTable(res, format, "tratamientos", "Tratamientos", headers, rows);
    }

    if (dataset === "availability") {
      const from = new Date();
      const to = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
      const list = await prisma.availabilitySlot.findMany({
        where: { startsAt: { gte: from, lte: to } },
        orderBy: { startsAt: "asc" },
        include: {
          professional: { select: { name: true } },
          treatment: { select: { name: true, slug: true } },
        },
      });
      const headers = [
        "id",
        "inicio",
        "fin",
        "estado",
        "profesional",
        "tratamiento",
        "slug_tratamiento",
      ];
      const rows = list.map((s) => [
        s.id,
        s.startsAt.toISOString(),
        s.endsAt.toISOString(),
        s.status,
        s.professional.name,
        s.treatment.name,
        s.treatment.slug,
      ]);
      return sendTable(res, format, "agenda_120d", "Agenda", headers, rows);
    }

    throw new AppError(400, "Exportación desconocida. Usá: bookings, leads, professionals, treatments, availability.");
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

export const adminRouter = router;
