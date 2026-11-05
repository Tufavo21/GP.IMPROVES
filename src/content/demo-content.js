// ════════════════════════════════════════════════════════════════════════════════
// [DEMO] CONTENIDO DE DEMOSTRACIÓN — web de práctica.
// TODO lo que hay en este archivo es inventado: no son datos del cliente.
// Nunca se usa en el <head> ni en el JSON-LD. El pie de página avisa: «Contenido de demostración».
// Con DEMO_ENABLED = false desaparecen las secciones que solo existen con datos inventados
// (testimonios, contadores, FAQ) y los pies de proyecto pierden nombre, m² y año.
// ════════════════════════════════════════════════════════════════════════════════

export const DEMO_ENABLED = true;

// [DEMO: pendiente de aprobar] traducción provisional del eslogan real
export const SLOGAN_EN = 'INTERIOR DESIGN · BUILD & EXECUTION';

// [DEMO] roles del equipo (los nombres sí son reales)
export const TEAM_ROLES = {
  'Bea Pérez': { es: 'Interiorismo y proyecto', en: 'Interior design and planning' },
  'Gonzalo Pau': { es: 'Ejecución y dirección de obra', en: 'Construction and site management' },
};

// [DEMO] cifras del estudio (M22)
export const STATS = [
  { value: 12, label: { es: 'años reformando viviendas', en: 'years renovating homes' } },
  { value: 140, label: { es: 'viviendas entregadas', en: 'homes delivered' } },
  { value: 9800, label: { es: 'm² reformados', en: 'm² renovated' } },
];

// [DEMO] nombre, m², año y tipo asociados a las fotos reales del cliente.
// La cocina roble/grafito puede ser de exposición: se presenta como referencia, nunca como obra entregada.
export const PROJECTS = [
  { id: 'bano-gres-piedra', name: { es: 'Baño Campanar', en: 'Campanar bathroom' }, m2: 9, year: 2024,
    type: { es: 'Baño', en: 'Bathroom' },
    note: { es: 'Gres de gran formato, hornacina con luz y bañera exenta.', en: 'Large-format tiles, a lit niche and a freestanding tub.' } },
  { id: 'cocina-obra-molduras', name: { es: 'Piso Eixample', en: 'Eixample flat' }, m2: 118, year: 2025,
    type: { es: 'Reforma integral · en obra', en: 'Full renovation · in progress' },
    note: { es: 'Cocina abierta bajo las molduras originales, que se conservan.', en: 'An open kitchen beneath the original mouldings, which are kept.' } },
  { id: 'cocina-marmol-negra', name: { es: 'Cocina Ruzafa', en: 'Ruzafa kitchen' }, m2: 32, year: 2024,
    type: { es: 'Cocina', en: 'Kitchen' },
    note: { es: 'Isla de piedra veteada a inglete y frentes negros sin tirador.', en: 'A mitred veined-stone island and handleless black fronts.' } },
  { id: 'cocina-blanca-compacta', name: { es: 'Cocina Benimaclet', en: 'Benimaclet kitchen' }, m2: 11, year: 2023,
    type: { es: 'Cocina', en: 'Kitchen' },
    note: { es: 'Once metros bien resueltos: almacenaje alto y roble a la vista.', en: 'Eleven square metres well resolved: tall storage and exposed oak.' } },
  { id: 'cocina-roble-grafito', reference: true, name: { es: 'Roble y grafito', en: 'Oak and graphite' }, m2: null, year: null,
    type: { es: 'Referencia de acabados', en: 'Finish reference' },
    note: { es: 'Combinación de materiales que proponemos a menudo. Imagen de referencia, no es una obra entregada.', en: 'A material pairing we often propose. Reference image, not a delivered project.' } },
];

// [DEMO] desglose de «todo tipo de reformas» (frase real del cliente)
export const SERVICES = [
  { es: ['Reforma integral', 'De la distribución a la última manilla: un solo proyecto, una sola obra y un único interlocutor.'],
    en: ['Full renovation', 'From the floor plan to the last handle: one project, one build and a single point of contact.'] },
  { es: ['Cocinas', 'Distribución, mobiliario a medida, encimeras, iluminación e instalaciones.'],
    en: ['Kitchens', 'Layout, bespoke units, worktops, lighting and services.'] },
  { es: ['Baños', 'Platos de obra, gran formato, hornacinas y fontanería empotrada.'],
    en: ['Bathrooms', 'Built-in shower trays, large-format tiles, niches and concealed plumbing.'] },
  { es: ['Interiorismo y proyecto', 'Planos, materiales, iluminación y mobiliario antes de mover un solo tabique.'],
    en: ['Interior design and planning', 'Drawings, materials, lighting and furniture before a single wall moves.'] },
  { es: ['Carpintería a medida', 'Armarios, puertas, revestimientos y piezas de madera hechas para cada vivienda.'],
    en: ['Bespoke joinery', 'Wardrobes, doors, panelling and timber pieces made for each home.'] },
  { es: ['Instalaciones', 'Electricidad, fontanería, climatización y domótica, legalizadas y documentadas.'],
    en: ['Building services', 'Electrics, plumbing, climate control and home automation, certified and documented.'] },
];

