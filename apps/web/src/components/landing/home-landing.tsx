import Image from "next/image";
import Link from "next/link";
import { BookingSection } from "@/components/booking-section";
import { ContactForm } from "@/components/contact-form";

type FAQ = { id: string; question: string; answer: string };
type Testimonial = { id: string; quote: string; author: string };

export function HomeLanding({
  site,
  faqs,
  testimonials,
}: {
  site: Record<string, string>;
  faqs: FAQ[];
  testimonials: Testimonial[];
}) {
  const address = site["contact.address"] ?? "Av. Libertador 2450, Piso 8, CABA";
  const phone = site["contact.phone"] ?? "+54 11 4821-0000";
  const email = site["contact.email"] ?? "info@dermaclinic.com";
  const hours = site["contact.hours"] ?? "Lunes a viernes de 09:00 a 20:00";
  const mapUrl = site["contact.mapImageUrl"] ?? "";
  const disclaimer = site["legal.disclaimer"] ?? "";

  return (
    <main>
      <section className="flex min-h-screen items-center px-6 pb-20 pt-32 md:px-12" id="inicio">
        <div className="grid w-full grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="max-w-2xl">
            <span className="mb-6 block font-label text-xs uppercase tracking-[0.3em] text-secondary">
              Cuidado experto para tu piel
            </span>
            <h1 className="mb-8 font-headline text-5xl leading-[1.1] text-on-surface md:text-7xl">
              Dermatología clínica y estética con una mirada profesional y personalizada
            </h1>
            <p className="mb-10 font-body text-lg leading-relaxed text-on-surface-variant opacity-80 md:text-xl">
              Tratamientos pensados para cuidar, mejorar y acompañar la salud y belleza de tu piel, combinando
              evidencia científica con una estética natural y equilibrada.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/#reservar"
                className="bg-on-primary-container px-8 py-4 font-label text-sm uppercase tracking-widest text-surface transition-all hover:opacity-90"
              >
                Pedir turno
              </Link>
              <Link
                href="/#tratamientos"
                className="border-b border-on-surface-variant px-2 py-4 font-label text-sm uppercase tracking-widest text-on-surface-variant transition-all hover:text-secondary"
              >
                Ver tratamientos
              </Link>
            </div>
            {disclaimer && (
              <p className="mt-8 max-w-xl text-xs leading-relaxed text-on-surface-variant">{disclaimer}</p>
            )}
          </div>
          <div className="relative h-[600px] overflow-hidden md:h-[800px]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgVJXAjPV79yyHsezLlvM8ALw8EpNEwGsfY7zusDnboo8I7GvM-sZvhQxC0jwsylRfjQtS_r19F5bOcb3idcFttejh4XDn5MO_ZIe-pAnGiT33AIIp4TzicAa4pD51x4GgFlER_-c5DZ-s0fUdXLLaN7usBHWNGQ0EHnB7smocy7coYrpYVOUDn1W4JEclo_dTd38xsU6zqCchOXUu5fuGOfDT4Pjxrce9KdW1k_sjLdk8Y5X00EEm2o3ukZvsgGOUbv8Cs0cnoagu"
              alt="Retrato editorial con piel luminosa y luz suave"
              fill
              className="object-cover grayscale-[20%]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-secondary/5 mix-blend-multiply" />
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-12" id="tratamientos">
        <div className="grid grid-cols-1 gap-px bg-outline-variant/10 md:grid-cols-4">
          {[
            {
              icon: "face",
              title: "Tratamientos faciales",
              text: "Procedimientos diseñados para restaurar la luminosidad y salud del rostro.",
            },
            {
              icon: "body_fat",
              title: "Tratamientos corporales",
              text: "Tecnología avanzada para remodelación y tonificación corporal no invasiva.",
            },
            {
              icon: "medical_services",
              title: "Depilación médica",
              text: "Láser médico para resultados con enfoque clínico y seguimiento personalizado.",
            },
            {
              icon: "stethoscope",
              title: "Dermatología clínica",
              text: "Evaluación y acompañamiento de patologías de la piel, pelo y uñas.",
            },
          ].map((c) => (
            <div key={c.title} className="bg-surface-container-low p-12 transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined mb-6 block text-3xl text-secondary">{c.icon}</span>
              <h3 className="mb-4 font-headline text-2xl">{c.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{c.text}</p>
              <span className="font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8">
                Descubrir
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden bg-surface px-6 py-32 md:px-12" id="dermatologia">
        <div className="mb-24 max-w-4xl">
          <h2 className="font-headline text-4xl italic leading-tight text-secondary md:text-6xl">
            La excelencia médica se encuentra con el arte del cuidado.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCp_pqkQLNW866nnMhVijcxPPBTxTYpBap46efqrVuyINM8Xnu5JkOqZuMQRRhqZR__GxpKFOTR7CiaL1PZStFxBB14izudFb4yKRMtUuUO1JfDIGh0xiFPHN0Qz68mMv-Td3F5akv_4rZUdMPH0txox4DtbU3-OOGF0xHBB-eXUjKQX887YwHXkQbhskNj_9ONrXoPRGMNiyIB9ahthUVtThNXXtxKpgT_E6L-iotPWCTIlJZO0X-8DQ6xC20WPW57ta9nJN6HSEhZ",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBe509qi6Q9WiXURLhWsoaNkFj9aWcd-sGlBYC_L4iCZ7NASWPkd-jTXhkyUUPY55iwLaRX-oU3yq0PzB-hc3WxwLRBSFmgobaPA7BIe1t7c6KdQikDQCqbUmF66LyvoXJHbk9l5O1lInZiSpqZJnWaxpRHdiHzOw7GyF5XH7nw_fjxBLn3LX0NMHh8WZ_NBzjYE8AcaMvJ5BsEL4r60-ii8L0NAw4Fwc0t6KZ1-7iE0ASxB1jhpQzUsn8oll0B-IwipIwk6J6pGhIK",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBlYXRmngE1Fmgt4m21KVMn1vfu97gPXstKxPLz-UeEbwIUSELkoDajcCylVej5jiQvvnB66FgKX_pB6oGi_d0PALuAnJBlnKC31_Z5482Q8-CoPaVyvvI7yp22oZn5QZiEgdgL1XGtZ6lyhvSSrZvCh_uXhDEWAswiIPvvI4yN4bDVuxyJBtaaxVCtpr-nZJsUPOEMsnVp4MHmQNfR7aa4Y0Xnzrk9mABPkZr5ZPkEUy7bQedtmrfYb1qu0oHNYrkQjKsMaVdGO1Qy",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuADCh0CqgsalPpOHjHCr1h9HgJH3i3P1ag8gZG8NSjKPG78AGVDuPPWn99yYS2Uo-0FekM4pgC_wNOjUfw26hnp5FxRM8pSzDJ_SjE85L4ui7VyCzKY5DcHVK7HK3Bf1VLBWTSGf1U-4MrIrbAoJrIbmEOkWVMAQ-yFyySO-cy1Xj_mVS35LetN3BgvzJo0Z6sfL-iljToRiZmk2EKhXtW44yN2SwSY3LotH4RjQIWvWieli0L1A40RShIHbK4HAmJ_0SOFPtzDgmfr",
          ].map((src, i) => (
            <div key={src} className={`aspect-[3/4] ${i % 2 === 0 ? "md:translate-y-12" : ""} ${i === 2 ? "md:translate-y-24" : ""} ${i === 3 ? "md:translate-y-6" : ""}`}>
              <div className="relative h-full w-full">
                <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container px-6 py-32 md:px-12">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-3">
          {[
            {
              n: "01.",
              t: "Profesionales de la salud",
              p: "Médicos especialistas dedicados a dermatología clínica y estética responsable.",
            },
            {
              n: "02.",
              t: "Atención personalizada",
              p: "Cada piel es única. Planes a medida según objetivos y necesidades.",
            },
            {
              n: "03.",
              t: "Tecnología especializada",
              p: "Equipamiento con estándares de seguridad y seguimiento cercano.",
            },
          ].map((x) => (
            <div key={x.n} className="flex flex-col gap-6">
              <span className="font-headline text-5xl text-secondary/30">{x.n}</span>
              <h4 className="font-headline text-2xl">{x.t}</h4>
              <p className="font-body leading-relaxed text-on-surface-variant">{x.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid h-auto grid-cols-1 bg-tertiary-fixed md:grid-cols-2 md:h-[600px]">
        <div className="flex flex-col justify-center px-12 py-16 md:px-24">
          <h2 className="mb-8 font-headline text-4xl md:text-5xl">Evolucioná el cuidado de tu piel.</h2>
          <Link
            href="/#reservar"
            className="w-fit bg-on-primary-container px-12 py-5 font-label text-sm uppercase tracking-widest text-surface transition-colors hover:bg-on-surface"
          >
            Agendar consulta
          </Link>
        </div>
        <div className="relative hidden min-h-[320px] md:block">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuApY73RTj_UM83QyEiDXTOG4PJxMHoAO0M_So0N4BlWkbEx4mHRVSKfWBH3MmPHxD9trIuvzUCHBJm5SQubcYHZxqI7Agz7xS1oYPqUJCZlyZYRoefNj_nQLLMS4VZyR-M3vOdTBNMCCDio7BCL-m5Tv4oD9XYO8FsgrsGCSWjaj57LhU5n4WJbciqwi2LVejxmXR7PkiKExjlmUBeNbK1eoRlDoPr_Rw-R-R6F-CvWjhuY8YQq3DiWBQOyCL5L5sV7YdQ_Wvxz4BL1"
            alt="Atención clínica"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </section>

      <section className="bg-surface px-6 py-32 md:px-12">
        <div className="mb-20 text-center">
          <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Nuestra experiencia</span>
          <h2 className="font-headline text-4xl md:text-5xl">Especialidades destacadas</h2>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {[
            {
              title: "Limpieza facial profunda",
              text: "Remoción de impurezas y nutrición intensa para un cutis renovado.",
            },
            { title: "Peelings médicos", text: "Renovación celular guiada para manchas y texturas irregulares." },
            { title: "Control de acné", text: "Protocolos médicos integrales para brotes y secuelas." },
            { title: "Rejuvenecimiento", text: "Enfoques combinados para una expresión fresca y natural." },
          ].map((t) => (
            <div
              key={t.title}
              className="group flex items-start justify-between border border-outline-variant/30 p-10 transition-colors duration-500 hover:bg-surface-container-low"
            >
              <div>
                <h5 className="mb-2 font-headline text-2xl">{t.title}</h5>
                <p className="max-w-xs text-sm text-on-surface-variant">{t.text}</p>
              </div>
              <span className="material-symbols-outlined text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                arrow_outward
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-32 md:px-12" id="equipo">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {[
            {
              name: "Dra. Martina Rossi",
              role: "Directora médica & estética",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR5aiYZFRxuSxT7FTiqyQgLYVX1ssOXvFS0s8jGuP0ZvG5JnexGxEJejAnFgexfvdvOw7LU_vD-gjwlJILyzE0dtgL_I1b1kF60GT5Y8G0sKPSWSssWB6IaLqNOoggkxXF3BwTV6O9kT8i6wSszg15zPI5E0UOzph232LtqmvgmtRivCEQvlsmL6JthTONrlChcYFPiGj-IQ6npiWQP5GJHW14c7U2STqS99b2pyYatjcy0p3qA1o7mhl1i7PV_sna84ac2fURZd3K",
            },
            {
              name: "Dra. Sofía Méndez",
              role: "Dermatología clínica",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2M9P_2JwwHOnmCHanQ1a4TIEnqwlpxI3Q_SS8bmvFrJhUXh_ZB66YjqVgZfu3pfDMQlxRh8XRlnf6nqG68WdOuJ_N3_pKzJ6UDP_5mYgVpi82uAZONak4pNiw9arqKtI3B3KhwgvKd3pVo5CdlmZPsw3MoC6gbOVzByKettd6fRQJ4GSpddKeidKlDz6Yv2nrW8jaDXUTh1GEXKNu8h-jzV4bDc_yGgP9xdd9fqwTtgtMnPYqLFd6_Ucl09EV9hZH542a4ogxA7HR",
            },
            {
              name: "Dr. Lucas Ferreira",
              role: "Cirugía dermatológica",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwjBvfD0ijK_lYM7Ex7-sA9YE-AmSYv9V5SYrPNaYKk7dnB28RNnGLrPSh3ObGRhXmdj1roHjQDjcthMnHm1IJWVtGQI_OvGmWZif8GiY7irB2gP2NZ6TD5y0gIX31TOrdytWDmUTtf_iXuC0lDKRWVAJe6H88wTZoOjEt6hrRZkzXt8iX_ObAjh076UeeN4hklEX-rLeDoeYFqMvzbQyydkiNs7eGuvhD6wHjimgPYT4rrYd2KOBxwiSa1SzA1Ndg8K6Tp6f60QUr",
            },
          ].map((m) => (
            <div key={m.name} className="space-y-6">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={m.img} alt={m.name} fill className="object-cover" sizes="33vw" />
              </div>
              <div>
                <h4 className="font-headline text-2xl">{m.name}</h4>
                <p className="mt-1 font-label text-xs uppercase tracking-widest text-secondary">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-on-primary-container px-6 py-32 text-surface md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="flex h-full flex-col justify-between">
              <span className="material-symbols-outlined text-4xl text-secondary">format_quote</span>
              <p className="my-8 font-headline text-2xl italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <span className="font-label text-xs uppercase tracking-widest opacity-60">— {t.author}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface px-6 py-32 md:px-12" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-16 text-center font-headline text-4xl">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {faqs.map((f, idx) => (
              <details key={f.id} className="group border-b border-outline-variant/30 py-6" open={idx === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-xl">
                  {f.question}
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 font-body leading-relaxed text-on-surface-variant">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BookingSection />

      <section className="bg-surface-container-high px-6 py-32 md:px-12" id="contacto">
        <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
          <div>
            <h2 className="mb-12 font-headline text-4xl md:text-5xl">Estamos para acompañarte.</h2>
            <div className="space-y-10">
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <div>
                  <h6 className="mb-1 font-label text-xs uppercase tracking-widest">Ubicación</h6>
                  <p className="font-body">{address}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-secondary">phone</span>
                <div>
                  <h6 className="mb-1 font-label text-xs uppercase tracking-widest">Teléfono</h6>
                  <p className="font-body">{phone}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <div>
                  <h6 className="mb-1 font-label text-xs uppercase tracking-widest">Horarios</h6>
                  <p className="font-body">{hours}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface p-12 shadow-sm">
            <h3 className="mb-6 font-headline text-2xl">Dejanos tus datos</h3>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="h-[400px] w-full overflow-hidden bg-surface-container-highest">
        {mapUrl ? (
          <div className="relative h-full w-full grayscale">
            <Image src={mapUrl} alt="Mapa ilustrativo de ubicación" fill className="object-cover" sizes="100vw" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
            Mapa no configurado (administración)
          </div>
        )}
      </section>

      <section className="bg-surface px-6 py-32 text-center">
        <h2 className="mb-10 font-headline text-5xl md:text-6xl">Cuidá tu piel. Pedí tu turno.</h2>
        <Link
          href="/#reservar"
          className="inline-block bg-on-primary-container px-16 py-6 font-label text-sm uppercase tracking-widest text-surface transition-colors hover:bg-on-surface"
        >
          Agendar ahora
        </Link>
      </section>
    </main>
  );
}
