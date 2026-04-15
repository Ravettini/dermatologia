-- Especialidad del profesional vinculada a un tratamiento (nombre mostrado sigue en `specialty`)
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "specialtyTreatmentId" TEXT;

ALTER TABLE "Professional" DROP CONSTRAINT IF EXISTS "Professional_specialtyTreatmentId_fkey";

ALTER TABLE "Professional"
  ADD CONSTRAINT "Professional_specialtyTreatmentId_fkey"
  FOREIGN KEY ("specialtyTreatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Professional_specialtyTreatmentId_idx" ON "Professional"("specialtyTreatmentId");

-- Intentar enlazar por nombre coincidente con un tratamiento activo
UPDATE "Professional" AS p
SET "specialtyTreatmentId" = t.id
FROM "Treatment" AS t
WHERE p."specialtyTreatmentId" IS NULL
  AND t."deletedAt" IS NULL
  AND t.name = p.specialty;
