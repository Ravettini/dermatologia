import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000),
  consent: z.literal(true),
  source: z.enum(["WEB_FORM", "BOOKING_WIDGET", "CHATBOT", "WHATSAPP", "MANUAL"]).optional(),
});

export const bookingRequestSchema = z.object({
  treatmentId: z.string().min(1),
  professionalId: z
    .string()
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  slotId: z.string().min(1),
  name: z.string().min(2).max(120),
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
    email: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.string().email().max(255).optional()),
    phone: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.string().min(6).max(40).optional()),
  })
  .refine((d) => d.email || d.phone, { message: "Email o teléfono requerido" });

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
