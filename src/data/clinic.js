/* ============================================================================
   DEMO — TODOS LOS DATOS DE ESTE ARCHIVO SON INVENTADOS (versión beta).
   Sustituir de golpe por los datos reales del cliente antes de publicar:
   nombre, dirección, teléfono, email, horario, equipo, testimonios, FAQ, URL.
   Cada campo de texto es { es, en }.
   ========================================================================== */

export const clinic = {
  demo: true,
  name: 'Marjal',
  legalName: { es: 'Marjal Clínica Estética (DEMO)', en: 'Marjal Aesthetic Clinic (DEMO)' },
  tagline: { es: 'Clínica de medicina estética en València', en: 'Aesthetic medicine clinic in Valencia' },
  url: 'https://marjal-clinica.example', // DEMO: dominio de ejemplo
  phone: '+34 963 12 45 78',
  phoneHref: '+34963124578',
  email: 'hola@marjal-clinica.example',
  address: {
    street: 'Carrer de Cirilo Amorós, 54, 1.º 2.ª',
    postalCode: '46004',
    city: 'València',
    region: 'València',
    country: 'ES',
    geo: { lat: 39.4663, lng: -0.3704 },
  },
  hours: [
    { days: { es: 'Lunes a viernes', en: 'Monday to Friday' }, time: '09:30 – 20:00', schema: { d: ['Mo', 'Tu', 'We', 'Th', 'Fr'], o: '09:30', c: '20:00' } },
    { days: { es: 'Sábado', en: 'Saturday' }, time: '10:00 – 14:00', schema: { d: ['Sa'], o: '10:00', c: '14:00' } },
    { days: { es: 'Domingo', en: 'Sunday' }, time: { es: 'Cerrado', en: 'Closed' }, schema: null },
  ],
  social: [], // DEMO: sin redes
};

/* 7 tratamientos para la lista numerada 01-07.
   Sin precios exactos ni promesas de resultados: "desde" / "valoración en consulta". */
