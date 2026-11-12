// Datos públicos de Committee Club Valencia (recogidos en noviembre de 2026)
// y datos ilustrativos de la demo. Lo que es estimación lleva la marca `estimado`.

export const CLUB = {
  name: 'Committee Club Valencia',
  group: 'Grupo Salamandra',
  address: 'Carrer de Sant Vicent Màrtir, 200, 46007 València',
  nights: 'Jueves, viernes y sábado',
  season: 'De septiembre a mayo (cerrado en verano)',
  rooms: [
    { name: 'First Floor', music: 'Reguetón · Comercial' },
    { name: 'Petit', music: 'Hip-hop · R&B' },
  ],
  dress: 'Casual elegante · sin pantalón corto',
  entry: { from: 22, tiers: [22, 27, 32], includes: 'una consumición' },
  sisterVenues: ['Akuarela Playa', 'Convento', 'MYA', "L'Umbracle"],
  sources: [
    ['Grupo Salamandra (venta oficial)', 'https://smdgroup.club/es/club/committee/event/11690'],
    ['Valencia Nightlife: mesas VIP', 'https://www.valencia-nightlife.com/mesas-vip-committee-valencia/'],
    ['Spain Club Promoter: ficha', 'https://spainclubpromoter.com/en/committee-club-valencia/'],
    ['Spain Club Promoter: carta', 'https://spainclubpromoter.com/carta-committee-valencia/'],
    ['Discoruta', 'https://www.discoruta.com/discotecas/committe/'],
  ],
};

// Reglas de la mesa, tal y como las publican las fuentes
export const RULES = {
  baseGuests: 5,
  maxExtra: 2,
  extraSurcharge: 0.2, // +20 % del precio de la mesa por persona extra
  depositPct: 0.5, // señal del 50 %
  depositWindowHours: 2, // el enlace de pago caduca a las 2 h
  holdMinutes: 10, // bloqueo temporal de la mesa mientras se paga (propuesta)
  mixersPerSpirit: 5, // refrescos incluidos por botella de destilado (estimado)
  minAge: { thu: 18, fri: 21, sat: 21 },
};

// Zonas VIP. El plano es ilustrativo: no disponemos del plano real de la sala.
export const ZONES = [
  { id: 'tarima', name: 'Tarima', floor: 'first', desc: 'A ras de pista, con barra propia', color: '#e8334f' },
  { id: 'principal', name: 'Principal', floor: 'first', desc: 'Detrás de la cabina del DJ', color: '#f5b544' },
  { id: 'ghost', name: 'Ghost', floor: 'first', desc: 'Acceso privado y show de botellas', color: '#a78bfa' },
  { id: 'petit', name: 'Petit Comité', floor: 'upper', desc: 'Planta superior · hip-hop y R&B', color: '#38bdf8' },
];

// Precio de cada mesa: [viernes y sábado, jueves]. Es consumo mínimo, no entrada.
// Ghost: solo se conoce la mesa 1 (1.500 €) y el mínimo de la zona (500 €);
// el reparto intermedio es una estimación.
const PRICE = {
  tarima: () => [200, 150],
  principal: () => [400, 300],
  petit: () => [500, 500],
  ghost: (i) => [[1500, 1500], [1000, 1000], [800, 800], [600, 600], [500, 500]][i],
};

function buildTables() {
  const t = [];
  // First Floor — viewBox 1000 x 620
  for (let i = 0; i < 7; i++) {
    t.push({ id: `P${i + 1}`, zone: 'principal', floor: 'first', x: 130 + i * 123, y: 108, price: PRICE.principal(i) });
  }
  for (let i = 0; i < 7; i++) {
    t.push({ id: `T${i + 1}`, zone: 'tarima', floor: 'first', x: 140, y: 190 + i * 52, price: PRICE.tarima(i) });
    t.push({ id: `T${i + 8}`, zone: 'tarima', floor: 'first', x: 860, y: 190 + i * 52, price: PRICE.tarima(i) });
  }
  for (let i = 0; i < 5; i++) {
    t.push({ id: `G${i + 1}`, zone: 'ghost', floor: 'first', x: 300 + i * 100, y: 556, price: PRICE.ghost(i), estimado: i > 0 });
  }
  // Planta superior — viewBox 1000 x 420, cuadrícula 4 x 4
  for (let i = 0; i < 16; i++) {
    t.push({ id: `U${i + 1}`, zone: 'petit', floor: 'upper', x: 220 + (i % 4) * 187, y: 90 + Math.floor(i / 4) * 80, price: PRICE.petit(i) });
  }
  return t.sort((a, b) => zoneOrder(a.zone) - zoneOrder(b.zone) || a.id.localeCompare(b.id, 'es', { numeric: true }));
}
const zoneOrder = (z) => ['tarima', 'principal', 'petit', 'ghost'].indexOf(z);

export const TABLES = buildTables();

