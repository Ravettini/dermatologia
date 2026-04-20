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

  const pros = await Promise.all([
    prisma.professional.upsert({
      where: { id: "seed-pro-1" },
      update: {},
      create: {
        id: "seed-pro-1",
        name: "Dra. Martina Rossi",
        specialty: "Dermatología clínica y estética",
        bio: "Directora médica. Enfoque en diagnóstico preciso y planes personalizados.",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBR5aiYZFRxuSxT7FTiqyQgLYVX1ssOXvFS0s8jGuP0ZvG5JnexGxEJejAnFgexfvdvOw7LU_vD-gjwlJILyzE0dtgL_I1b1kF60GT5Y8G0sKPSWSssWB6IaLqNOoggkxXF3BwTV6O9kT8i6wSszg15zPI5E0UOzph232LtqmvgmtRivCEQvlsmL6JthTONrlChcYFPiGj-IQ6npiWQP5GJHW14c7U2STqS99b2pyYatjcy0p3qA1o7mhl1i7PV_sna84ac2fURZd3K",
        active: true,
        sortOrder: 1,
      },
    }),
    prisma.professional.upsert({
      where: { id: "seed-pro-2" },
      update: {},
      create: {
        id: "seed-pro-2",
        name: "Dra. Sofía Méndez",
        specialty: "Dermatología clínica",
        bio: "Patología cutánea, acné y rosácea con seguimiento cercano.",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB2M9P_2JwwHOnmCHanQ1a4TIEnqwlpxI3Q_SS8bmvFrJhUXh_ZB66YjqVgZfu3pfDMQlxRh8XRlnf6nqG68WdOuJ_N3_pKzJ6UDP_5mYgVpi82uAZONak4pNiw9arqKtI3B3KhwgvKd3pVo5CdlmZPsw3MoC6gbOVzByKettd6fRQJ4GSpddKeidKlDz6Yv2nrW8jaDXUTh1GEXKNu8h-jzV4bDc_yGgP9xdd9fqwTtgtMnPYqLFd6_Ucl09EV9hZH542a4ogxA7HR",
        active: true,
        sortOrder: 2,
      },
    }),
    prisma.professional.upsert({
      where: { id: "seed-pro-3" },
      update: {},
      create: {
        id: "seed-pro-3",
        name: "Dr. Lucas Ferreira",
        specialty: "Cirugía dermatológica menor",
        bio: "Procedimientos ambulatorios con estándares de seguridad y estética natural.",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDwjBvfD0ijK_lYM7Ex7-sA9YE-AmSYv9V5SYrPNaYKk7dnB28RNnGLrPSh3ObGRhXmdj1roHjQDjcthMnHm1IJWVtGQI_OvGmWZif8GiY7irB2gP2NZ6TD5y0gIX31TOrdytWDmUTtf_iXuC0lDKRWVAJe6H88wTZoOjEt6hrRZkzXt8iX_ObAjh076UeeN4hklEX-rLeDoeYFqMvzbQyydkiNs7eGuvhD6wHjimgPYT4rrYd2KOBxwiSa1SzA1Ndg8K6Tp6f60QUr",
        active: true,
        sortOrder: 3,
      },
    }),
  ]);

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

  const faqs = [
    {
      q: "¿Cómo pido mi primer turno?",
      a: "Podés solicitar turno desde la sección Reservá tu consulta, por WhatsApp o llamando en horario comercial.",
    },
    {
      q: "¿Trabajan con prepagas u obras sociales?",
      a: "Trabajamos con planes seleccionados. Consultá por tu cobertura al contactarnos.",
    },
    {
      q: "¿Qué debo llevar a la primera consulta?",
      a: "Estudios previos si los tenés y una lista de productos que usás en tu rutina diaria.",
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
    "site.name": "Dermaclinic",
    "site.tagline": "Centro de dermatología de alta gama",
    "contact.address": "Av. Libertador 2450, Piso 8, CABA",
    "contact.phone": "+54 11 4821-0000",
    "contact.email": "info@dermaclinic.com",
    "contact.hours": "Lunes a viernes de 09:00 a 20:00",
    "contact.mapImageUrl": "Obelisco, Buenos Aires",
    "legal.disclaimer":
      "La información del sitio es educativa y no reemplaza la consulta médica. Los resultados varían según cada persona.",
    "chatbot.systemPrompt": [
      "Sos el asistente virtual de un centro de dermatología premium.",
      "Tono profesional, cálido y sobrio, en español rioplatense.",
      "No des diagnósticos ni recomiendes medicación. Ante síntomas o dudas clínicas, sugerí consulta presencial.",
      "Orientá sobre servicios, turnos y dudas generales. Si quiere reservar, indicá la sección de reservas o contacto.",
      "Respondé solo lo que corresponda al mensaje del usuario, sin textos largos de bienvenida ni repetir el mismo discurso en cada turno.",
    ].join(" "),
    "chatbot.welcomeMessage":
      "Hola, soy el asistente virtual de Dermaclinic. ¿En qué puedo orientarte hoy?",
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

    const pro = pros[d % 3];
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
