import { Prisma } from "@prisma/client";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function friendlyError(err: unknown): { status: number; message: string } {
  if (err instanceof AppError) {
    return { status: err.status, message: err.message };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target : typeof target === "string" ? [target] : [];
      if (fields.includes("dni")) {
        return { status: 409, message: "Ya existe otro contacto con ese DNI." };
      }
      return { status: 409, message: "Conflicto: registro duplicado." };
    }
  }
  console.error(err);
  return { status: 500, message: "Ocurrió un error. Intentá de nuevo más tarde." };
}
