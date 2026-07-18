import type { MetadataRoute } from "next";

const SITE_URL = "https://www.dermatologiatod.com";

/** Rutas públicas reales del App Router (sin /admin ni rutas internas). */
const PUBLIC_PATHS = ["/", "/reservar", "/aviso-legal", "/privacidad"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
  }));
}
