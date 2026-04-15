import { formatDateTimeEs } from "@/lib/date-format";

export function buildBookingWhatsAppMessage(params: {
  patientName: string;
  siteName: string;
  treatmentName: string;
  professionalName?: string | null;
  slotStartsAt?: string | null;
}): string {
  const when = params.slotStartsAt ? formatDateTimeEs(params.slotStartsAt) : "fecha y hora a confirmar";
  const prof = params.professionalName ? `\nProfesional: ${params.professionalName}.` : "";
  return `Hola ${params.patientName}, te escribimos desde ${params.siteName}.

Recibimos tu solicitud de turno para ${params.treatmentName}.${prof}
Horario solicitado: ${when}.

¿Podés confirmarnos por aquí si te queda bien? Cuando respondas, lo registramos en el sistema.

Gracias.`;
}

/** Devuelve URL de wa.me o null si el teléfono es inválido. */
export function phoneToWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;

  let n = digits;
  if (!n.startsWith("54")) {
    n = n.replace(/^0+/, "");
    if (n.length === 10 && n.startsWith("11")) {
      n = `549${n.slice(2)}`;
    } else {
      n = `54${n}`;
    }
  }

  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
