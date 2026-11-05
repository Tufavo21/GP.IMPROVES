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

// [DEMO-IMG] Fotos de demostración (Unsplash, licencia Unsplash; autoría en public/img-demo/CREDITS.md).
// NO son obras de 2con2estudio: la web las rotula «Proyecto de demostración». Las fotos reales del
// cliente siguen en public/img-cliente/ para cuando se entreguen los originales.
export const DEMO_PHOTOS = {
  'casa-salon': { es: 'Salón luminoso con suelo de roble, butaca blanca, mesas de cristal y lámpara de tela, abierto al comedor', en: 'Bright living room with an oak floor, a white armchair, glass tables and a fabric pendant, open to the dining area' },
  'casa-cocina': { es: 'Cocina con frentes de roble, isla de mármol blanco veteado en negro y suelo de roble en espiga', en: 'Kitchen with oak fronts, a white marble island with black veining and a herringbone oak floor' },
  'casa-dormitorio': { es: 'Dormitorio amplio con suelo de roble, cama baja con banco a los pies, ventanal y baño en suite al fondo', en: 'Spacious bedroom with an oak floor, a low bed with a bench at its foot, a large window and an en-suite beyond' },
  'casa-bano': { es: 'Baño con mueble de roble, encimera de mármol, bañera exenta y ducha de obra con mampara', en: 'Bathroom with an oak vanity, a marble worktop, a freestanding tub and a walk-in shower' },
  'bano-plano': { es: 'Baño con encimera de piedra continua, mueble de roble, espejo en arco y grifería negra', en: 'Bathroom with a continuous stone worktop, an oak vanity, an arched mirror and black taps' },
  'proj-bano': { es: 'Baño con piedra de gran formato, mueble de madera suspendido, lavabo negro y espejo redondo', en: 'Bathroom with large-format stone, a floating timber vanity, a black basin and a round mirror' },
  'proj-piso': { es: 'Piso reformado y abierto: cocina de roble con columnas, salón con sofá blanco y suelo de madera clara', en: 'Renovated open-plan flat: an oak kitchen with tall units, a living area with a white sofa and a light timber floor' },
  'proj-obra-antes': { es: 'El mismo piso antes de la reforma', en: 'The same flat before the renovation' },
  'proj-obra-despues': { es: 'El mismo piso después de la reforma', en: 'The same flat after the renovation' },
  'proj-obra': { es: 'Piso antiguo en obra: suelo en bruto, herramientas y balconeras con carpintería original', en: 'Old flat under construction: bare floor, tools and balcony doors with original joinery' },
  'proj-cocina-roble': { es: 'Cocina lineal de roble con columnas, hornos integrados y frente de mármol negro retroiluminado', en: 'Linear oak kitchen with tall units, built-in ovens and a backlit black marble splashback' },
  'proj-cocina-compacta': { es: 'Cocina en nogal oscuro y negro con columnas hasta el techo, frente de mármol y suelo de mármol blanco veteado', en: 'Dark walnut and black kitchen with floor-to-ceiling units, a marble splashback and a white veined marble floor' },
  'proc-visita': { es: 'Estancia vacía en obra con paredes de hormigón y ventanal a un andamio', en: 'Empty room on site with concrete walls and a window onto scaffolding' },
  'proc-proyecto': { es: 'Planos de arquitectura sobre la mesa con rotuladores, lápices y cinta', en: 'Architectural drawings on a desk with markers, pencils and tape' },
  'proc-calendario': { es: 'Detalle de un plano acotado con lápiz y escalímetro', en: 'Detail of a dimensioned drawing with a pencil and a scale ruler' },
  'proc-obra': { es: 'Vivienda en demolición con puntales metálicos y escombro en el suelo', en: 'Home being stripped out, with steel props and rubble on the floor' },
  'proc-entrega': { es: 'Salón terminado con suelo de roble, comedor al fondo y luz natural', en: 'Finished living room with an oak floor, the dining area beyond and daylight' },
};

