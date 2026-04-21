import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "DERMATOLOGÍA TOD";

export const metadata: Metadata = {
  title: {
    default: `${siteName} | Dermatología clínica y estética`,
    template: `%s | ${siteName}`,
  },
  description:
    "Centro de dermatología premium: consultas, tratamientos y acompañamiento profesional para la salud de tu piel.",
  icons: {
    icon: [{ url: "/branding/logo-tod.png", type: "image/png", sizes: "any" }],
    shortcut: "/branding/logo-tod.png",
    apple: "/branding/logo-tod.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
      </head>
      <body className={`${newsreader.variable} ${manrope.variable} min-w-0 overflow-x-hidden font-body`}>{children}</body>
    </html>
  );
}
