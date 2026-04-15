import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const provider = process.env.EMAIL_PROVIDER;
  const from = process.env.EMAIL_FROM;

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

  return { ok: false, error: `Proveedor de email no soportado: ${provider}` };
}

export async function notifyAdminNewBooking(payload: {
  patientName: string;
  treatment: string;
  when: string;
}): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;
  await sendTransactionalEmail({
    to,
    subject: "Nueva solicitud de turno",
    html: `<p>Nueva solicitud de <strong>${escapeHtml(payload.patientName)}</strong>.</p>
    <p>Tratamiento: ${escapeHtml(payload.treatment)}</p>
    <p>Fecha/hora solicitada: ${escapeHtml(payload.when)}</p>`,
  });
}

export async function emailPatientBookingReceived(to: string, name: string): Promise<void> {
  await sendTransactionalEmail({
    to,
    subject: "Recibimos tu solicitud de turno",
    html: `<p>Hola ${escapeHtml(name)},</p>
    <p>Recibimos tu solicitud. El equipo la revisará y te contactará para confirmar fecha y hora.</p>
    <p>Este mensaje es informativo y no constituye confirmación médica.</p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
