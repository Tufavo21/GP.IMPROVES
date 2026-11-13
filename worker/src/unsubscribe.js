// GET|POST /api/unsubscribe?t=<token>
//  GET  → página con botón de confirmación (los antivirus/escáneres de correo abren los enlaces: un GET no debe dar de baja).
//  POST → marca `unsubscribed`. También sirve para List-Unsubscribe-Post (baja con un clic desde el cliente de correo).
import { readUnsubToken } from './crypto.js';
import { getLead, setStatus } from './db.js';
import { html } from './http.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const COPY = {
  es: {
    title: 'Darme de baja', ask: '¿Quieres dejar de recibir mensajes sobre tu solicitud?', button: 'Confirmar baja',
    done: 'Listo. No volveremos a escribirte.', invalid: 'Este enlace no es válido o ha caducado.', back: 'Volver a la web',
  },
  en: {
    title: 'Unsubscribe', ask: 'Do you want to stop receiving messages about your request?', button: 'Confirm unsubscribe',
    done: 'Done. We will not write to you again.', invalid: 'This link is not valid or has expired.', back: 'Back to the website',
  },
};

function page(lang, body, status = 200) {
  const c = COPY[lang] || COPY.es;
  return html(
    `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(c.title)} · 2con2estudio</title>
<style>body{margin:0;background:#F6F5F2;color:#0B0B0B;font:16px/1.55 Arial,Helvetica,sans-serif}main{max-width:520px;margin:0 auto;padding:72px 20px}h1{font-size:28px;margin:0 0 16px;font-weight:500}button{font:inherit;padding:12px 22px;background:#0B0B0B;color:#F6F5F2;border:1px solid #0B0B0B;cursor:pointer}button:focus-visible,a:focus-visible{outline:2px solid #0B0B0B;outline-offset:3px}a{color:#0B0B0B}p{margin:0 0 20px}</style></head><body><main>${body}</main></body></html>`,
    status,
  );
}

export async function handleUnsubscribe(request, env, log = console) {
  if (!env.DB || !env.APP_SECRET) return page('es', '<h1>2con2estudio</h1><p>Servicio no disponible.</p>', 503);
  const url = new URL(request.url);
  const token = url.searchParams.get('t') || '';
  const id = await readUnsubToken(env.APP_SECRET, token);
  const lead = id ? await getLead(env.DB, id) : null;
  if (!lead) return page('es', `<h1>2con2estudio</h1><p>${esc(COPY.es.invalid)} / ${esc(COPY.en.invalid)}</p>`, 400);
  const lang = lead.lang === 'en' ? 'en' : 'es';
  const c = COPY[lang];

  if (request.method === 'POST') {
    if (lead.status !== 'unsubscribed') {
      await setStatus(env.DB, lead.id, 'unsubscribed', new Date().toISOString());
      log.log(JSON.stringify({ event: 'lead.unsubscribed', id: lead.id }));
    }
    return page(lang, `<h1>${esc(c.title)}</h1><p role="status">${esc(c.done)}</p>`);
  }
  if (request.method !== 'GET') return page(lang, `<p>${esc(c.invalid)}</p>`, 405);
  const done = lead.status === 'unsubscribed';
  return page(
    lang,
    done
      ? `<h1>${esc(c.title)}</h1><p role="status">${esc(c.done)}</p>`
      : `<h1>${esc(c.title)}</h1><p>${esc(c.ask)}</p><form method="post" action="/api/unsubscribe?t=${encodeURIComponent(token)}"><button type="submit">${esc(c.button)}</button></form>`,
  );
}
