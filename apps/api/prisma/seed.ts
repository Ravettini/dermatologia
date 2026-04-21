import { PrismaClient, BookingStatus, LeadSource, SlotStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("DermaDemo2026!", 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@dermaclinic.local" },
    update: {},
    create: {
      email: "admin@dermaclinic.local",
      passwordHash,
      name: "Administración",
    },
  });

  const portraitPool = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBR5aiYZFRxuSxT7FTiqyQgLYVX1ssOXvFS0s8jGuP0ZvG5JnexGxEJejAnFgexfvdvOw7LU_vD-gjwlJILyzE0dtgL_I1b1kF60GT5Y8G0sKPSWSssWB6IaLqNOoggkxXF3BwTV6O9kT8i6wSszg15zPI5E0UOzph232LtqmvgmtRivCEQvlsmL6JthTONrlChcYFPiGj-IQ6npiWQP5GJHW14c7U2STqS99b2pyYatjcy0p3qA1o7mhl1i7PV_sna84ac2fURZd3K",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2M9P_2JwwHOnmCHanQ1a4TIEnqwlpxI3Q_SS8bmvFrJhUXh_ZB66YjqVgZfu3pfDMQlxRh8XRlnf6nqG68WdOuJ_N3_pKzJ6UDP_5mYgVpi82uAZONak4pNiw9arqKtI3B3KhwgvKd3pVo5CdlmZPsw3MoC6gbOVzByKettd6fRQJ4GSpddKeidKlDz6Yv2nrW8jaDXUTh1GEXKNu8h-jzV4bDc_yGgP9xdd9fqwTtgtMnPYqLFd6_Ucl09EV9hZH542a4ogxA7HR",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwjBvfD0ijK_lYM7Ex7-sA9YE-AmSYv9V5SYrPNaYKk7dnB28RNnGLrPSh3ObGRhXmdj1roHjQDjcthMnHm1IJWVtGQI_OvGmWZif8GiY7irB2gP2NZ6TD5y0gIX31TOrdytWDmUTtf_iXuC0lDKRWVAJe6H88wTZoOjEt6hrRZkzXt8iX_ObAjh076UeeN4hklEX-rLeDoeYFqMvzbQyydkiNs7eGuvhD6wHjimgPYT4rrYd2KOBxwiSa1SzA1Ndg8K6Tp6f60QUr",
  ] as const;

  const professionalDefs = [
    {
      id: "seed-tod-tezanos",
      name: "Dra. Tezanos Pinto Olivia",
      specialty: "Medicina estética · co directora",
      bio: [
        "Médica dermatóloga en medicina estética.",
        "Co directora.",
        "International speaker.",
        "Faculty Allergan Aesthetics Austral.",
        "Miembro Sociedad AAD – SAD.",
        "Universidad Austral.",
      ].join("\n"),
      sortOrder: 1,
    },
    {
      id: "seed-tod-olguin",
      name: "Dra. Olguín Florencia",
      specialty: "Medicina estética · co directora médica",
      bio: [
        "Médica dermatóloga en medicina estética.",
        "Co directora médica.",
        "Speaker trainer Merz.",
        "Miembro Sociedad AAD – SAD.",
        "Universidad de Buenos Aires.",
      ].join("\n"),
      sortOrder: 2,
    },
    {
      id: "seed-tod-deane",
      name: "Dra. Deane Lucía",
      specialty: "Medicina estética · rejuvenecimiento · longevidad · co directora médica",
      bio: [
        "Médica dermatóloga en medicina estética, rejuvenecimiento, longevidad y medicina funcional.",
        "Co directora médica.",
        "Speaker trainer Merz y Allergan.",
        "Miembro Sociedad AAD – SAD.",
        "Universidad Austral.",
      ].join("\n"),
      sortOrder: 3,
    },
    {
      id: "seed-tod-pardo",
      name: "Dra. Pardo Natalia",
      specialty: "Dermatología",
      bio: "Médica dermatóloga.",
      sortOrder: 4,
    },
    {
      id: "seed-tod-kahn",
      name: "Dra. Kahn Felicitas",
      specialty: "Dermatología",
      bio: "Médica dermatóloga.\nUniversidad Austral.",
      sortOrder: 5,
    },
    {
      id: "seed-tod-toninetti",
      name: "Dra. Toninetti Josefina",
      specialty: "Dermatología",
      bio: "Médica dermatóloga.",
      sortOrder: 6,
    },
    {
      id: "seed-tod-reggiani",
      name: "Dra. Reggiani Valentina",
      specialty: "Medicina clínica",
      bio: "Médica clínica.",
      sortOrder: 7,
    },
    {
      id: "seed-tod-gigirey",
      name: "Dra. Gigirey Agustina",
      specialty: "Dermatología",
      bio: "Médica dermatóloga.",
      sortOrder: 8,
    },
    {
      id: "seed-tod-varano",
      name: "Dra. Varano Jimena",
      specialty: "Pediatría",
      bio: "Médica pediatra.",
      sortOrder: 9,
    },
    {
      id: "seed-tod-kraft",
      name: "Kraft Ana",
      specialty: "Cosmetología",
      bio: "Cosmetología.",
      sortOrder: 10,
    },
    {
      id: "seed-tod-ortiz",
      name: "Ortiz Cintia",
      specialty: "Cosmetología",
      bio: "Cosmetología.",
      sortOrder: 11,
    },
  ] as const;

  await prisma.professional.deleteMany({
    where: { id: { in: ["seed-pro-1", "seed-pro-2", "seed-pro-3"] } },
  });

  const pros = await Promise.all(
    professionalDefs.map((p, i) => {
      const imageUrl = portraitPool[i % portraitPool.length];
      return prisma.professional.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          specialty: p.specialty,
          bio: p.bio,
          imageUrl,
          active: true,
          sortOrder: p.sortOrder,
        },
        create: {
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          bio: p.bio,
          imageUrl,
          active: true,
          sortOrder: p.sortOrder,
        },
      });
    })
  );

  const treatments = await Promise.all([
    prisma.treatment.upsert({
      where: { slug: "limpieza-facial-profunda" },
      update: {},
      create: {
        name: "Limpieza facial profunda",
        slug: "limpieza-facial-profunda",
        description: "Remoción de impurezas y nutrición intensa para un cutis renovado.",
        durationMinutes: 45,
        category: "Facial",
        sortOrder: 1,
      },
    }),
    prisma.treatment.upsert({
      where: { slug: "peelings-medicos" },
      update: {},
      create: {
        name: "Peelings médicos",
        slug: "peelings-medicos",
        description: "Renovación celular guiada para manchas y texturas irregulares.",
        durationMinutes: 40,
        category: "Facial",
        sortOrder: 2,
      },
    }),
    prisma.treatment.upsert({
      where: { slug: "control-de-acne" },
      update: {},
      create: {
        name: "Control de acné",
        slug: "control-de-acne",
        description: "Protocolos médicos integrales para brotes y secuelas.",
        durationMinutes: 35,
        category: "Clínica",
        sortOrder: 3,
      },
    }),
    prisma.treatment.upsert({
      where: { slug: "rejuvenecimiento" },
      update: {},
      create: {
        name: "Rejuvenecimiento",
        slug: "rejuvenecimiento",
        description: "Enfoques combinados para una expresión fresca y natural.",
        durationMinutes: 50,
        category: "Estética",
        requiresPriorEval: true,
        sortOrder: 4,
      },
    }),
    prisma.treatment.upsert({
      where: { slug: "depilacion-medica" },
      update: {},
      create: {
        name: "Depilación médica láser",
        slug: "depilacion-medica",
        description: "Tecnología láser con enfoque médico y seguimiento personalizado.",
        durationMinutes: 30,
        category: "Corporal",
        sortOrder: 5,
      },
    }),
    prisma.treatment.upsert({
      where: { slug: "consulta-dermatologica" },
      update: {},
      create: {
        name: "Consulta dermatológica general",
        slug: "consulta-dermatologica",
        description: "Evaluación integral de piel, pelo y uñas.",
        durationMinutes: 30,
        category: "Clínica",
        sortOrder: 0,
      },
    }),
  ]);

  /** Solo FAQs del documento clínico (sin administrativas). Las 3 primeras se muestran en la home. */
  const faqs = [
    {
      q: "Botox — ¿Para qué sirve?",
      a: "Se utiliza para suavizar líneas en frente, entrecejo y patas de gallo, también para prevenir la formación de arrugas.",
    },
    {
      q: "Ácido hialurónico — ¿Cuándo se ven los resultados?",
      a: "Son inmediatos, aunque el resultado final se aprecia mejor a los pocos días.",
    },
    {
      q: "Luz pulsada — ¿Qué es la luz pulsada?",
      a: "Es una tecnología que emite pulsos de luz para tratar distintas alteraciones de la piel como manchas, rojeces y signos de fotoenvejecimiento.",
    },
    {
      q: "Botox — ¿Cuándo se empiezan a ver los resultados?",
      a: "Comienzan a notarse entre los 3 y 5 días, con el resultado final a los 15 días.",
    },
    {
      q: "Botox — ¿Cuánto dura el efecto?",
      a: "Entre 4 y 6 meses, dependiendo de cada paciente.",
    },
    {
      q: "Botox — ¿Qué debo evitar después de la aplicación?",
      a: "Durante las primeras 4 horas: no acostarse, no masajear la zona y evitar ejercicio intenso.",
    },
    {
      q: "Botox — ¿Puedo maquillarme?",
      a: "Sí, unas horas después del procedimiento.",
    },
    {
      q: "Ácido hialurónico — ¿Cuánto dura?",
      a: "Entre 12 y 18 meses, depende de cada persona y según la zona tratada.",
    },
    {
      q: "Ácido hialurónico — ¿Se puede hacer vida normal?",
      a: "Sí, aunque puede haber leve inflamación, enrojecimiento o pequeños hematomas leves que desaparecen en pocos días.",
    },
    {
      q: "Ácido hialurónico — ¿Qué debo evitar?",
      a: [
        "Evitar hacer ejercicio intenso 15 días antes y 15 días después.",
        "Evitar concurrir al odontólogo 30 días antes y 30 días después.",
        "No tomar aspirinas ni ibuprofeno 7 días antes.",
        "No ingerir alcohol 48 h previas.",
        "Evitar vacunarse 1 mes antes del tratamiento y 1 mes después.",
        "Evitar exponerse al sol.",
        "Evitar ejercicio el mismo día de la aplicación.",
      ].join("\n"),
    },
    {
      q: "Ácido hialurónico — ¿Se puede combinar con otros tratamientos?",
      a: "Sí; si se combina, puede ser con bioestimuladores para un abordaje integral.",
    },
    {
      q: "Bioestimuladores — ¿Cómo sé si es para mí?",
      a: "Se define en consulta, evaluando el grado de flacidez, calidad de piel y objetivos.",
    },
    {
      q: "Bioestimuladores — ¿Cuándo se ven los resultados?",
      a: "Sí, al estimular tu propio colágeno, el cambio es gradual, sutil y armónico.",
    },
    {
      q: "Bioestimuladores — ¿Cuánto duran?",
      a: "24 meses, dependiendo de cada paciente.",
    },
    {
      q: "Bioestimuladores — ¿Se puede hacer vida normal después?",
      a: "Sí, aunque puede haber leve inflamación o sensibilidad transitoria.",
    },
    {
      q: "Bioestimuladores — ¿Qué debo hacer antes y después del tratamiento?",
      a: [
        "Seguir las indicaciones médicas, que pueden incluir masajes específicos según el producto utilizado.",
        "",
        "Sculptra: regla de los 5 minutos: masajear la zona, ayudada de una crema humectante, durante 5 minutos, 5 veces al día, por 5 días. Esto va a prevenir que se generen durezas.",
        "Evitar vacunarse un mes antes y un mes después del tratamiento.",
        "Evitar la exposición al sol los 7 días posteriores al tratamiento.",
        "La rutina de cremas de la noche del tratamiento será solamente con cremas hidratantes o humectantes.",
        "Se puede maquillar la zona a las 2 h de la aplicación.",
      ].join("\n"),
    },
    {
      q: "Luz pulsada — ¿Para qué sirve?",
      a: "Permite mejorar el tono, reducir manchas solares, tratar lesiones vasculares y estimular colágeno.",
    },
    {
      q: "Luz pulsada — ¿Cuántas sesiones se recomiendan?",
      a: "Generalmente entre 1 y 3 sesiones, según indicación.",
    },
  ];

  await prisma.fAQItem.deleteMany();
  for (let i = 0; i < faqs.length; i++) {
    await prisma.fAQItem.create({
      data: { question: faqs[i].q, answer: faqs[i].a, sortOrder: i },
    });
  }

  await prisma.testimonial.deleteMany();
  const quotes = [
    {
      quote:
        "La atención fue impecable. Me sentí acompañada y los resultados se notaron de forma natural.",
      author: "Elena G.",
    },
    {
      quote: "Excelente clínica: equipamiento y equipo humano de primer nivel.",
      author: "Julián M.",
    },
    {
      quote: "Buscaba un enfoque médico serio para mi rosácea y lo encontré aquí.",
      author: "Clara P.",
    },
  ];
  for (let i = 0; i < quotes.length; i++) {
    await prisma.testimonial.create({
      data: { quote: quotes[i].quote, author: quotes[i].author, sortOrder: i },
    });
  }

  const settings: Record<string, string> = {
    "site.name": "DERMATOLOGÍA TOD",
    "site.tagline": "Dermatología clínica y estética",
    "contact.address": "Camino Boulogne Bancalari 3350, Victoria",
    "contact.phone": "+54 9 11 2699-2405",
    "contact.whatsapp": "5491126992405",
    "contact.email": "Dermatologiatod@gmail.com",
    "contact.hours": "Lunes a viernes de 9 a 19 hs.",
    "contact.mapImageUrl": "Camino Boulogne Bancalari 3350, Victoria, Argentina",
    "legal.disclaimer":
      "La información del sitio es educativa y no reemplaza la consulta médica. Los resultados varían según cada persona.",
    "chatbot.systemPrompt": [
      "Sos el asistente virtual de DERMATOLOGÍA TOD (Victoria, Buenos Aires).",
      "Tono profesional, cálido y sobrio, en español rioplatense.",
      "No des diagnósticos ni recomiendes medicación. Ante síntomas o dudas clínicas, sugerí consulta presencial.",
      "Orientá sobre servicios, turnos y dudas generales. Si quiere reservar, indicá la sección de reservas o contacto.",
      "Respondé solo lo que corresponda al mensaje del usuario, sin textos largos de bienvenida ni repetir el mismo discurso en cada turno.",
    ].join(" "),
    "chatbot.welcomeMessage":
      "Hola, soy el asistente virtual de DERMATOLOGÍA TOD. ¿En qué puedo orientarte hoy?",
    "chatbot.tone": "profesional, cercano, sobrio",
    "chatbot.humanHandoffHint":
      "Podés escribirnos por WhatsApp o dejar tus datos en la sección de contacto.",
    "chatbot.fallbackMessage":
      "No puedo completar la respuesta en este momento. Te recomiendo contactar al centro o solicitar turno desde la web.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  await prisma.bookingRequest.deleteMany();
  await prisma.availabilitySlot.deleteMany();

  // Slots próximos 14 días, mañana y tarde
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 1; d <= 14; d++) {
    const day = new Date(start);
    day.setDate(day.getDate() + d);
    if (day.getDay() === 0 || day.getDay() === 6) continue;

    const pro = pros[d % pros.length];
    const tr = treatments[d % treatments.length];

    const morning = new Date(day);
    morning.setHours(10, 0, 0, 0);
    const morningEnd = new Date(morning);
    morningEnd.setMinutes(morning.getMinutes() + tr.durationMinutes);

    const afternoon = new Date(day);
    afternoon.setHours(16, 30, 0, 0);
    const afternoonEnd = new Date(afternoon);
    afternoonEnd.setMinutes(afternoon.getMinutes() + tr.durationMinutes);

    await prisma.availabilitySlot.create({
      data: {
        professionalId: pro.id,
        treatmentId: tr.id,
        startsAt: morning,
        endsAt: morningEnd,
        status: SlotStatus.AVAILABLE,
      },
    });
    await prisma.availabilitySlot.create({
      data: {
        professionalId: pro.id,
        treatmentId: tr.id,
        startsAt: afternoon,
        endsAt: afternoonEnd,
        status: SlotStatus.AVAILABLE,
      },
    });
  }

  const demoLead = await prisma.contactLead.create({
    data: {
      name: "Paciente Demo",
      email: "demo@example.com",
      phone: "+54 11 6000-0000",
      source: LeadSource.WEB_FORM,
    },
  });

  const slotDemo = await prisma.availabilitySlot.findFirst({
    where: { status: SlotStatus.AVAILABLE },
  });

  if (slotDemo) {
    await prisma.bookingRequest.create({
      data: {
        contactLeadId: demoLead.id,
        treatmentId: treatments[0].id,
        professionalId: slotDemo.professionalId,
        availabilitySlotId: slotDemo.id,
        status: BookingStatus.PENDING_CONFIRMATION,
        source: LeadSource.BOOKING_WIDGET,
        consentAccepted: true,
        patientMessage: "Preferencia por turno mañana.",
      },
    });
    await prisma.availabilitySlot.update({
      where: { id: slotDemo.id },
      data: { status: SlotStatus.PENDING },
    });
  }

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "SEED",
      entity: "system",
      metadata: JSON.stringify({ at: new Date().toISOString() }),
    },
  });

  console.log("Seed OK. Admin:", admin.email, "Password: DermaDemo2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
