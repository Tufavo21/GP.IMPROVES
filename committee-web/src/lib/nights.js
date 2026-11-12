import { CLUB, RULES, TABLES, priceFor } from '../content/data.js';

export const NIGHTS = ['thu', 'fri', 'sat'];
// Rojo y negro: el mismo rojo todas las noches. El texto sobre el rojo siempre va en negro.
export const ACCENTS = { thu: [255, 30, 39], fri: [255, 30, 39], sat: [255, 30, 39] };
export const OPENS = { thu: '00:30', fri: '23:59', sat: '23:59' };
export const CLOSES = '07:30';
export const DAY = {
  thu: { es: 'Jueves', en: 'Thursday', short: { es: 'JUE', en: 'THU' } },
  fri: { es: 'Viernes', en: 'Friday', short: { es: 'VIE', en: 'FRI' } },
  sat: { es: 'Sábado', en: 'Saturday', short: { es: 'SÁB', en: 'SAT' } },
};
const DOW = { 4: 'thu', 5: 'fri', 6: 'sat' };

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Temporada publicada: de septiembre a mayo.
export const inSeason = (d) => d.getMonth() >= 8 || d.getMonth() <= 4;

// Próximas noches de apertura a partir de hoy (jueves, viernes y sábado en temporada).
export function upcomingNights(count = 9, from = new Date()) {
  const out = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 400 && out.length < count; i += 1) {
    const type = DOW[d.getDay()];
    if (type && inSeason(d)) out.push({ date: iso(d), type, day: d.getDate(), month: d.getMonth() });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export const nextOf = (type, list) => list.find((n) => n.type === type);
export const monthName = (m, lang) => new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { month: 'long' }).format(new Date(2026, m, 1));
export const fmtDate = (dateISO, lang) => new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${dateISO}T12:00:00`));
export const eur = (n, lang = 'es') => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(n);

export const tableFrom = (type) => Math.min(...TABLES.map((t) => priceFor(t, type)));
export const zoneFrom = (zone, type) => Math.min(...TABLES.filter((t) => t.zone === zone).map((t) => priceFor(t, type)));

// Presupuesto: el precio de la mesa es consumo mínimo; las botellas cuentan contra él.
export function quote(table, type, guests, bottles) {
  const base = priceFor(table, type);
  const extra = Math.max(0, guests - RULES.baseGuests);
  const minimum = Math.round(base * (1 + RULES.extraSurcharge * extra));
  const spent = bottles.reduce((s, b) => s + b.price * b.qty, 0);
  const total = Math.max(minimum, spent);
  return { base, extra, minimum, spent, remaining: Math.max(0, minimum - spent), total, deposit: Math.round(total * RULES.depositPct) };
}

export { CLUB, RULES };