export const treatments = [
  {
    id: 'limpieza',
    name: { es: 'Limpieza facial profunda', en: 'Deep facial cleansing' },
    desc: {
      es: 'Protocolo de varios pasos: higiene, extracción manual, vaporización suave y mascarilla según el estado de tu piel ese día. Es el punto de partida habitual antes de otros tratamientos.',
      en: 'A multi-step routine: cleansing, manual extraction, gentle steam and a mask chosen for how your skin is that day. It is the usual starting point before other treatments.',
    },
    duration: { es: '60 min aprox.', en: 'approx. 60 min' },
    ideal: { es: 'Piel con poros dilatados, textura irregular o que no tolera bien el maquillaje.', en: 'Skin with enlarged pores, uneven texture or that struggles with makeup.' },
    from: { es: 'Desde 65 €', en: 'From €65' },
  },
  {
    id: 'peeling',
    name: { es: 'Peeling', en: 'Chemical peel' },
    desc: {
      es: 'Aplicación controlada de ácidos en distintas concentraciones para renovar la capa superficial de la piel. El tipo y la intensidad se eligen en la valoración, nunca de forma estándar.',
      en: 'Controlled application of acids at different strengths to renew the skin surface. Type and intensity are chosen at the assessment, never as a one-size-fits-all.',
    },
    duration: { es: '45 min aprox.', en: 'approx. 45 min' },
    ideal: { es: 'Manchas leves, tono apagado o marcas de acné antiguas, siempre tras valoración.', en: 'Mild marks, dull tone or old acne marks, always after an assessment.' },
    from: { es: 'Desde 80 €', en: 'From €80' },
  },
  {
    id: 'bioestimulacion',
    name: { es: 'Bioestimulación', en: 'Biostimulation' },
    desc: {
      es: 'Microinyecciones de sustancias bioestimulantes que invitan a la piel a trabajar con sus propios recursos. Requiere valoración médica y un calendario de sesiones que se define contigo.',
      en: 'Micro-injections of biostimulating substances that encourage the skin to work with its own resources. Requires a medical assessment and a session calendar defined together.',
    },
    duration: { es: '40 min aprox.', en: 'approx. 40 min' },
    ideal: { es: 'Piel con pérdida de firmeza o luminosidad que busca un enfoque gradual.', en: 'Skin that has lost firmness or luminosity and looks for a gradual approach.' },
    from: { es: 'Valoración en consulta', en: 'Assessment at the clinic' },
  },
  {
    id: 'hialuronico',
    name: { es: 'Ácido hialurónico', en: 'Hyaluronic acid' },
    desc: {
      es: 'Infiltración médica de ácido hialurónico para hidratar o aportar volumen en zonas concretas. La doctora explica opciones, límites y cuidados posteriores antes de decidir nada.',
      en: 'Medical infiltration of hyaluronic acid to hydrate or add volume to specific areas. The doctor explains options, limits and aftercare before anything is decided.',
    },
    duration: { es: '30–45 min', en: '30–45 min' },
    ideal: { es: 'Personas que quieren afinar un detalle concreto sin cambiar su expresión.', en: 'People who want to refine one specific detail without changing their expression.' },
    from: { es: 'Valoración en consulta', en: 'Assessment at the clinic' },
  },
  {
    id: 'toxina',
    name: { es: 'Toxina botulínica', en: 'Botulinum toxin' },
    desc: {
      es: 'Tratamiento médico de uso muy extendido en medicina estética. La indicación, la dosis y las zonas las decide la doctora tras explorarte; no se aplica sin consulta previa.',
      en: 'A medical treatment widely used in aesthetic medicine. Indication, dose and areas are decided by the doctor after examining you; it is never applied without a prior consultation.',
    },
    duration: { es: '20–30 min', en: '20–30 min' },
    ideal: { es: 'Líneas de expresión marcadas en frente, entrecejo o contorno de ojos.', en: 'Pronounced expression lines on the forehead, between the brows or around the eyes.' },
    from: { es: 'Valoración en consulta', en: 'Assessment at the clinic' },
  },
  {
    id: 'laser',
    name: { es: 'Láser', en: 'Laser' },
    desc: {
      es: 'Tecnología láser para trabajar manchas, vello o textura según el equipo y los parámetros adecuados a tu fototipo. Se realiza un test previo y se evita en piel recién bronceada.',
      en: 'Laser technology for marks, hair or texture, with settings suited to your skin phototype. A patch test comes first, and it is avoided on freshly tanned skin.',
    },
    duration: { es: '20–50 min según zona', en: '20–50 min depending on area' },
    ideal: { es: 'Quien busca una solución progresiva y puede evitar el sol en las semanas posteriores.', en: 'Those who want a progressive approach and can avoid the sun in the following weeks.' },
    from: { es: 'Desde 59 € por sesión', en: 'From €59 per session' },
  },
  {
    id: 'mesoterapia',
    name: { es: 'Mesoterapia', en: 'Mesotherapy' },
    desc: {
      es: 'Aplicación de microdosis de activos (vitaminas, ácido hialurónico no reticulado, aminoácidos) en la capa superficial de la piel. El cóctel se compone en consulta según tu piel.',
      en: 'Micro-doses of actives (vitamins, non-crosslinked hyaluronic acid, amino acids) applied to the upper skin layer. The blend is composed at the clinic according to your skin.',
    },
    duration: { es: '30 min aprox.', en: 'approx. 30 min' },
    ideal: { es: 'Piel deshidratada o cansada, por ejemplo tras el verano o épocas de mucho estrés.', en: 'Dehydrated or tired skin, for example after summer or stressful periods.' },
    from: { es: 'Desde 90 €', en: 'From €90' },
  },
];

/* Proceso (animación de firma): 4 pasos. `lines` = líneas enmascaradas que se revelan una a una. */
export const process = [
  {
    id: 'valoracion',
    title: { es: 'Valoración', en: 'Assessment' },
    kicker: { es: '40 minutos, sin prisa', en: '40 minutes, unhurried' },
    lines: {
      es: ['Hablamos de lo que te preocupa y de lo que no quieres cambiar.', 'La doctora explora tu piel y revisa tu historial y alergias.', 'Si algo no está indicado, te lo decimos en esa misma consulta.'],
      en: ['We talk about what bothers you and what you do not want to change.', 'The doctor examines your skin and reviews your history and allergies.', 'If something is not indicated, we tell you in that same visit.'],
    },
  },
  {
    id: 'plan',
    title: { es: 'Plan por escrito', en: 'Written plan' },
    kicker: { es: 'Lo que se hace y por qué', en: 'What is done and why' },
    lines: {
      es: ['Recibes un plan con los tratamientos, el orden y el número orientativo de sesiones.', 'Incluye el coste desglosado y el consentimiento informado para leer con calma.', 'Puedes llevártelo a casa; no hay que decidir en la consulta.'],
      en: ['You receive a plan with the treatments, their order and an indicative number of sessions.', 'It includes the itemised cost and the informed consent to read at your own pace.', 'You can take it home; nothing has to be decided on the spot.'],
    },
  },
  {
    id: 'sesion',
    title: { es: 'Sesión', en: 'Session' },
    kicker: { es: 'Cabina privada, un profesional', en: 'Private room, one professional' },
    lines: {
      es: ['Cada sesión empieza repasando cómo ha ido desde la última vez.', 'Trabajamos en cabina individual, con material de un solo uso.', 'Al terminar te llevas por escrito los cuidados para los días siguientes.'],
      en: ['Each session starts by reviewing how things have gone since the last one.', 'We work in a private room, with single-use material.', 'You leave with written aftercare instructions for the following days.'],
    },
  },
  {
    id: 'seguimiento',
    title: { es: 'Seguimiento', en: 'Follow-up' },
    kicker: { es: 'Revisión a las 2 semanas', en: 'Check-in after 2 weeks' },
    lines: {
      es: ['Dos semanas después te escribimos para saber cómo está la piel.', 'Si hace falta, ajustamos el plan o programamos una revisión presencial.', 'Tienes un teléfono directo para dudas entre sesiones.'],
      en: ['Two weeks later we get in touch to see how your skin is doing.', 'If needed, we adjust the plan or schedule an in-person check-up.', 'You have a direct phone line for questions between sessions.'],
    },
  },
];

