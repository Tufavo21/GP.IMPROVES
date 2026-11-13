// Validación en SERVIDOR. Reutiliza las mismas reglas que el cliente (src/lib/validate.js) para que
// nunca diverjan, y añade lo que solo el servidor puede garantizar (tipos, saneado, honeypot).
import { validate, MAX_PHOTOS } from '../../src/lib/validate.js';

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (s) => s.replace(CONTROL, '').trim();

const MESSAGES = {
  es: {
    required: 'Este campo es obligatorio.',
    minLen: 'Escribe al menos 10 caracteres.',
    maxLen: 'Máximo 2000 caracteres.',
    email: 'Revisa el email: falta la @ o el dominio.',
    phone: 'Revisa el teléfono: de 9 a 15 cifras.',
    name: 'Escribe tu nombre (mínimo 2 caracteres).',
    m2: 'Indica una superficie entre 1 y 2000 m².',
    privacy: 'Necesitamos tu conformidad para responderte.',
  },
  en: {
    required: 'This field is required.',
    minLen: 'Write at least 10 characters.',
    maxLen: 'Maximum 2000 characters.',
    email: 'Check the email: the @ or the domain is missing.',
    phone: 'Check the phone number: 9 to 15 digits.',
    name: 'Enter your name (at least 2 characters).',
    m2: 'Enter an area between 1 and 2000 m².',
    privacy: 'We need your consent to reply.',
  },
};
export const messageFor = (lang, code) => (MESSAGES[lang] || MESSAGES.es)[code] || MESSAGES.es.required;

const STRING_FIELDS = ['nombre', 'email', 'telefono', 'tipo', 'acabados', 'descripcion'];

// Devuelve { kind: 'invalid', errors } | { kind: 'honeypot' } | { kind: 'ok', lead, photos }
export function parseLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { kind: 'invalid', lang: 'es', errors: { _body: 'required' } };
  }
  const lang = body.lang === 'en' ? 'en' : 'es';

  // Trampa anti-spam: un humano no ve este campo. Se responde como si todo fuese bien, sin guardar nada.
  if (typeof body.website === 'string' && body.website.trim() !== '') return { kind: 'honeypot', lang };

  const raw = {};
  const typeErrors = {};
  for (const k of STRING_FIELDS) {
    if (typeof body[k] === 'string') raw[k] = clean(body[k]);
    else { raw[k] = ''; typeErrors[k] = 'required'; }
  }
  // m² llega como texto del input o como número; cualquier otra cosa es inválida.
  if (typeof body.m2 === 'number' || typeof body.m2 === 'string') raw.m2 = typeof body.m2 === 'string' ? clean(body.m2) : body.m2;
  else { raw.m2 = ''; typeErrors.m2 = 'required'; }
  raw.privacidad = body.privacidad === true;

  raw.nombre = raw.nombre.replace(/\s+/g, ' ');
  raw.email = raw.email.toLowerCase();
  raw.telefono = raw.telefono.replace(/[\s.\-()]/g, '');

  const errors = { ...validate(raw), ...typeErrors };
  if (Object.keys(errors).length) return { kind: 'invalid', lang, errors };

  const photos = Number.isInteger(body.fotos) ? Math.min(Math.max(body.fotos, 0), MAX_PHOTOS) : 0;
  return {
    kind: 'ok',
    photos, // solo el número, para el resumen; las fotos NO se reciben ni se guardan
    lead: {
      lang,
      name: raw.nombre,
      email: raw.email,
      phone: raw.telefono,
      reform_type: raw.tipo,
      finishes: raw.acabados,
      area_m2: Number(raw.m2),
      message: raw.descripcion,
    },
  };
}
