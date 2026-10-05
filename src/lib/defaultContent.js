// Valores por defecto del contenido editable.
// Sirven como fallback si Firebase todavía no tiene el documento `content/main`.

export const DEFAULT_CONTENT = {
  version: 1,

  brand: {
    name: 'CLINICA OFF ROAD',
    edition: 'Novena edicion',
    hashtag: '#carbosalidas',
  },

  hero: {
    badge: '4 de OCTUBRE 2026',
    title: 'Clinica Off Road',
    subtitle:
      'Clinica de manejo en tierra guiada por instructores profesionales AMT (Advanced Moto Training).',
    image: '',
    imageAlt: 'Clinica de off road',
    ctaText: 'Inscribirme',
    ctaSecondaryText: 'Ver informacion',
  },

  about: {
    body: 'Adquirir conceptos y habilidades de manejo en tierra, posiciones de manejo y control, tecnicas de frenado, gestion de equilibrio y mirada, lectura del terreno y ejercicios de practica guiados. El predio cuenta con diferentes circuitos con niveles de dificultad.',
    instructors: 'Instructores profesionales AMT',
  },

  event: {
    date: 'DOMINGO 4/octubre/2026',
    time: '10:30 hs',
    venue: 'PANDA TROUPE Off Road',
    address: 'RN5 KM 71, Olivera, Provincia de Buenos Aires (a 10 km de Lujan)',
    mapsUrl: 'https://maps.google.com/?q=Panda+Troupe+Off+Road',
    badge: 'Cupos limitados',
    notes: [
      'Pueden ir directo al predio a las 10:30 o, si prefieren, nos juntamos para rodar en grupo (se coordinara por WhatsApp).',
      'En caso de lluvia se reprograma.',
    ],
  },

  pricing: {
    title: 'Valores',
    basePrice: '$120.000,-',
    baseNote: 'La inscripcion incluye entrada al predio, seguro, hidratacion y merchandising.',
    lunchEnabled: true,
    lunchTitle: 'Almuerzo (opcional)',
    lunchPrice: '$40.000,-',
    lunchDescription: 'Parrillada completa con bebida de 300cc',
    lunchNote: 'Por favor tildar la pregunta si optan por almuerzo para saber que cantidad preparar. Pueden llevar su propio almuerzo al predio.',
    callout: 'PUEDEN VENIR CON CUALQUIER MARCA Y MODELO DE MOTO (la idea es que sea apta para la tierra).',
  },

  faq: [
    { q: 'Tengo que tener experiencia previa?', a: 'No. Hay circuitos con distintos niveles de dificultad y los instructores acompañan a cada grupo.' },
    { q: 'Que incluye la inscripcion?', a: 'Entrada al predio, seguro, hidratacion y merchandising.' },
    { q: 'Puedo llevar mi propia moto?', a: 'Si, puede venir con cualquier marca y modelo de moto apta para la tierra.' },
    { q: 'Que pasa si llueve?', a: 'El evento se reprograma y se avisa por el grupo de WhatsApp.' },
  ],

  contact: {
    title: 'Contacto',
    name: 'Esteban Carbonell (CARBO)',
    phone: '1150443330',
    whatsapp: 'https://wa.me/541150443330',
  },

  social: {
    hashtags: ['#carbosalidas', '#clinicaoffroad', '#offroad', '#clinica', '#manejo'],
  },

  form: {
    title: 'Inscripcion',
    subtitle: '4 pasos cortos. Solo necesit tus datos, los de tu moto y si almorzás con nosotros.',
    thanksTitle: 'Inscripcion registrada',
    thanksBody: 'Gracias! Recibimos tus datos. Te vamos a contacting por WhatsApp para confirmar los detalles.',
    confirmLabel: 'Quiero inscribirme a la clinica',
    experienceOptions: ['Sin experiencia', 'Principiante', 'Intermedio', 'Avanzado'],
    rideWithGroupOptions: ['Si, quiero rodar en grupo', 'No, voy directo al predio'],
    showGroupRide: true,
    showLunch: true,
    showNotes: true,
    privacyNote:
      'Usamos tus datos solo para organizar la evento. No los compartimos con terceros.',
  },

  theme: {
    accent: '#f97316',
    accentAlt: '#facc15',
    heroImageOpacity: 0.55,
    showHeroImage: true,
  },
}

export const emptyRegistration = () => ({
  persona: {
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    whatsapp: '',
    localidad: '',
    experiencia: '',
    comoSeEntero: '',
  },
  moto: {
    cilindradaRango: '',
  },
  alimentacion: {
    almuerzo: '',
    opcionAlmuerzo: '',
    restricciones: '',
    bebida: '',
  },
  final: {
    grupo: '',
    notas: '',
    aceptaTerminos: false,
  },
})