export const team = [
  {
    name: 'Dra. Irene Soler Ribera',
    role: { es: 'Directora médica · Medicina estética', en: 'Medical director · Aesthetic medicine' },
    bio: {
      es: 'Médica con formación en medicina estética. Lleva las valoraciones y todos los tratamientos inyectables. Colegiada n.º 000000 (DEMO).',
      en: 'Physician trained in aesthetic medicine. Leads the assessments and all injectable treatments. Licence no. 000000 (DEMO).',
    },
    initials: 'IS',
  },
  {
    name: 'Marc Olmos Vidal',
    role: { es: 'Enfermero · Bioestimulación y mesoterapia', en: 'Nurse · Biostimulation and mesotherapy' },
    bio: {
      es: 'Enfermero con experiencia en técnicas de microinyección. Se encarga de las sesiones de seguimiento y los controles posteriores.',
      en: 'Nurse experienced in micro-injection techniques. Runs the follow-up sessions and post-treatment checks.',
    },
    initials: 'MO',
  },
  {
    name: 'Lucía Beneyto Chover',
    role: { es: 'Técnica en estética avanzada · Facial y láser', en: 'Advanced aesthetics technician · Facial and laser' },
    bio: {
      es: 'Especialista en protocolos faciales y tecnología láser. Hace las limpiezas, los peelings superficiales y las sesiones de láser.',
      en: 'Specialist in facial protocols and laser technology. Performs cleansings, superficial peels and laser sessions.',
    },
    initials: 'LB',
  },
];

export const facilities = [
  {
    img: '/img/room.webp', w: 1200, h: 800,
    title: { es: 'Cabinas individuales', en: 'Private treatment rooms' },
    text: { es: 'Tres cabinas con luz natural regulable y camilla con calefacción. Nadie más entra mientras trabajamos.', en: 'Three rooms with adjustable natural light and a heated bed. Nobody else comes in while we work.' },
    alt: { es: 'Habitación luminosa con una cama blanca, ventanales y un banco de madera al pie', en: 'Bright room with a white bed, tall windows and a wooden bench at its foot' },
  },
  {
    img: '/img/care.webp', w: 900, h: 600,
    title: { es: 'Zona de cuidado', en: 'Aftercare corner' },
    text: { es: 'Un rincón tranquilo para sentarte unos minutos después de la sesión antes de volver a la calle.', en: 'A quiet corner to sit for a few minutes after the session before heading back outside.' },
    alt: { es: 'Dispensador blanco, toalla gris doblada y una vela sobre una mesa blanca', en: 'White dispenser, a folded grey towel and a candle on a white table' },
  },
  {
    img: '/img/hands.webp', w: 900, h: 600,
    title: { es: 'Producto trazable', en: 'Traceable product' },
    text: { es: 'Cada lote queda registrado en tu ficha. Material de un solo uso y esterilización documentada.', en: 'Each batch is recorded on your file. Single-use material and documented sterilisation.' },
    alt: { es: 'Manos dejando caer gotas de aceite desde un frasco ámbar', en: 'Hands letting drops of oil fall from an amber bottle' },
  },
];

