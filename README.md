# Dermaclinic — Monorepo (web + API + CRM)

Aplicación integral para centro dermatológico: sitio público premium (Next.js), API (Express + Prisma + Supabase Postgres), panel admin y chatbot con proveedor LLM configurable (Google GenAI / Gemini por defecto).

## Estructura

- `apps/web` — Next.js (App Router), Tailwind, contenido en español.
- `apps/api` — Express, Prisma, rutas `/api/public/*` y `/api/admin/*`.
- `packages/shared` — Esquemas Zod compartidos.

## Requisitos

- Node.js 20+
- pnpm 9+
- Proyecto Supabase (Postgres) o Postgres compatible

## Configuración local

1. Copiá variables:

   - `apps/api/.env` a partir de `apps/api/.env.example`
   - `apps/web/.env.local` a partir de `apps/web/.env.example`

2. En Supabase, obtené `DATABASE_URL` (pooler, puerto 6543 con `pgbouncer=true`) y `DIRECT_URL` (conexión directa, puerto 5432) para migraciones.

3. Instalación y base de datos:

```bash
pnpm install
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma db push
pnpm db:seed
```

4. Desarrollo (API + web en paralelo):

```bash
pnpm dev
```

- Web: http://localhost:3000  
- API: http://localhost:4000/health  

**Admin demo (tras seed):** http://localhost:3000/admin/login  

- Email: `admin@dermaclinic.local`  
- Contraseña: `DermaDemo2026!`  

Cambiá la contraseña en producción.

## Build

```bash
pnpm build
```

## Despliegue

### Supabase

- Creá el proyecto Postgres.
- Configurá `DATABASE_URL` y `DIRECT_URL` en Railway (API) según la documentación de Prisma + Supabase.
- Ejecutá migraciones o `db push` desde entorno seguro (CI o local apuntando a prod).

### Railway (API)

- Servicio Node con comando `node apps/api/dist/index.js` o `pnpm --filter api start` según tu build.
- Variables de entorno: todas las de `apps/api/.env.example` + secretos reales.
- `FRONTEND_URL` debe ser la URL pública de Vercel (para CORS y cookies).

### Vercel (web)

- Root: `apps/web` (o monorepo con `pnpm` y cwd en `apps/web`).
- Variables: `NEXT_PUBLIC_API_URL` apuntando a la URL pública de Railway (`https://tu-api.up.railway.app`), sin barra final.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` y `NEXT_PUBLIC_SITE_NAME`.

### Cookies admin

El login admin usa cookie `httpOnly` `admin_token`. El dominio de la API y el de la web deben coordinarse: en producción usá mismo site o configurá proxy si compartís dominio; si API y web están en dominios distintos, las cookies no cruzan — en ese caso conviene un proxy en Next (`rewrites`) o login vía `Authorization` header (mejora futura). Para el setup típico recomendado: **mismo dominio** vía reverse proxy o subdominio con configuración CORS/cookies acorde.

## Notas de seguridad

- No commitees `.env`.
- Rotá credenciales si se expusieron.
- El chatbot incluye reglas de no diagnóstico; el prompt es editable en **Admin → Configuración**.

## Scripts útiles

| Comando        | Descripción                |
|----------------|----------------------------|
| `pnpm dev`     | API + web                  |
| `pnpm build`   | Build shared + api + web   |
| `pnpm db:push` | Prisma db push (API)       |
| `pnpm db:seed` | Seed demo (API)            |
