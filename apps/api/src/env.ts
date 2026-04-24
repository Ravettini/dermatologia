import path from "node:path";
import { config } from "dotenv";

const rootEnv = path.join(__dirname, "../../../.env");
const apiEnv = path.join(__dirname, "../.env");

// Primero `apps/api/.env` (PORT, DB local, etc.); el `.env` de la raíz del monorepo
// sobrescribe con override para que EMAIL_*, AI_*, etc. definidos en la raíz no queden
// pisados por valores viejos en apps/api/.env.
config({ path: apiEnv });
config({ path: rootEnv, override: true });

const ep = (process.env.EMAIL_PROVIDER || "").toLowerCase();
if (ep === "resend" && process.env.EMAIL_FROM?.toLowerCase().includes("@gmail.com")) {
  console.warn(
    "[email] Con Resend no uses @gmail.com como FROM; verificá un dominio en resend.com o cambiá a EMAIL_PROVIDER=gmail (SMTP)."
  );
}
