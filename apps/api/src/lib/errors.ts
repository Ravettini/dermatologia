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
  console.error(err);
  return { status: 500, message: "Ocurrió un error. Intentá de nuevo más tarde." };
}
