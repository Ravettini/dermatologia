-- Quitar columna de seguimiento si existía en despliegues anteriores
ALTER TABLE "ContactLead" DROP COLUMN IF EXISTS "crmFollowUpContacted";
