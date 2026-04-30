import { Router } from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";
import {
  bookingRequestSchema,
  chatMessageSchema,
  contactFormSchema,
  dniToStore,
  leadCaptureSchema,
} from "@derma/shared";
import { prisma } from "../lib/prisma";
import { intakePublicContactLeadByDni } from "../lib/contact-lead-intake";
import { AppError, friendlyError } from "../lib/errors";
import { sanitizeText } from "../lib/sanitize";
import { runChatCompletion } from "../lib/ai/chat.service";
import { getChatbotConfig, getAllSettingsMap } from "../lib/settings";
import { emailPatientBookingReceived, notifyAdminNewBooking } from "../lib/email";
import { BookingStatus, LeadSource, SlotStatus } from "@prisma/client";

const router = Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/site", async (_req, res) => {
  try {
    const [settingsMap, faqs, testimonials] = await Promise.all([
      getAllSettingsMap(),
      prisma.fAQItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    const site = Object.fromEntries(settingsMap.entries());
    res.json({ site, faqs, testimonials });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/professionals", async (_req, res) => {
  try {
    const list = await prisma.professional.findMany({
      where: { active: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        specialty: true,
        specialtyTreatmentId: true,
        bio: true,
        imageUrl: true,
      },
    });
    res.json({ professionals: list });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/treatments", async (_req, res) => {
  try {
    const list = await prisma.treatment.findMany({
      where: { active: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ treatments: list });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/faqs", async (_req, res) => {
  try {
    const faqs = await prisma.fAQItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ faqs });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.get("/availability", async (req, res) => {
  try {
    const now = new Date();
    let from = req.query.from ? new Date(String(req.query.from)) : now;
    const to = req.query.to
      ? new Date(String(req.query.to))
      : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new AppError(400, "Fechas inválidas");
    }
    if (from < now) from = now;

    const treatmentId = req.query.treatmentId ? String(req.query.treatmentId).trim() : "";
    const professionalId = req.query.professionalId ? String(req.query.professionalId).trim() : "";

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.AVAILABLE,
        startsAt: { gte: from, lte: to },
        professional: { deletedAt: null },
        treatment: { deletedAt: null },
        NOT: {
          bookingRequests: {
            some: {
              status: { notIn: [BookingStatus.CANCELED, BookingStatus.CLOSED] },
            },
          },
        },
        ...(treatmentId ? { treatmentId } : {}),
        ...(professionalId ? { professionalId } : {}),
      },
      include: {
        professional: { select: { id: true, name: true, specialty: true } },
        treatment: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    res.json({ slots });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/contact", formLimiter, async (req, res) => {
  try {
    const parsed = contactFormSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Datos inválidos");
    }
    const d = parsed.data;
    const source = (d.source as LeadSource | undefined) ?? LeadSource.WEB_FORM;

    const dni = dniToStore(d.dni);
    const messageBody = `Consulta web: ${sanitizeText(d.message, 4000)}`;
    const { id: leadId, merged } = await intakePublicContactLeadByDni({
      dni,
      name: sanitizeText(d.name, 120),
      email: sanitizeText(d.email, 255),
      phone: d.phone ? sanitizeText(d.phone, 40) : undefined,
      source,
      systemNote: `[Sistema · reingreso con el mismo DNI · ${new Date().toISOString()}]\n\n${messageBody}`,
    });

    if (!merged) {
      await prisma.leadNote.create({
        data: { contactId: leadId, body: messageBody },
      });
    }

    res.status(201).json({ ok: true, id: leadId });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/booking-request", formLimiter, async (req, res) => {
  try {
    const parsed = bookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Datos inválidos");
    }
    const d = parsed.data;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: d.slotId },
      include: { treatment: true },
    });
    if (!slot || slot.status !== SlotStatus.AVAILABLE) {
      throw new AppError(409, "El horario ya no está disponible. Elegí otro.");
    }
    if (slot.treatmentId !== d.treatmentId) {
      throw new AppError(400, "El tratamiento no coincide con el horario seleccionado.");
    }

    if (slot.startsAt.getTime() < Date.now()) {
      throw new AppError(409, "Ese horario ya pasó. Elegí otro turno.");
    }

    if (d.professionalId && d.professionalId !== slot.professionalId) {
      throw new AppError(400, "El profesional no coincide con el horario seleccionado.");
    }

    const dni = dniToStore(d.dni);
    const { id: leadId } = await intakePublicContactLeadByDni({
      dni,
      name: sanitizeText(d.name, 120),
      email: sanitizeText(d.email, 255),
      phone: sanitizeText(d.phone, 40),
      source: LeadSource.BOOKING_WIDGET,
      systemNote: `[Sistema · reingreso con el mismo DNI · nueva solicitud de turno · ${new Date().toISOString()}]`,
    });

    const lead = await prisma.contactLead.findUniqueOrThrow({ where: { id: leadId } });

    const booking = await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { status: SlotStatus.PENDING },
      });

      return tx.bookingRequest.create({
        data: {
          contactLeadId: leadId,
          treatmentId: d.treatmentId,
          professionalId: slot.professionalId,
          availabilitySlotId: slot.id,
          status: BookingStatus.PENDING_CONFIRMATION,
          source: LeadSource.BOOKING_WIDGET,
          patientMessage: d.message ? sanitizeText(d.message, 2000) : null,
          consentAccepted: d.consent,
        },
        include: { treatment: true, availabilitySlot: true },
      });
    });

    const when = `${booking.availabilitySlot?.startsAt.toISOString() ?? ""}`;
    void notifyAdminNewBooking({
      patientName: lead.name,
      patientDni: lead.dni ?? undefined,
      treatment: booking.treatment.name,
      when,
    });
    void emailPatientBookingReceived(lead.email ?? "", lead.name);

    res.status(201).json({ ok: true, bookingId: booking.id });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/chat/lead", formLimiter, async (req, res) => {
  try {
    const parsed = leadCaptureSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "Datos inválidos");
    const d = parsed.data;
    const conv = await prisma.chatConversation.findUnique({ where: { visitorId: d.visitorId } });
    if (!conv) throw new AppError(404, "Conversación no encontrada");

    const dni = dniToStore(d.dni);
    const { id: leadId } = await intakePublicContactLeadByDni({
      dni,
      name: sanitizeText(d.name, 120),
      email: d.email ? sanitizeText(d.email, 255) : null,
      phone: d.phone !== undefined ? (d.phone ? sanitizeText(d.phone, 40) : null) : undefined,
      source: LeadSource.CHATBOT,
      systemNote: `[Sistema · reingreso con el mismo DNI · datos desde el chatbot · ${new Date().toISOString()}]`,
    });

    await prisma.chatConversation.update({
      where: { id: conv.id },
      data: { contactLeadId: leadId },
    });

    res.status(201).json({ ok: true, leadId });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

