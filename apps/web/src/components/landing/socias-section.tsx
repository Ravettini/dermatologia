"use client";

import Image from "next/image";

export type SociasMember = {
  id: string;
  name: string;
  specialty: string;
  subtitle?: string | null;
  bio: string | null;
  imageUrl: string | null;
};

export function SociasSection({ members }: { members: SociasMember[] }) {
  if (members.length === 0) return null;

  return (
    <section
      className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
      id="socias"
      aria-labelledby="socias-heading"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 sm:mb-12">
          <h2 id="socias-heading" className="font-headline text-3xl text-on-surface md:text-4xl">
            Liderazgo
          </h2>
          <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
            Fundadoras y codirectoras médicas que guían la propuesta del centro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {members.map((m) => (
            <div
              key={m.id}
              className={`space-y-6 ${members.length === 1 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""}`}
            >
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden bg-surface-container-high sm:max-w-[280px]">
                {m.imageUrl ? (
                  <Image
                    src={m.imageUrl}
                    alt={m.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-on-surface-variant">
                    {m.name}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-headline text-2xl text-secondary">{m.name}</h3>
                <p className="mt-1 font-label text-xs uppercase tracking-widest text-on-surface-variant">{m.specialty}</p>
                {m.subtitle ? (
                  <p className="mt-1 font-body text-sm italic text-on-surface-variant">{m.subtitle}</p>
                ) : null}
                {m.bio ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{m.bio}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
