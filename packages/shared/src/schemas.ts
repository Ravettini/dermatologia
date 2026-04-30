import { z } from "zod";

/** DNI u documento: al menos 7 dígitos (admite puntos o espacios al escribir). */
export const dniSchema = z
  .string()
  .trim()
  .min(1, "DNI / documento requerido")
  .max(24)
  .refine((s) => s.replace(/\D/g, "").length >= 7, {
    message: "El documento debe tener al menos 7 dígitos",
  });

/** Guardar en base: solo dígitos, máx. 15. */
export function dniToStore(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 15);
}

export const contactFormSchema = z.object({
  name: z.string().min(2).max(120),
  dni: dniSchema,
  email: z.string().email().max(255),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000),
  consent: z.literal(true),
  source: z.enum(["WEB_FORM", "BOOKING_WIDGET", "CHATBOT", "WHATSAPP", "MANUAL"]).optional(),
});

export const bookingRequestSchema = z.object({
  treatmentId: z.string().min(1),
  professionalId: z.preprocess(
    (v) => (v === null || v === undefined || v === "" ? undefined : v),
    z.string().min(1).optional()
  ),
  slotId: z.string().min(1),
  name: z.string().min(2).max(120),
  dni: dniSchema,
  email: z.string().email().max(255),
  phone: z.string().min(6).max(40),
  message: z.string().max(2000).optional(),
  consent: z.literal(true),
});

export const chatMessageSchema = z.object({
  visitorId: z.string().min(8).max(80).optional(),
  message: z.string().min(1).max(4000),
});

export const leadCaptureSchema = z
  .object({
    visitorId: z.string().min(8).max(80),
    name: z.string().min(2).max(120),
    dni: dniSchema,
    email: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.string().email().max(255).optional()),
    phone: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.string().min(6).max(40).optional()),
  })
  .refine((d) => d.email || d.phone, { message: "Email o teléfono requerido" });

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
