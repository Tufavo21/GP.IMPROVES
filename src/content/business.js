// DATOS REALES del cliente (usar tal cual). Lo que falta se marca [FALTA: dato] y no se inventa.
// Todo lo inventado para la web de práctica vive SOLO en ./demo-content.js.

export const SHOW_PLACEHOLDERS = true; // muestra en la web los marcadores [FALTA] pendientes

export const BUSINESS = {
  name: '2con2estudio',
  founders: ['Bea Pérez', 'Gonzalo Pau'],
  sector: { es: 'Remodelación de viviendas y reformas interiores', en: 'Home remodelling and interior renovation' },
  services: { es: 'Todo tipo de reformas', en: 'All kinds of renovations' },
  slogan: { es: 'DISEÑO DE INTERIORES · EJECUCIÓN DE OBRA' }, // EN: ver demo-content.js (pendiente de aprobar)
  city: 'Valencia', // sin estudio físico ni dirección postal (confirmado por el cliente, 2026-11-05)
  country: 'ES',
  phone: { display: '685 35 41 53', intl: '+34 685 35 41 53', href: 'tel:+34685354153' },
  email: 'pableteizquierdoperez@gmail.com', // email público y destino de las solicitudes
  instagram: { handle: '@2con2estudio', url: 'https://www.instagram.com/2con2estudio/' },
  // [FALTA: dominio definitivo] — se define con VITE_SITE_URL al construir
  siteUrl: (import.meta.env?.VITE_SITE_URL || 'https://2con2estudio.example').replace(/\/$/, ''),
};

export const FALTA = {
  logoVector: '[FALTA: versión vectorial del logo y confirmar si el marco es un cuadrado cerrado]',
  sloganEn: '[FALTA: traducción al inglés del eslogan aprobada por el cliente]',
  pricing: '[FALTA: baremo de precios]',
  photo: '[FALTA: foto]',
  privacy: '[FALTA: responsable del tratamiento y NIF para la política de privacidad]',
  domain: '[FALTA: dominio definitivo]',
  sendService: '[FALTA: servicio de envío de solicitudes]',
};

// Fotos aportadas por el cliente: alt descriptivo real (lo que se ve en la foto).
export const CLIENT_PHOTOS = {
  'cocina-marmol-negra': {
    es: 'Cocina negra con isla y encimera de piedra blanca veteada en gris, y tres lámparas colgantes',
    en: 'Black kitchen with a white, grey-veined stone island and worktop under three pendant lamps',
  },
  'bano-gres-piedra': {
    es: 'Baño con gres gris efecto piedra, hornacina iluminada y bañera exenta blanca',
    en: 'Bathroom with grey stone-effect tiles, a lit niche and a white freestanding bathtub',
  },
  'cocina-obra-molduras': {
    es: 'Cocina en obra con módulos grises y columnas oscuras en un edificio clásico con molduras en el techo',
    en: 'Kitchen under construction with grey units and dark tall units in a classic building with ceiling mouldings',
  },
  'cocina-roble-grafito': {
    es: 'Cocina con frentes de roble, isla grafito y hornos integrados en columna',
    en: 'Kitchen with oak fronts, a graphite island and ovens built into a tall unit',
  },
  'cocina-blanca-compacta': {
    es: 'Cocina blanca en L con estantes abiertos de roble y luz bajo el mueble alto',
    en: 'White L-shaped kitchen with open oak shelves and light under the wall unit',
  },
};
