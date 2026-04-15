-- Asignar tratamiento a cupos sin tratamiento (requerido antes de NOT NULL)
UPDATE "AvailabilitySlot" AS s
SET "treatmentId" = sub.id
FROM (
  SELECT t.id
  FROM "Treatment" t
  WHERE t."deletedAt" IS NULL
  ORDER BY t."sortOrder" ASC
  LIMIT 1
) AS sub
WHERE s."treatmentId" IS NULL;

-- Si no hay ningún tratamiento activo, el UPDATE no corrige filas; la migración fallaría en NOT NULL.
-- En ese caso hay que crear al menos un tratamiento antes de aplicar.

ALTER TABLE "AvailabilitySlot" ALTER COLUMN "treatmentId" SET NOT NULL;

-- Cupos libres ya pasados: no ofrecerlos (coherente con la API pública)
UPDATE "AvailabilitySlot"
SET status = 'BLOCKED'
WHERE "startsAt" < NOW()
  AND status = 'AVAILABLE';
