// Worker de 2con2estudio: respuesta automática al formulario de contacto (DEMO).
//   POST /api/lead         recibe, valida, guarda y envía los correos (o los registra en modo demo)
//   GET|POST /api/unsubscribe   baja funcional
//   POST /api/booking      webhook opcional del calendario (marca `booked`)
//   GET  /api/health       estado
//   cron diaria            recordatorios (máx. 2)
import { getConfig } from './config.js';
import { json } from './http.js';
import { handleLead } from './lead.js';
import { handleUnsubscribe } from './unsubscribe.js';
import { handleBooking } from './booking.js';
import { runReminders } from './scheduled.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/lead') return await handleLead(request, env);
      if (pathname === '/api/unsubscribe') return await handleUnsubscribe(request, env);
      if (pathname === '/api/booking') return await handleBooking(request, env);
      if (pathname === '/api/health') return json({ ok: true, demo: getConfig(env).demo });
      return json({ ok: false, code: 'not_found' }, 404);
    } catch (err) {
      console.error(JSON.stringify({ event: 'unhandled', name: err?.name, message: String(err?.message || err).slice(0, 200) }));
      return json({ ok: false, code: 'server' }, 500);
    }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
};
