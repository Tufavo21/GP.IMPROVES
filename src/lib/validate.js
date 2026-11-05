// Validación del formulario de presupuesto. Devuelve códigos; la interfaz los traduce.
import { TYPES, FINISHES } from '../content/pricing.js';

export const MIN_TEXT = 10;
export const MAX_TEXT = 2000;
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_MB = 10;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const PHOTO_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function photoProblem(file) {
  const ext = String(file.name || '').split('.').pop().toLowerCase();
  const typeOk = PHOTO_TYPES.includes(String(file.type || '').toLowerCase()) || (!file.type && PHOTO_EXT.includes(ext));
  if (!typeOk) return 'fileType';
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) return 'fileSize';
  return null;
}

export const VALIDATORS = {
  nombre: (v) => { const s = (v || '').trim(); return !s ? 'required' : s.length < 2 || s.length > 120 ? 'name' : null; },
  email: (v) => { const s = (v || '').trim(); return !s ? 'required' : !EMAIL_RE.test(s) || s.length > 200 ? 'email' : null; },
  telefono: (v) => { const s = (v || '').replace(/[\s.\-()]/g, ''); return !s ? 'required' : !/^\+?\d{9,15}$/.test(s) ? 'phone' : null; },
  tipo: (v) => (!v ? 'required' : TYPES.includes(v) ? null : 'required'),
  acabados: (v) => (!v ? 'required' : FINISHES.includes(v) ? null : 'required'),
  m2: (v) => { if (v === '' || v == null) return 'required'; const n = Number(v); return !Number.isFinite(n) || n < 1 || n > 2000 ? 'm2' : null; },
  descripcion: (v) => { const s = (v || '').trim(); return !s ? 'required' : s.length < MIN_TEXT ? 'minLen' : s.length > MAX_TEXT ? 'maxLen' : null; },
  privacidad: (v) => (v === true ? null : 'privacy'),
};

export const FIELD_ORDER = ['nombre', 'email', 'telefono', 'tipo', 'acabados', 'm2', 'descripcion', 'privacidad'];

export function validate(data) {
  const errors = {};
  for (const k of FIELD_ORDER) { const e = VALIDATORS[k](data[k]); if (e) errors[k] = e; }
  return errors;
}