// Carta de botellas 2026/27 (la misma en Committee y Convento).
const RAW_MENU = {
  Ginebra: [['Beefeater', 200], ['Larios 12', 200], ['Larios Rosé', 200], ["Master's", 200], ["Master's Pink", 200], ["Seagram's", 200], ['Bombay Dry', 200], ['Tanqueray', 200], ['Bombay Sapphire', 250], ['Citadelle', 250], ["Hendrick's", 250], ['Puerto de Indias', 250], ['Puerto de Indias Melón', 250], ["Brockman's", 300], ['Bulldog', 300], ['G-Vine', 300], ['London N.º 1', 300], ["Martin Miller's", 300], ['Nordés', 300], ['Bombay Sapphire 1,5 L', 500], ['G-Vine 1,5 L', 550], ["Martin Miller's 1,75 L", 550]],
  Vodka: [['Absolut', 200], ['Icelandic', 200], ['Moskovskaya', 200], ['Stolichnaya', 200], ['Belvedere 70 cl', 250], ['Cîroc 70 cl', 250], ['Grey Goose 70 cl', 250], ['Stolichnaya Elit', 250], ['Cîroc Sabores', 300], ['Beluga', 350], ['Belvedere 1,75 L', 400], ['Grey Goose 1,75 L', 400], ['Belvedere 3 L', 800], ['Cîroc 3 L', 800], ['Grey Goose 3 L', 800], ['Belvedere 6 L', 1500], ['Cîroc 6 L', 1500], ['Grey Goose 6 L', 1500]],
  Ron: [['Bacardí Carta Negra', 200], ['Barceló', 200], ['Brugal', 200], ['Flor de Caña', 200], ['Lambreo 7 años', 200], ['Matusalem', 200], ['Santa Teresa', 200], ['Bacardí Blanco 1 L', 250], ['Barceló Imperial', 250], ['Brugal Extra Viejo', 250], ['Lambreo 12 años', 250], ['Havana 7', 300], ['Havana Maestro', 300], ['Santa Teresa 1749', 300], ['Zacapa', 300]],
  Whisky: [["Ballantine's", 200], ['Cutty Sark', 200], ['DYC', 200], ["Dewar's 8 años", 200], ['J&B', 200], ['J.W. Red Label', 200], ['Cardhu 12 años', 250], ['Chivas 12', 250], ["Dewar's 12 años", 250], ['Four Roses', 250], ["Jack Daniel's", 250], ['Jameson', 250], ['Macallan', 250], ['J.W. Black Label', 300], ['Chivas 18', 400], ['J.W. Gold Label', 400], ['Chivas 21', 700], ['J.W. Blue Label', 800]],
  Tequila: [['José Cuervo', 200], ['José Cuervo Fresa', 200], ['Tequila Rosa', 200], ['Patrón Silver', 350], ['Don Julio Silver', 400], ['Patrón Reposado', 400], ['Don Julio Reposado', 450], ['Diamante', 500], ['Patrón Añejo', 500], ['Diamante Dobel 50', 750], ['Clase Azul', 800], ['Diamante 1,5 L', 800], ['Don Julio 1942', 800]],
  Licores: [["Bailey's", 200], ['Licor 43', 200], ['Malibú', 200], ['Martini', 200], ['Tía María', 200], ['Fireball', 250], ['Jägermeister', 250]],
  Champán: [['Moët & Chandon', 200], ['Veuve Clicquot', 200], ['Moët Rosé', 250], ['Moët Ice', 250], ['Moët N.I.R.', 250], ['Veuve Clicquot Rich', 250], ['Moët Ice Rosé', 300], ['Veuve Clicquot Rich Rosé', 300], ['Dom Pérignon', 450], ['Moët & Chandon 1,5 L', 500], ['Veuve Clicquot 1,5 L', 500], ['Moët Rosé 1,5 L', 550], ['Moët Ice 1,5 L', 550], ['Moët N.I.R. 1,5 L', 550], ['Dom Pérignon Luminous', 550], ['Cristal', 700], ['Armand de Brignac', 750], ['Moët & Chandon 3 L', 1000], ['Dom Pérignon 1,5 L', 1200]],
};

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const MENU_CATEGORIES = Object.keys(RAW_MENU);
export const BOTTLES = Object.entries(RAW_MENU).flatMap(([category, items]) =>
  items.map(([name, price]) => ({
    id: `${slug(category)}-${slug(name)}`,
    category,
    name,
    price,
    mixers: category === 'Champán' ? 0 : RULES.mixersPerSpirit,
  })),
);

export const MIXERS = ['Coca-Cola', 'Coca-Cola Zero', 'Tónica', 'Ginger ale', 'Naranja', 'Limón', 'Agua con gas'];

export const nightType = (dateISO) => {
  const d = new Date(`${dateISO}T12:00:00`).getDay(); // 4 jue, 5 vie, 6 sáb
  return d === 4 ? 'thu' : d === 5 ? 'fri' : d === 6 ? 'sat' : null;
};
export const priceFor = (table, night) => (night === 'thu' ? table.price[1] : table.price[0]);