router.post("/chat", chatLimiter, async (req, res) => {
  try {
    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Mensaje inválido");
    }
    const msg = sanitizeText(parsed.data.message, 4000);
    let visitorId = parsed.data.visitorId;
    if (!visitorId) {
      visitorId = randomUUID();
    }

    const cfg = await getChatbotConfig();

    let conv = await prisma.chatConversation.findUnique({
      where: { visitorId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 24 },
      },
    });

    if (!conv) {
      conv = await prisma.chatConversation.create({
        data: { visitorId },
        include: { messages: true },
      });
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        role: "user",
        content: msg,
      },
    });

    const thread = await prisma.chatMessage.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: "asc" },
    });
    const beforeCurrent = thread.slice(0, -1);
    const history = beforeCurrent
      .filter((m) => m.role === "user" || m.role === "model")
      .slice(-24)
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        text: m.content,
      }));

    let reply: string;
    try {
      reply = await runChatCompletion({
        history,
        userMessage: msg,
      });
    } catch (err) {
      console.error("AI error", err);
      reply = cfg.fallbackMessage;
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        role: "model",
        content: reply,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    res.json({ visitorId, reply });
  } catch (e) {
    const { status, message } = friendlyError(e);
    res.status(status).json({ error: message });
  }
});

export const publicRouter = router;