// [DEMO] nombre, m², año y tipo asociados a fotos de DEMOSTRACIÓN (no son obras del estudio).
export const PROJECTS = [
  { id: 'proj-bano', name: { es: 'Baño Campanar', en: 'Campanar bathroom' }, m2: 9, year: 2024,
    type: { es: 'Baño', en: 'Bathroom' },
    note: { es: 'Piedra de gran formato, mueble de madera suspendido y grifería negra.', en: 'Large-format stone, a floating timber vanity and black taps.' } },
  // `phases`: cuando existan las imágenes de IA de antes y después (mismo encuadre que proj-obra), el
  // proyecto se muestra como antes / durante / después; mientras tanto, la foto del piso reformado.
  { id: 'proj-piso', phases: 'proj-obra', name: { es: 'Piso Eixample', en: 'Eixample flat' }, m2: 118, year: 2025,
    type: { es: 'Reforma integral', en: 'Full renovation' },
    note: { es: 'Se tiran tabiques para abrir la cocina al salón y se conservan las balconeras originales.', en: 'Walls come down to open the kitchen to the living room, keeping the original balcony doors.' } },
  { id: 'proj-cocina-roble', name: { es: 'Cocina Ruzafa', en: 'Ruzafa kitchen' }, m2: 32, year: 2024,
    type: { es: 'Cocina', en: 'Kitchen' },
    note: { es: 'Roble en columnas e isla, con un frente de mármol negro iluminado.', en: 'Oak tall units and island, with a lit black marble splashback.' } },
  { id: 'proj-cocina-compacta', name: { es: 'Cocina Benimaclet', en: 'Benimaclet kitchen' }, m2: 14, year: 2023,
    type: { es: 'Cocina', en: 'Kitchen' },
    note: { es: 'Nogal oscuro y negro hasta el techo, con el mármol como único contraste.', en: 'Dark walnut and black up to the ceiling, with marble as the only contrast.' } },
];

// [DEMO] Escena de la casa (M17): una vivienda recorrida estancia por estancia. Textos inventados.
export const HOUSE = [
  { id: 'casa-salon', es: ['Salón', 'Roble natural en espiga de gran lama y paredes a la cal: la luz rebota sin brillos.'],
    en: ['Living room', 'Wide-plank natural oak and lime-washed walls: light bounces without glare.'] },
  { id: 'casa-cocina', es: ['Cocina', 'Frentes de roble sin tirador e isla de mármol veteado a inglete.'],
    en: ['Kitchen', 'Handleless oak fronts and a mitred veined-marble island.'] },
  { id: 'casa-dormitorio', es: ['Dormitorio', 'Suite con baño propio, roble en el suelo y luz de ventanal; nada que distraiga del descanso.'],
    en: ['Bedroom', 'A suite with its own bathroom, oak underfoot and window light; nothing to distract from rest.'] },
  { id: 'casa-bano', es: ['Baño', 'Gres porcelánico continuo, mueble de roble y ducha de obra enrasada.'],
    en: ['Bathroom', 'Continuous porcelain tiles, an oak vanity and a flush walk-in shower.'] },
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

// [DEMO] proceso de trabajo (M17). [DEMO-IMG] `img` apunta a fotos de demostración.
export const PROCESS = [
  { img: 'proc-visita', es: ['Visita', 'Vamos a la vivienda, medimos y escuchamos cómo vivís en ella.'],
    en: ['Visit', 'We visit the home, measure it and listen to how you live in it.'] },
  { img: 'proc-proyecto', es: ['Proyecto', 'Planos, materiales y presupuesto partida a partida, sin letra pequeña.'],
    en: ['Design', 'Drawings, materials and a line-by-line budget, with no small print.'] },
  { img: 'proc-calendario', es: ['Calendario', 'Fecha de inicio, fases y fecha de entrega por escrito antes de empezar.'],
    en: ['Schedule', 'Start date, phases and handover date in writing before we begin.'] },
  { img: 'proc-obra', es: ['Obra', 'El mismo equipo que diseña dirige la obra. Te contamos el avance cada semana.'],
    en: ['Build', 'The team that designs it runs the build. We report progress every week.'] },
  { img: 'proc-entrega', es: ['Entrega', 'Repasamos contigo cada detalle y te dejamos la documentación de la vivienda.'],
    en: ['Handover', 'We go over every detail with you and hand over the home’s documentation.'] },
];

// [DEMO] testimonios FICTICIOS (nombres inventados, nunca clientes reales). `rating` sobre 5, también
// inventado: se muestra junto al nombre y NUNCA va al JSON-LD (nada de AggregateRating).
export const TESTIMONIALS = [
  { name: 'Lucía M.', place: 'Ruzafa', rating: 5, es: 'Nos dieron fecha de entrega el primer día y la cumplieron. La cocina es exactamente la del plano.',
    en: 'They gave us a handover date on day one and kept it. The kitchen is exactly the one in the drawings.' },
  { name: 'Javier y Marta', place: 'Benimaclet', rating: 4.5, es: 'Lo que más valoramos fue tener a una sola persona a la que llamar durante toda la obra.',
    en: 'What we valued most was having one person to call for the whole build.' },
  { name: 'Andrés R.', place: 'Campanar', rating: 4.5, es: 'Nos ayudaron a decidir qué no tocar. El baño se ve más grande sin haber movido un tabique.',
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
