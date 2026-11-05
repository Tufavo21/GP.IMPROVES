// Envío de solicitudes de presupuesto, aislado tras un adaptador.
// [FALTA: servicio de envío] — no hay endpoint real. Por defecto se usa el adaptador `mailto`, que
// abre el programa de correo del visitante con la solicitud redactada para BUSINESS.email
// (mailto no puede adjuntar archivos: el visitante adjunta las fotos en su correo).
//
// Para enchufar un servicio o backend (ver README):
//   1. Define VITE_SUBMIT_ENDPOINT=https://… al construir → se usa `httpAdapter` (multipart/form-data
//      con los campos y las fotos), o
//   2. registra tu propio adaptador: setAdapter(async (payload) => ({ ok: true, mode: 'http' })).
import { BUSINESS } from '../content/business.js';

export function mailtoAdapter({ data, photos, labels }) {
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
  const href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  window.location.href = href;
  return { ok: true, mode: 'mailto', photos: photos.length };
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

const ENDPOINT = import.meta.env?.VITE_SUBMIT_ENDPOINT;
let adapter = ENDPOINT ? httpAdapter(ENDPOINT) : mailtoAdapter;

export function setAdapter(fn) { adapter = fn; }

export async function submitRequest(payload) {
  try {
    return await adapter(payload);
  } catch (err) {
    return { ok: false, error: err };
  }
}
