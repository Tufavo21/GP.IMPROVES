// Función serverless (Vercel) que valida la solicitud y la envía por email con Resend.
// Variables de entorno (nunca en el cliente): RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (opcional),
// ALLOWED_ORIGIN (opcional). No se almacena ningún dato: solo se reenvía por email.
import { validateAll, MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_BYTES } from '../shared/schema.js';
import { PRICING, SHOW_ESTIMATE } from '../src/data/pricing.js';
import { computeEstimate, estimateArea } from '../src/lib/estimate.js';

const RATE_MAX = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map(); // IP -> marcas de tiempo. Limitación best-effort por instancia serverless.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { type: 'image/png', ext: 'png' };
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  if (buf.subarray(4, 8).toString('latin1') === 'ftyp' && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(buf.subarray(8, 12).toString('latin1'))) return { type: 'image/heic', ext: 'heic' };
  return null;
}

export function rateLimited(ip, now = Date.now(), store = hits) {
  const recent = (store.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) { store.set(ip, recent); return true; }
  recent.push(now); store.set(ip, recent);
  return false;
}

const LABELS = {
  tipo: { cocina: 'Cocina', bano: 'Baño', integral: 'Reforma integral', otro: 'Otro' },
  vivienda: { piso: 'Piso', casa: 'Casa o chalet', atico: 'Ático', otro: 'Otro' },
  estancia: { cocina: 'Cocina', bano: 'Baño', salon: 'Salón-comedor', dormitorio: 'Dormitorio', pasillo: 'Pasillo o entrada', otra: 'Otra estancia' },
  acabados: { basico: 'Básico', medio: 'Medio', alto: 'Alto' },
  plazo: { asap: 'Cuanto antes', '3m': 'En 1 a 3 meses', '6m': 'En 3 a 6 meses', mas6m: 'En más de 6 meses', sin: 'Sin fecha definida' },
};

export function buildEmail(d, estimate) {
  const rooms = d.estancias.map((r, i) => {
    const dims = r.modo === 'lah' ? `${r.largo} × ${r.ancho} × ${r.alto} m` : `${r.m2} m²`;
    return `${i + 1}. ${LABELS.estancia[r.nombre]}: ${dims}`;
  });
  const est = estimate
    ? `Baremo calculado (orientativo): ${estimate.min} € – ${estimate.max} € sobre ${estimate.m2} m²`
    : 'Baremo: sin calcular (baremo vacío o desactivado)';
  const rows = [
    ['Nombre', d.nombre], ['Email', d.email], ['Teléfono', d.telefono], ['Idioma de la web', d.lang === 'en' ? 'EN' : 'ES'],
    ['Tipo de reforma', LABELS.tipo[d.tipo] + (d.tipo === 'otro' ? `: ${d.tipoOtro}` : '')],
    ['Vivienda', LABELS.vivienda[d.vivienda] + (d.vivienda === 'otro' ? `: ${d.viviendaOtro}` : '')],
    ['Superficie de la vivienda', `${d.m2Vivienda} m²`],
    ['Estancias', rooms.join('\n')],
    ['Acabados', LABELS.acabados[d.acabados]], ['Plazo', LABELS.plazo[d.plazo]],
    ['Mensaje', d.mensaje], ['Estimación', est], ['Fotos adjuntas', String(d.fotos.length)],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="border-bottom:1px solid #ddd;font-weight:bold;vertical-align:top">${esc(k)}</td><td style="border-bottom:1px solid #ddd;white-space:pre-line">${esc(v)}</td></tr>`).join('')}</table>`;
  return { text, html };
}

// Núcleo testeable: no depende de Vercel. Devuelve { status, json }.
export async function processRequest({ body, ip = 'unknown', env = process.env, fetchFn = fetch, now = Date.now(), store = hits }) {
  if (!body || typeof body !== 'object') return { status: 400, json: { ok: false, error: 'invalid' } };
  if (body.website) return { status: 200, json: { ok: true } }; // honeypot: se responde bien y no se envía nada
  if (rateLimited(ip, now, store)) return { status: 429, json: { ok: false, error: 'rate' } };

  const raw = Array.isArray(body.fotos) ? body.fotos : [];
  if (raw.length > MAX_PHOTOS) return { status: 400, json: { ok: false, errors: { fotos: 'count' } } };
  const decoded = [];
  for (const p of raw) {
    const buf = Buffer.from(typeof p?.data === 'string' ? p.data : '', 'base64');
    const kind = sniff(buf);
    decoded.push({ buf, kind, meta: { name: String(p?.name || ''), type: kind?.type || 'invalid', size: buf.length } });
  }
  if (decoded.some((x) => !x.kind)) return { status: 400, json: { ok: false, errors: { fotos: 'type' } } };

  const d = { ...body, fotos: decoded.map((x) => x.meta) };
  const errors = validateAll(d);
  if (Object.keys(errors).length) return { status: 400, json: { ok: false, errors } };
  if (decoded.some((x) => x.buf.length > MAX_PHOTO_BYTES) || decoded.reduce((s, x) => s + x.buf.length, 0) > MAX_TOTAL_BYTES) {
    return { status: 400, json: { ok: false, errors: { fotos: 'size' } } };
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) return { status: 500, json: { ok: false, error: 'config' } };

  const pricing = env.__PRICING || PRICING; const show = env.__SHOW ?? SHOW_ESTIMATE;
  const estimate = computeEstimate(d, pricing, show);
  const { text, html } = buildEmail({ ...d, lang: body.lang }, estimate);
  const payload = {
    from: env.CONTACT_FROM_EMAIL || '2con2estudio <onboarding@resend.dev>',
    to: [env.CONTACT_TO_EMAIL],
    reply_to: d.email.trim(),
    subject: `Nueva solicitud de reforma · ${d.nombre.trim()} · ${LABELS.tipo[d.tipo]}`,
    text, html,
    attachments: decoded.map((x, i) => ({ filename: `foto-${i + 1}.${x.kind.ext}`, content: x.buf.toString('base64') })),
  };
  try {
    const res = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { status: 502, json: { ok: false, error: 'mail' } };
  } catch {
    return { status: 502, json: { ok: false, error: 'mail' } };
  }
  return { status: 200, json: { ok: true } };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.origin && req.headers.origin !== allowed) return res.status(403).json({ ok: false });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const out = await processRequest({ body, ip });
  return res.status(out.status).json(out.json);
}