export const testimonials = [
  {
    quote: { es: 'Fui a preguntar por un tratamiento y salí con la recomendación de empezar por algo mucho más sencillo. Eso me dio confianza.', en: 'I went in to ask about one treatment and left with a recommendation to start with something much simpler. That gave me confidence.' },
    who: 'Carmen V. (DEMO)',
    ctx: { es: 'Limpieza facial y peeling', en: 'Facial cleansing and peel' },
  },
  {
    quote: { es: 'Me explicaron riesgos y cuidados por escrito, sin prisa. Me llamaron a las dos semanas para ver cómo iba todo.', en: 'They explained risks and aftercare in writing, without rushing. They called me after two weeks to see how things were.' },
    who: 'Pablo R. (DEMO)',
    ctx: { es: 'Valoración y seguimiento', en: 'Assessment and follow-up' },
  },
  {
    quote: { es: 'La cabina es tranquila y siempre me atiende la misma persona. Se agradece no sentirse en una cadena de montaje.', en: 'The room is calm and the same person always looks after me. It is a relief not to feel like an assembly line.' },
    who: 'Nuria S. (DEMO)',
    ctx: { es: 'Mesoterapia', en: 'Mesotherapy' },
  },
];

export const faqs = [
  {
    q: { es: '¿La primera visita me compromete a algo?', en: 'Does the first visit commit me to anything?' },
    a: { es: 'No. La valoración sirve para explorar tu piel y explicarte opciones. Sales con un plan por escrito y decides con calma, en casa.', en: 'No. The assessment is for examining your skin and explaining options. You leave with a written plan and decide calmly at home.' },
  },
  {
    q: { es: '¿Cuánto cuestan los tratamientos?', en: 'How much do treatments cost?' },
    a: { es: 'Los precios dependen de la zona, el producto y el número de sesiones, por eso solo indicamos cifras "desde" en algunos casos. El importe exacto te lo damos por escrito tras la valoración.', en: 'Prices depend on the area, product and number of sessions, so we only show "from" figures in some cases. The exact amount is given in writing after the assessment.' },
  },
  {
    q: { es: '¿Los tratamientos con inyectables duelen?', en: 'Do injectable treatments hurt?' },
    a: { es: 'La sensibilidad varía de una persona a otra y según la zona. Usamos agujas finas y, cuando está indicado, anestesia tópica. Puedes pedir una pausa en cualquier momento.', en: 'Sensitivity varies from person to person and by area. We use fine needles and, when indicated, topical anaesthetic. You can ask for a pause at any moment.' },
  },
  {
    q: { es: '¿Cuándo se ven los resultados?', en: 'When will I see results?' },
    a: { es: 'Depende del tratamiento y de cada piel, y no podemos garantizar un resultado concreto. En la valoración te damos plazos orientativos y qué cabe esperar de forma realista.', en: 'It depends on the treatment and each skin, and we cannot guarantee a specific result. At the assessment we give you indicative timelines and what to realistically expect.' },
  },
  {
    q: { es: '¿Hay alguna razón por la que no me puedan tratar?', en: 'Is there any reason I could not be treated?' },
    a: { es: 'Sí: embarazo y lactancia, ciertas enfermedades autoinmunes, infecciones activas en la zona, tratamientos con isotretinoína reciente o alergias a componentes. Lo revisamos siempre antes de empezar.', en: 'Yes: pregnancy and breastfeeding, certain autoimmune conditions, active infections in the area, recent isotretinoin treatment or allergies to components. We always review this before starting.' },
  },
  {
    q: { es: '¿Puedo hacerme un láser en verano?', en: 'Can I have laser treatment in summer?' },
    a: { es: 'En general se evita con la piel bronceada, porque aumenta el riesgo de irritación o manchas. Muchas personas empiezan en otoño. Te orientamos según tu fototipo y tu exposición solar.', en: 'It is generally avoided on tanned skin because it increases the risk of irritation or marks. Many people start in autumn. We advise according to your phototype and sun exposure.' },
  },
  {
    q: { es: '¿Qué pasa si tengo una molestia después de la sesión?', en: 'What if I have a problem after the session?' },
    a: { es: 'Llámanos al teléfono de la clínica. Si no es horario de consulta, deja un mensaje y te devolvemos la llamada. Ante una reacción intensa, acude a urgencias y avísanos después.', en: 'Call the clinic phone. Outside opening hours, leave a message and we call you back. For a strong reaction, go to emergency services and let us know afterwards.' },
  },
  {
    q: { es: '¿Puedo cancelar o cambiar una cita?', en: 'Can I cancel or change an appointment?' },
    a: { es: 'Sí, hasta 24 horas antes sin ningún coste. Pasado ese plazo puede aplicarse un cargo parcial en tratamientos de cabina larga; te lo indicamos al reservar.', en: 'Yes, up to 24 hours before at no cost. After that a partial fee may apply to long-room treatments; we tell you when booking.' },
  },
];
