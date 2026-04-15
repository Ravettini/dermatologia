import Link from "next/link";

export function SiteFooter({
  siteName,
  address,
  email,
  phone,
}: {
  siteName: string;
  address: string;
  email: string;
  phone: string;
}) {
  return (
    <footer className="w-full border-t border-on-surface/5 bg-surface-container-highest">
      <div className="grid w-full grid-cols-1 gap-12 px-6 py-20 font-body text-sm tracking-wide text-on-surface md:grid-cols-4 md:px-12">
        <div>
          <div className="mb-6 font-headline text-xl italic">{siteName}</div>
          <p className="max-w-xs leading-relaxed opacity-70">
            Excelencia médica y calidez humana dedicada a la salud integral de tu piel.
          </p>
        </div>
        <div>
          <h6 className="mb-6 font-label text-xs uppercase tracking-[0.2em] opacity-40">Navegación</h6>
          <ul className="space-y-4">
            <li>
              <Link className="opacity-70 transition-opacity hover:opacity-100" href="/#inicio">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="opacity-70 transition-opacity hover:opacity-100" href="/#tratamientos">
                Tratamientos
              </Link>
            </li>
            <li>
              <Link className="opacity-70 transition-opacity hover:opacity-100" href="/reservar">
                Reservar consulta
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="mb-6 font-label text-xs uppercase tracking-[0.2em] opacity-40">Contacto</h6>
          <ul className="space-y-4 opacity-70">
            <li>{address}</li>
            <li>{email}</li>
            <li>{phone}</li>
          </ul>
        </div>
        <div>
          <h6 className="mb-6 font-label text-xs uppercase tracking-[0.2em] opacity-40">Legal</h6>
          <ul className="space-y-3">
            <li>
              <Link className="opacity-70 underline decoration-secondary underline-offset-4" href="/privacidad">
                Privacidad
              </Link>
            </li>
            <li>
              <Link className="opacity-70 hover:opacity-100" href="/aviso-legal">
                Aviso legal
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-6 border-t border-on-surface/5 px-6 py-8 text-[10px] uppercase tracking-widest opacity-60 md:flex-row md:px-12">
        <p>© {new Date().getFullYear()} {siteName}. Todos los derechos reservados.</p>
        <p className="max-w-3xl text-center text-[9px] normal-case leading-relaxed">
          La información es orientativa y no sustituye la evaluación médica presencial. Los resultados pueden variar.
        </p>
      </div>
    </footer>
  );
}
