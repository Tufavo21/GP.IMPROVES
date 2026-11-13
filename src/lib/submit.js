// Envío de solicitudes de presupuesto, aislado tras un adaptador.
// [FALTA: servicio de envío] — no hay endpoint real. Por defecto se usa el adaptador `mailto`, que
// abre el programa de correo del visitante con la solicitud redactada para BUSINESS.email
// (mailto no puede adjuntar archivos: el visitante adjunta las fotos en su correo).
//
// Para enchufar un servicio o backend (ver README):
//   0. Define VITE_LEAD_ENDPOINT=/api/lead al construir → se usa `leadAdapter` (JSON hacia el Worker de
//      `worker/`: validación en servidor, guardado y correos; modo demo). Tiene prioridad sobre las demás.
//   1. Define VITE_SUBMIT_ENDPOINT=https://… al construir → se usa `httpAdapter` (multipart/form-data
//      con los campos y las fotos), o
//   2. registra tu propio adaptador: setAdapter(async (payload) => ({ ok: true, mode: 'http' })).
import { BUSINESS } from '../content/business.js';

// Construye el enlace mailto con la solicitud redactada (también es el respaldo si falla el Worker).
export function buildMailto({ data, photos, labels }) {
  const lines = [
    `${labels.nombre}: ${data.nombre}`,
    `${labels.email}: ${data.email}`,
    `${labels.telefono}: ${data.telefono}`,
    `${labels.tipo}: ${labels.tipoValue}`,
    `${labels.acabados}: ${labels.acabadosValue}`,
    `${labels.m2}: ${data.m2}`,
    '',
    `${labels.descripcion}:`,
    data.descripcion.trim().slice(0, 1200),
  ];
  if (photos.length) lines.push('', `${labels.fotos}: ${photos.map((p) => p.name).join(', ')}`);
  const subject = `Solicitud de presupuesto · ${labels.tipoValue} · ${data.nombre}`;
  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function mailtoAdapter(payload) {
  window.location.href = buildMailto(payload);
  return { ok: true, mode: 'mailto', photos: payload.photos.length };
}

export function httpAdapter(endpoint) {
  return async ({ data, photos }) => {
    const body = new FormData();
    Object.entries(data).forEach(([k, v]) => body.append(k, typeof v === 'boolean' ? String(v) : v));
    photos.forEach((p) => body.append('fotos', p.file, p.name));
    const res = await fetch(endpoint, { method: 'POST', body });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, mode: 'http' };
  };
}

// Error del Worker con `kind`: 'validation' (con `errors` por campo) | 'rate' | 'network' | 'server'.
export class LeadError extends Error {
  constructor(kind, extra = {}) { super(kind); this.kind = kind; Object.assign(this, extra); }
}

// Envía JSON a /api/lead (Worker). Las fotos NO se suben: solo viaja cuántas se eligieron, y el correo de
// confirmación le pide al visitante que las envíe respondiendo.
export function leadAdapter(endpoint, timeoutMs = 15000) {
  return async ({ data, photos, lang }) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website: data.website || '', lang, fotos: photos.length }),
        signal: ctrl.signal,
      });
    } catch { throw new LeadError('network'); } finally { clearTimeout(timer); }
    let json = null;
    try { json = await res.json(); } catch { /* respuesta sin JSON */ }
    if (res.status === 422 && json?.errors) throw new LeadError('validation', { errors: json.errors });
    if (res.status === 429) throw new LeadError('rate');
    if (!res.ok || !json?.ok) throw new LeadError('server');
    return { ok: true, mode: 'lead', mail: json.mail, demo: Boolean(json.demo), preview: json.preview };
  };
}

const LEAD_ENDPOINT = import.meta.env?.VITE_LEAD_ENDPOINT;
const ENDPOINT = import.meta.env?.VITE_SUBMIT_ENDPOINT;
let adapter = LEAD_ENDPOINT ? leadAdapter(LEAD_ENDPOINT) : ENDPOINT ? httpAdapter(ENDPOINT) : mailtoAdapter;

export function setAdapter(fn) { adapter = fn; }

export async function submitRequest(payload) {
  try {
    return await adapter(payload);
  } catch (err) {
    return { ok: false, error: err };
  }
}
