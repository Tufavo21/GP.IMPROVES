// Datos reales del negocio facilitados por el cliente. Lo que no consta se marca [FALTA: dato] y no se inventa.
// El email de destino de las solicitudes NO está aquí: vive en la variable de entorno CONTACT_TO_EMAIL (servidor).

export const SHOW_PLACEHOLDERS = true; // muestra en la web los [FALTA] pendientes (beta). Poner a false al publicar.

export const BUSINESS = {
  name: '2con2estudio',
  founders: ['Bea Pérez', 'Gonzalo Pau'],
  slogan: {
    es: 'DISEÑO DE INTERIORES · EJECUCIÓN DE OBRA',
    // [FALTA: traducción al inglés que apruebe el cliente] Provisional.
    en: 'INTERIOR DESIGN · BUILD EXECUTION',
  },
  city: 'Valencia',
  country: 'ES',
  phone: { display: '685 35 41 53', intl: '+34 685 35 41 53', tel: '+34685354153' },
  email: 'pableteizquierdoperez@gmail.com', // email público de contacto facilitado por el cliente
  instagram: { handle: '@2con2estudio', url: 'https://www.instagram.com/2con2estudio/' },
  siteUrl: import.meta.env?.VITE_SITE_URL || 'https://2con2estudio.example', // [FALTA: dominio definitivo]
  falta: {
    address: '[FALTA: dirección postal]',
    hours: '[FALTA: horario]',
    experience: '[FALTA: años de experiencia]',
    team: '[FALTA: roles, bio y foto de Bea y Gonzalo]',
    projects: '[FALTA: nombre, ubicación y año de cada proyecto]',
    services: '[FALTA: confirmar lista de servicios con el cliente]',
    process: '[FALTA: confirmar proceso con el cliente]',
    privacy: '[FALTA: NIF y dirección del responsable del tratamiento]',
    originals: '[FALTA: original en alta]',
  },
};

// Fotos aportadas por el cliente. `own: false` = el cliente aún debe confirmar que es proyecto propio.
export const PROJECTS = [
  { id: 'cocina-marmol-negra', own: true,
    alt: { es: 'Cocina negra con isla y encimera de piedra veteada y tres lámparas colgantes', en: 'Black kitchen with a veined stone island and worktop under three pendant lamps' },
    cap: { es: 'Cocina negra con isla veteada', en: 'Black kitchen with veined island' } },
  { id: 'bano-gres-piedra', own: true,
    alt: { es: 'Baño con gres gris piedra, nicho iluminado y bañera exenta blanca', en: 'Bathroom with stone-grey tiles, a lit niche and a white freestanding bathtub' },
    cap: { es: 'Baño con gres gris piedra y nicho con luz', en: 'Bathroom with stone-grey tiles and lit niche' } },
  { id: 'cocina-obra-molduras', own: true,
    alt: { es: 'Cocina con mobiliario gris y frentes oscuros en obra, en un edificio clásico con molduras en el techo', en: 'Kitchen with grey base units and dark tall units during works, in a classic building with ceiling mouldings' },
    cap: { es: 'Cocina en obra, edificio clásico con molduras', en: 'Kitchen during works, classic building with mouldings' } },
  { id: 'cocina-roble-grafito', own: false,
    alt: { es: 'Cocina con frentes de roble, isla grafito y electrodomésticos integrados', en: 'Kitchen with oak fronts, a graphite island and integrated appliances' },
    cap: { es: 'Cocina con roble y grafito', en: 'Kitchen in oak and graphite' } },
  { id: 'cocina-blanca-compacta', own: false,
    alt: { es: 'Cocina blanca en L con estantería abierta de roble y luz bajo el mueble alto', en: 'White L-shaped kitchen with an open oak shelf and light under the wall unit' },
    cap: { es: 'Cocina blanca compacta con estantería de roble', en: 'Compact white kitchen with oak shelf' } },
];
