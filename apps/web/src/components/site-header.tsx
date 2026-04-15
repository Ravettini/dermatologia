import Link from "next/link";

const nav = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#tratamientos", label: "Tratamientos" },
  { href: "/#dermatologia", label: "Dermatología" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <nav className="fixed top-0 z-50 flex w-full max-w-full items-center justify-between bg-surface/80 px-6 py-6 backdrop-blur-md md:px-12">
      <Link href="/" className="font-headline text-2xl tracking-tighter text-on-surface">
        {siteName}
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-label text-sm tracking-tight text-on-surface/60 transition-colors hover:text-secondary"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Link
        href="/reservar"
        className="bg-on-primary-container px-6 py-2 font-label text-xs uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
      >
        Pedir turno
      </Link>
    </nav>
  );
}
