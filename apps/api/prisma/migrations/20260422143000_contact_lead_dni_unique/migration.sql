-- Dedupe ContactLead por DNI antes del índice único (conserva el registro más antiguo por dni)
WITH keeper AS (
  SELECT dni, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE dni IS NOT NULL AND btrim(dni) <> ''
  GROUP BY dni
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON k.dni = cl.dni
  WHERE cl.id <> k.keep_id
)
UPDATE "BookingRequest" br
SET "contactLeadId" = tr.keep_id
FROM to_remap tr
WHERE br."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT dni, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE dni IS NOT NULL AND btrim(dni) <> ''
  GROUP BY dni
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON k.dni = cl.dni
  WHERE cl.id <> k.keep_id
)
UPDATE "ChatConversation" cc
SET "contactLeadId" = tr.keep_id
FROM to_remap tr
WHERE cc."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT dni, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE dni IS NOT NULL AND btrim(dni) <> ''
  GROUP BY dni
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON k.dni = cl.dni
  WHERE cl.id <> k.keep_id
)
UPDATE "LeadNote" ln
SET "contactId" = tr.keep_id
FROM to_remap tr
WHERE ln."contactId" = tr.old_id;

DELETE FROM "ContactLead" cl
USING (
  SELECT dni, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE dni IS NOT NULL AND btrim(dni) <> ''
  GROUP BY dni
  HAVING COUNT(*) > 1
) k
WHERE cl.dni = k.dni AND cl.id <> k.keep_id;

-- AlterTable
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "duplicateIntakeCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ContactLead" ALTER COLUMN "dni" DROP NOT NULL;

UPDATE "ContactLead" SET "dni" = NULL WHERE "dni" IS NOT NULL AND btrim("dni") = '';

CREATE UNIQUE INDEX IF NOT EXISTS "ContactLead_dni_key" ON "ContactLead"("dni");
