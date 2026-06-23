import "./env";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { friendlyError } from "./lib/errors";
import { corsOriginDelegate } from "./lib/cors-config";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const { status, message } = friendlyError(err);
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
