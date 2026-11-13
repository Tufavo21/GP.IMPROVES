// POST /api/booking — webhook OPCIONAL del calendario para marcar `booked` y que no lleguen recordatorios.
// [FALTA: confirmar contra el calendario elegido] Está escrito para el formato de webhook de Cal.com
// (cabecera `x-cal-signature-256` = HMAC-SHA256 hex del cuerpo con BOOKING_WEBHOOK_SECRET;
// evento BOOKING_CREATED con `payload.attendees[].email`). No se ha probado contra un Cal.com real.
// Sin BOOKING_WEBHOOK_SECRET la ruta no existe (404).
import { hmacHex, timingSafeEqual } from './crypto.js';
import { markBookedByEmail } from './db.js';
import { json } from './http.js';

export async function handleBooking(request, env, log = console) {
  if (!env.BOOKING_WEBHOOK_SECRET || !env.DB) return json({ ok: false }, 404);
  if (request.method !== 'POST') return json({ ok: false }, 405, { Allow: 'POST' });
  const raw = await request.text();
  if (raw.length > 100_000) return json({ ok: false }, 413);
  const sig = request.headers.get('x-cal-signature-256') || '';
  if (!timingSafeEqual(await hmacHex(env.BOOKING_WEBHOOK_SECRET, raw), sig.toLowerCase())) return json({ ok: false }, 401);

  let evt;
  try { evt = JSON.parse(raw); } catch { return json({ ok: false }, 400); }
  if (evt?.triggerEvent !== 'BOOKING_CREATED') return json({ ok: true, ignored: true });
  const emails = (evt?.payload?.attendees || []).map((a) => a?.email).filter((e) => typeof e === 'string');
  let changed = 0;
  for (const e of emails) changed += await markBookedByEmail(env.DB, e, new Date().toISOString());
  log.log(JSON.stringify({ event: 'lead.booked', changed }));
  return json({ ok: true, changed });
}
