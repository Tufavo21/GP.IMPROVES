// Lectura de variables del Worker. Todo llega por `env` (vars de wrangler.toml o secretos).
import { BUSINESS } from '../../src/content/business.js';

const flag = (v, fallback) => {
  if (v === undefined || v === null || String(v).trim() === '') return fallback;
  return String(v).trim().toLowerCase() === 'true';
};
const int = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const list = (v) => String(v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

export function getConfig(env) {
  return {
    demo: flag(env.DEMO_MODE, true), // por defecto SIEMPRE demo: lo seguro es no enviar
    aiDraft: flag(env.AI_DRAFT, false),
    allowlist: list(env.DEMO_ALLOWLIST),
    ownerEmail: String(env.OWNER_EMAIL || '').trim() || BUSINESS.email,
    mailFrom: String(env.MAIL_FROM || '').trim(),
    bookingUrl: String(env.BOOKING_URL || '').trim(),
    postalAddress: String(env.POSTAL_ADDRESS || '').trim(),
    publicBaseUrl: String(env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, ''),
    allowedOrigins: list(env.ALLOWED_ORIGINS),
    rateMax: int(env.RATE_LIMIT_MAX, 8),
    rateWindowMin: int(env.RATE_LIMIT_WINDOW_MIN, 60),
    siteName: BUSINESS.name,
    founders: BUSINESS.founders,
  };
}

// Fuera del modo demo, los correos al visitante no salen si falta algo obligatorio.
export function mailConfigProblems(env, cfg) {
  if (cfg.demo) return []; // en demo los marcadores [FALTA] se muestran tal cual
  const p = [];
  if (!env.RESEND_API_KEY) p.push('RESEND_API_KEY');
  if (!cfg.mailFrom) p.push('MAIL_FROM');
  if (!cfg.bookingUrl) p.push('BOOKING_URL');
  if (!cfg.postalAddress) p.push('POSTAL_ADDRESS');
  if (!cfg.publicBaseUrl) p.push('PUBLIC_BASE_URL');
  return p;
}

export const FALTA_TEXT = {
  bookingUrl: '[FALTA: URL del calendario]',
  postalAddress: '[FALTA: dirección postal]',
};
