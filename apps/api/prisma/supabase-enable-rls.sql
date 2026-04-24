-- Ejecutar en Supabase → SQL Editor (una vez).
-- Activa RLS en todas las tablas del esquema Prisma. Sin políticas para `anon`/`authenticated`,
-- PostgREST no devuelve filas a clientes con clave anónima (comportamiento seguro por defecto).
-- Prisma con el rol `postgres` del connection string sigue viendo todo (bypass habitual en Supabase).

ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Professional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Treatment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AvailabilitySlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FAQItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
