import type { LeadSource } from "@prisma/client";
import { prisma } from "./prisma";

export type PublicIntakeParams = {
  dni: string;
  name: string;
  email: string | null;
  /** `undefined` = no modificar el teléfono al fusionar con un contacto existente */
  phone?: string | null;
  source: LeadSource;
  systemNote: string;
};

/**
 * Alta pública de contacto: un DNI = un solo ContactLead. Si ya existe, actualiza datos,
 * incrementa duplicateIntakeCount y agrega una nota automática para el equipo.
 */
export async function intakePublicContactLeadByDni(
  params: PublicIntakeParams
): Promise<{ id: string; merged: boolean }> {
  const existing = await prisma.contactLead.findUnique({ where: { dni: params.dni } });
  if (!existing) {
    const lead = await prisma.contactLead.create({
      data: {
        name: params.name,
        dni: params.dni,
        email: params.email,
        phone: params.phone ?? null,
        source: params.source,
        lastInteractionAt: new Date(),
      },
    });
    return { id: lead.id, merged: false };
  }

  await prisma.$transaction([
    prisma.contactLead.update({
      where: { id: existing.id },
      data: {
        name: params.name,
        email: params.email ?? existing.email,
        ...(params.phone !== undefined ? { phone: params.phone } : {}),
        lastInteractionAt: new Date(),
        duplicateIntakeCount: { increment: 1 },
      },
    }),
    prisma.leadNote.create({
      data: {
        contactId: existing.id,
        body: params.systemNote,
      },
    }),
  ]);

  return { id: existing.id, merged: true };
}