// [DEMO] proceso de trabajo (M17). `img` apunta a fotos reales o a su dibujo derivado.
export const PROCESS = [
  { img: 'cocina-obra-molduras-plano', es: ['Visita', 'Vamos a la vivienda, medimos y escuchamos cómo vivís en ella.'],
    en: ['Visit', 'We visit the home, measure it and listen to how you live in it.'] },
  { img: 'cocina-marmol-negra-plano', es: ['Proyecto', 'Planos, materiales y presupuesto partida a partida, sin letra pequeña.'],
    en: ['Design', 'Drawings, materials and a line-by-line budget, with no small print.'] },
  { img: 'bano-gres-piedra-plano', es: ['Calendario', 'Fecha de inicio, fases y fecha de entrega por escrito antes de empezar.'],
    en: ['Schedule', 'Start date, phases and handover date in writing before we begin.'] },
  { img: 'cocina-obra-molduras', es: ['Obra', 'El mismo equipo que diseña dirige la obra. Te contamos el avance cada semana.'],
    en: ['Build', 'The team that designs it runs the build. We report progress every week.'] },
  { img: 'cocina-blanca-compacta', es: ['Entrega', 'Repasamos contigo cada detalle y te dejamos la documentación de la vivienda.'],
    en: ['Handover', 'We go over every detail with you and hand over the home’s documentation.'] },
];

// [DEMO] testimonios FICTICIOS (nombres inventados, nunca clientes reales).
export const TESTIMONIALS = [
  { name: 'Lucía M.', place: 'Ruzafa', es: 'Nos dieron fecha de entrega el primer día y la cumplieron. La cocina es exactamente la del plano.',
    en: 'They gave us a handover date on day one and kept it. The kitchen is exactly the one in the drawings.' },
  { name: 'Javier y Marta', place: 'Benimaclet', es: 'Lo que más valoramos fue tener a una sola persona a la que llamar durante toda la obra.',
    en: 'What we valued most was having one person to call for the whole build.' },
  { name: 'Andrés R.', place: 'Campanar', es: 'Nos ayudaron a decidir qué no tocar. El baño se ve más grande sin haber movido un tabique.',
    en: 'They helped us decide what not to touch. The bathroom looks bigger without moving a single wall.' },
];

// [DEMO] preguntas frecuentes
export const FAQ = [
  { es: ['¿Cómo se calcula el presupuesto?', 'Con la visita y las medidas preparamos un presupuesto por partidas. La valoración que te enviamos tras el formulario es orientativa y no vinculante.'],
    en: ['How is the quote calculated?', 'After the visit and measurements we prepare a line-by-line quote. The estimate we send after the form is approximate and non-binding.'] },
  { es: ['¿Cuánto dura una reforma integral?', 'Depende de la vivienda; una reforma integral de un piso suele llevar entre tres y cinco meses de obra.'],
    en: ['How long does a full renovation take?', 'It depends on the home; a full renovation of a flat usually takes three to five months on site.'] },
  { es: ['¿Os encargáis de las licencias?', 'Sí. Tramitamos la licencia o la declaración responsable que corresponda y los boletines de instalaciones.'],
    en: ['Do you handle permits?', 'Yes. We file the permit or notice the works require, plus the services certificates.'] },
  { es: ['¿Puedo seguir viviendo en casa durante la obra?', 'En reformas parciales, normalmente sí. En una integral lo desaconsejamos y lo planificamos contigo.'],
    en: ['Can I stay at home during the works?', 'For partial renovations, usually yes. For a full one we advise against it and plan it with you.'] },
  { es: ['¿Trabajáis fuera de la ciudad?', 'Trabajamos en Valencia y su área metropolitana. Para otras zonas, cuéntanos tu caso.'],
    en: ['Do you work outside the city?', 'We work in Valencia and its metropolitan area. For other areas, tell us about your project.'] },
];
