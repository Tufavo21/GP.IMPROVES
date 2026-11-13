// POST /api/lead
import { getConfig } from './config.js';
import { ipKey, makeUnsubToken } from './crypto.js';
import { hitRateLimit, insertLead } from './db.js';
import { json } from './http.js';
import { deliver } from './mail.js';
import { parseLead, messageFor } from './validate.js';
import { visitorConfirmation, ownerSummary } from './templates.js';
import { draftReply } from './ai.js';

const MAX_BODY = 20_000; // bytes; el formulario real pesa ~3 KB

export const unsubscribeUrl = (base, token) => `${base}/api/unsubscribe?t=${encodeURIComponent(token)}`;

export async function handleLead(request, env, log = console) {
  const cfg = getConfig(env);
  if (request.method !== 'POST') return json({ ok: false, code: 'method' }, 405, { Allow: 'POST' });

  // Origen: si se configuró ALLOWED_ORIGINS, un navegador solo puede llamar desde ahí.
  const origin = request.headers.get('Origin');
  if (origin && cfg.allowedOrigins.length && !cfg.allowedOrigins.includes(origin.toLowerCase())) {
    return json({ ok: false, code: 'origin' }, 403);
  }
  if (!env.DB || !env.APP_SECRET) {
    log.error(JSON.stringify({ event: 'config.missing', missing: [!env.DB && 'DB', !env.APP_SECRET && 'APP_SECRET'].filter(Boolean) }));
    return json({ ok: false, code: 'config' }, 503);
  }
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) {
    return json({ ok: false, code: 'content_type' }, 415);
  }

  // Límite por IP (antes de leer el cuerpo): ventana fija, la IP solo se guarda como hash con clave.
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const windowMs = cfg.rateWindowMin * 60_000;
  const bucket = Math.floor(Date.now() / windowMs);
  const hits = await hitRateLimit(env.DB, await ipKey(env.APP_SECRET, ip), bucket);
  if (hits > cfg.rateMax) {
    const retry = Math.max(1, Math.ceil(((bucket + 1) * windowMs - Date.now()) / 1000));
    log.warn(JSON.stringify({ event: 'lead.rate_limited' }));
    return json({ ok: false, code: 'rate_limited', retryAfter: retry }, 429, { 'Retry-After': String(retry) });
  }

  const text = await request.text();
  if (text.length > MAX_BODY) return json({ ok: false, code: 'too_large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ ok: false, code: 'bad_json' }, 400); }

  const parsed = parseLead(body);
  if (parsed.kind === 'honeypot') {
    log.warn(JSON.stringify({ event: 'lead.honeypot' }));
    return json({ ok: true }); // el bot cree que ha funcionado; no se guarda ni se envía nada
  }
  if (parsed.kind === 'invalid') {
    const messages = Object.fromEntries(Object.entries(parsed.errors).map(([k, c]) => [k, messageFor(parsed.lang, c)]));
    return json({ ok: false, code: 'validation', errors: parsed.errors, messages }, 422);
  }

  const now = new Date().toISOString();
  const lead = { ...parsed.lead, id: crypto.randomUUID(), created_at: now, consent_at: now, is_demo: cfg.demo, status: 'new' };
  await insertLead(env.DB, lead);

  const base = cfg.publicBaseUrl || new URL(request.url).origin;
  const unsubUrl = unsubscribeUrl(base, await makeUnsubToken(env.APP_SECRET, lead.id));
  const aiDraft = await draftReply(env, cfg, lead, log); // solo texto para el dueño; nunca se envía solo

  const [visitor, owner] = await Promise.all([
    deliver(env, cfg, visitorConfirmation({ lead, cfg, unsubUrl, photos: parsed.photos }), log),
    deliver(env, cfg, ownerSummary({ lead, cfg, photos: parsed.photos, aiDraft }), log),
  ]);
  log.log(JSON.stringify({ event: 'lead.created', id: lead.id, lang: lead.lang, demo: cfg.demo, visitor: visitor.status, owner: owner.status }));

  return json({
    ok: true,
    id: lead.id,
    demo: cfg.demo,
    mail: visitor.status, // sent | logged | skipped | failed
    preview: cfg.demo ? visitor.preview : undefined, // solo en modo demo: vista previa del correo al visitante
  });
}
