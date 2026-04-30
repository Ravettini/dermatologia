import nodemailer from "nodemailer";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!provider || provider === "none" || !from) {
    return { ok: false, error: "Email desactivado (sin proveedor configurado)." };
  }

  if (provider === "resend") {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { ok: false, error: "Falta RESEND_API_KEY." };
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (provider === "smtp" || provider === "gmail") {
    return sendViaSmtp(input, from, provider === "gmail");
  }

  return { ok: false, error: `Proveedor de email no soportado: ${provider}` };
}

async function sendViaSmtp(
  input: SendEmailInput,
  from: string,
  gmailDefaults: boolean
): Promise<{ ok: boolean; error?: string }> {
  const host =
    process.env.SMTP_HOST?.trim() || (gmailDefaults ? "smtp.gmail.com" : "");
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = Number(portRaw || (gmailDefaults ? "587" : ""));
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;

  if (!host || !user || !pass || !Number.isFinite(port) || port <= 0) {
    return {
      ok: false,
      error:
        "SMTP incompleto: definí SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS (con Gmail: EMAIL_PROVIDER=gmail y contraseña de aplicación).",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    const replyTo = process.env.EMAIL_REPLY_TO?.trim();
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function notifyAdminNewBooking(payload: {
  patientName: string;
  patientDni?: string;
  treatment: string;
  when: string;
}): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;
  const dniLine = payload.patientDni?.trim()
    ? `<p><strong>DNI / documento:</strong> ${escapeHtml(payload.patientDni)}</p>`
    : "";
  const r = await sendTransactionalEmail({
    to,
    subject: "Nueva solicitud de turno",
    html: `<p>Nueva solicitud de <strong>${escapeHtml(payload.patientName)}</strong>.</p>
    ${dniLine}
    <p>Tratamiento: ${escapeHtml(payload.treatment)}</p>
    <p>Fecha/hora solicitada: ${escapeHtml(payload.when)}</p>`,
  });
  if (!r.ok) console.error("[email] Aviso admin (nueva solicitud):", r.error);
}

export async function emailPatientBookingReceived(to: string, name: string): Promise<void> {
  if (!to?.trim()) return;
  const r = await sendTransactionalEmail({
    to,
    subject: "Recibimos tu solicitud de turno",
    html: `<p>Hola ${escapeHtml(name)},</p>
    <p>Recibimos tu solicitud. El equipo la revisará y te contactará para confirmar el turno.</p>
    <p>Este mensaje es informativo y no constituye confirmación médica.</p>`,
  });
  if (!r.ok) console.error("[email] Solicitud recibida (paciente):", r.error);
}

export async function emailPatientBookingConfirmed(payload: {
  to: string;
  patientName: string;
  treatmentName: string;
  professionalName?: string | null;
  startsAtIso?: string | null;
  clinicAddress: string;
  clinicPhone: string;
  logoUrl?: string | null;
}): Promise<void> {
  const when = formatDateTimeEs(payload.startsAtIso);
  const logoHtml = payload.logoUrl
    ? `<div style="margin-top:20px">
         <img src="${escapeHtml(payload.logoUrl)}" alt="Logo del local" style="max-width:180px;height:auto;display:block" />
       </div>`
    : "";
  const professionalLine = payload.professionalName
    ? `<p><strong>Profesional:</strong> ${escapeHtml(payload.professionalName)}</p>`
    : "";

  const r = await sendTransactionalEmail({
    to: payload.to,
    subject: "Confirmamos tu turno",
    html: `<p>Hola ${escapeHtml(payload.patientName)}, confirmamos tu turno.</p>
    <p><strong>Tratamiento:</strong> ${escapeHtml(payload.treatmentName)}</p>
    ${professionalLine}
    <p><strong>Horario del turno:</strong> ${escapeHtml(when)}</p>
    <p>Te esperamos en <strong>${escapeHtml(payload.clinicAddress)}</strong> en el horario indicado.</p>
    <p>Cualquier inconveniente o cambio comunicate al <strong>${escapeHtml(payload.clinicPhone)}</strong>.</p>
    ${logoHtml}`,
  });
  if (!r.ok) console.error("[email] Confirmación de turno (paciente):", r.error);
}

export async function emailPatientBookingCanceled(payload: {
  to: string;
  patientName: string;
  treatmentName: string;
  professionalName?: string | null;
  startsAtIso?: string | null;
  clinicPhone: string;
}): Promise<void> {
  if (!payload.to?.trim()) return;
  const when = formatDateTimeEs(payload.startsAtIso);
  const professionalLine = payload.professionalName
    ? `<p><strong>Profesional:</strong> ${escapeHtml(payload.professionalName)}</p>`
    : "";

  const r = await sendTransactionalEmail({
    to: payload.to,
    subject: "Tu turno fue cancelado",
    html: `<p>Hola ${escapeHtml(payload.patientName)},</p>
    <p>Te informamos que tu turno quedó <strong>cancelado</strong>.</p>
    <p><strong>Tratamiento:</strong> ${escapeHtml(payload.treatmentName)}</p>
    ${professionalLine}
    <p><strong>Fecha y hora que tenías reservada:</strong> ${escapeHtml(when)}</p>
    <p>Si querés coordinar un nuevo horario o tenés consultas, comunicate al <strong>${escapeHtml(payload.clinicPhone)}</strong>.</p>
    <p>Este mensaje es informativo y no constituye confirmación médica.</p>`,
  });
  if (!r.ok) console.error("[email] Cancelación de turno (paciente):", r.error);
}

function formatDateTimeEs(startsAtIso?: string | null): string {
  if (!startsAtIso) return "A confirmar";
  const d = new Date(startsAtIso);
  if (Number.isNaN(d.getTime())) return "A confirmar";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(d);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
