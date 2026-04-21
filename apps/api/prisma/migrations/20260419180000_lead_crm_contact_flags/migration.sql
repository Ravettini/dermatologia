-- Flag CRM: contactado por el equipo (por defecto no)
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "crmContacted" BOOLEAN NOT NULL DEFAULT false;
