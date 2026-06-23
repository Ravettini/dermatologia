import Link from "next/link";
import { BEKANDU_TURNOS_URL } from "@/lib/bekandu-turnos";

function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

type PanelProps = {
  phone: string;
  /** `standalone`: sección única centrada (/reservar). `column`: columna dentro de Contacto + Turnos. */
  variant: "standalone" | "column";
};

export function OnlineTurnosPanel({ phone, variant }: PanelProps) {
  const wa = digitsOnlyPhone(phone);
  const waHref = wa ? `https://wa.me/${wa}` : null;

  const isColumn = variant === "column";

  return (
    <div
      className={
        isColumn
          ? "relative mx-auto max-w-lg text-left lg:mx-0 lg:max-w-none"
          : "relative mx-auto max-w-2xl text-center"
      }
    >
      <span
        className={
          isColumn
            ? "mb-3 block font-label text-[11px] uppercase tracking-[0.32em] text-on-surface-variant md:text-xs"
            : "mb-4 block font-label text-[11px] uppercase tracking-[0.32em] text-on-surface-variant md:text-xs"
        }
      >
        Turnos
      </span>
      <h2
        id="online-turnos-heading"
        className="font-headline text-[1.65rem] leading-[1.2] text-on-surface sm:text-4xl md:text-[2.1rem] md:leading-tight"
      >
        Tu consulta, con calma y a tu ritmo
      </h2>
      <p
        className={
          isColumn
            ? "mt-5 max-w-md font-body text-base leading-relaxed text-on-surface-variant md:text-lg"
            : "mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-on-surface-variant md:mt-7 md:text-lg"
        }
      >
        La agenda vive en nuestra plataforma de reservas: elegí franja, confirmá y listo. Si necesitas ayuda, también podés escribirnos.
      </p>

      <div className={`mt-8 ${isColumn ? "flex justify-start md:mt-10" : "mx-auto flex max-w-xs justify-center md:mt-10"}`} aria-hidden="true">
        <div className={`h-px bg-gradient-to-r from-transparent via-outline-variant/60 ${isColumn ? "w-full max-w-[200px]" : "w-full"} to-transparent`} />
      </div>

      <div
        className={
          isColumn
            ? "mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 md:mt-10"
            : "mt-10 flex flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        }
      >
        <a
          href={BEKANDU_TURNOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full touch-manipulation items-center justify-center bg-on-primary-container px-8 py-4 font-label text-xs uppercase tracking-[0.22em] text-surface shadow-soft transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[200px] sm:px-9 sm:text-sm sm:tracking-widest"
        >
          Elegí tu horario
        </a>
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full touch-manipulation items-center justify-center border border-outline-variant/60 bg-transparent px-8 py-4 font-label text-xs uppercase tracking-[0.22em] text-on-surface transition-colors hover:border-secondary/50 hover:bg-surface-container-high/80 sm:w-auto sm:min-w-[200px] sm:tracking-widest"
          >
            WhatsApp
          </a>
        ) : null}
      </div>

      <div
        className={
          isColumn
            ? "mt-8 rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 px-5 py-5 shadow-sm md:mt-10 md:px-6"
            : "mx-auto mt-10 max-w-lg rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 px-5 py-5 text-left shadow-sm md:mt-12 md:px-6"
        }
      >
        <div className="flex gap-3">
          <span className="material-symbols-outlined shrink-0 text-xl text-secondary/90" aria-hidden>
            info
          </span>
          <p className="font-body text-sm leading-relaxed text-on-surface-variant md:text-[0.9375rem]">
            Ante un error en la web o un pedido poco habitual, contactanos: armamos el turno de forma personalizada
            {waHref ? (
              <>
                {" "}
                por{" "}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-secondary underline decoration-secondary/35 underline-offset-[0.2em]"
                >
                  WhatsApp
                </a>
              </>
            ) : (
              " por WhatsApp"
            )}
            .
          </p>
        </div>
      </div>

      {!isColumn ? (
        <p className="mt-10 font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant md:mt-12">
          <Link
            href="/#contacto"
            className="border-b border-secondary/25 pb-0.5 text-secondary transition-colors hover:border-secondary/60"
          >
            Horarios y cómo llegar
          </Link>
        </p>
      ) : null}
    </div>
  );
}

type Props = {
  /** `false` en `/reservar` para no duplicar id en la misma página. */
  anchor?: boolean;
  phone: string;
};

export function OnlineTurnosSection({ anchor = true, phone }: Props) {
  return (
    <section
      {...(anchor ? { id: "reservar" as const } : {})}
      className="relative overflow-hidden bg-surface px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:px-12 lg:py-24"
      aria-labelledby="online-turnos-heading"
    >
      <div className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full bg-secondary/[0.06] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-8 h-48 w-48 rounded-full bg-tertiary-fixed/15 blur-3xl" aria-hidden />
      <OnlineTurnosPanel phone={phone} variant="standalone" />
    </section>
  );
}
