-- Dedupe ContactLead: conserva el registro más antiguo por grupo y reasigna FKs.
-- 1) Mismo DNI (no vacío)
-- 2) Sin DNI pero mismo email
-- 3) Sin DNI ni email útil, mismo teléfono normalizado (solo dígitos)

-- --- Por DNI ---
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
UPDATE "BookingRequest" br SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE br."contactLeadId" = tr.old_id;

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
UPDATE "ChatConversation" cc SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE cc."contactLeadId" = tr.old_id;

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
UPDATE "LeadNote" ln SET "contactId" = tr.keep_id FROM to_remap tr WHERE ln."contactId" = tr.old_id;

DELETE FROM "ContactLead" cl
USING (
  SELECT dni, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE dni IS NOT NULL AND btrim(dni) <> ''
  GROUP BY dni
  HAVING COUNT(*) > 1
) k
WHERE cl.dni = k.dni AND cl.id <> k.keep_id;

-- --- Sin DNI, mismo email (normalizado) ---
WITH keeper AS (
  SELECT lower(btrim(email)) AS em, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '') AND email IS NOT NULL AND btrim(email) <> ''
  GROUP BY lower(btrim(email))
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON lower(btrim(cl.email)) = k.em
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '') AND cl.id <> k.keep_id
)
UPDATE "BookingRequest" br SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE br."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT lower(btrim(email)) AS em, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '') AND email IS NOT NULL AND btrim(email) <> ''
  GROUP BY lower(btrim(email))
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON lower(btrim(cl.email)) = k.em
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '') AND cl.id <> k.keep_id
)
UPDATE "ChatConversation" cc SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE cc."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT lower(btrim(email)) AS em, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '') AND email IS NOT NULL AND btrim(email) <> ''
  GROUP BY lower(btrim(email))
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON lower(btrim(cl.email)) = k.em
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '') AND cl.id <> k.keep_id
)
UPDATE "LeadNote" ln SET "contactId" = tr.keep_id FROM to_remap tr WHERE ln."contactId" = tr.old_id;

DELETE FROM "ContactLead" cl
USING (
  SELECT lower(btrim(email)) AS em, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '') AND email IS NOT NULL AND btrim(email) <> ''
  GROUP BY lower(btrim(email))
  HAVING COUNT(*) > 1
) k
WHERE (cl.dni IS NULL OR btrim(cl.dni) = '') AND lower(btrim(cl.email)) = k.em AND cl.id <> k.keep_id;

-- --- Sin DNI (ni email para agrupar), mismo teléfono ---
WITH keeper AS (
  SELECT regexp_replace(coalesce(phone, ''), '\D', '', 'g') AS ph, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '')
    AND (email IS NULL OR btrim(email) = '')
    AND phone IS NOT NULL AND btrim(phone) <> ''
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 6
  GROUP BY regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON regexp_replace(coalesce(cl.phone, ''), '\D', '', 'g') = k.ph
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '')
    AND (cl.email IS NULL OR btrim(cl.email) = '')
    AND cl.id <> k.keep_id
)
UPDATE "BookingRequest" br SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE br."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT regexp_replace(coalesce(phone, ''), '\D', '', 'g') AS ph, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '')
    AND (email IS NULL OR btrim(email) = '')
    AND phone IS NOT NULL AND btrim(phone) <> ''
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 6
  GROUP BY regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON regexp_replace(coalesce(cl.phone, ''), '\D', '', 'g') = k.ph
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '')
    AND (cl.email IS NULL OR btrim(cl.email) = '')
    AND cl.id <> k.keep_id
)
UPDATE "ChatConversation" cc SET "contactLeadId" = tr.keep_id FROM to_remap tr WHERE cc."contactLeadId" = tr.old_id;

WITH keeper AS (
  SELECT regexp_replace(coalesce(phone, ''), '\D', '', 'g') AS ph, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '')
    AND (email IS NULL OR btrim(email) = '')
    AND phone IS NOT NULL AND btrim(phone) <> ''
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 6
  GROUP BY regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  HAVING COUNT(*) > 1
),
to_remap AS (
  SELECT cl.id AS old_id, k.keep_id
  FROM "ContactLead" cl
  INNER JOIN keeper k ON regexp_replace(coalesce(cl.phone, ''), '\D', '', 'g') = k.ph
  WHERE (cl.dni IS NULL OR btrim(cl.dni) = '')
    AND (cl.email IS NULL OR btrim(cl.email) = '')
    AND cl.id <> k.keep_id
)
UPDATE "LeadNote" ln SET "contactId" = tr.keep_id FROM to_remap tr WHERE ln."contactId" = tr.old_id;

DELETE FROM "ContactLead" cl
USING (
  SELECT regexp_replace(coalesce(phone, ''), '\D', '', 'g') AS ph, (array_agg(id ORDER BY "createdAt" ASC, id ASC))[1] AS keep_id
  FROM "ContactLead"
  WHERE (dni IS NULL OR btrim(dni) = '')
    AND (email IS NULL OR btrim(email) = '')
    AND phone IS NOT NULL AND btrim(phone) <> ''
    AND length(regexp_replace(phone, '\D', '', 'g')) >= 6
  GROUP BY regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  HAVING COUNT(*) > 1
) k
WHERE (cl.dni IS NULL OR btrim(cl.dni) = '')
  AND (cl.email IS NULL OR btrim(cl.email) = '')
  AND regexp_replace(coalesce(cl.phone, ''), '\D', '', 'g') = k.ph
  AND cl.id <> k.keep_id;
