// Plantillas de correo (ES/EN). Sobrias: sin plazos, precios ni promesas de resultado.
// Todo texto del visitante se escapa en el HTML y se limpia de saltos de línea en los asuntos.
import es from '../../src/i18n/es.js';
import en from '../../src/i18n/en.js';
import { FALTA_TEXT } from './config.js';

const DICT = { es: es.contact, en: en.contact };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();
const fmtM2 = (n) => String(Number.isInteger(n) ? n : Math.round(n * 10) / 10);

const T = {
  es: {
    hello: (n) => `Hola ${n},`,
    sign: 'Bea Pérez y Gonzalo Pau',
    confirmSubject: 'Hemos recibido tu solicitud · 2con2estudio',
    confirmIntro: (tipo, m2) => `Hemos recibido tu solicitud de ${tipo.toLowerCase()} (${m2} m²). Vamos a revisar la información que nos has enviado y nos pondremos en contacto contigo.`,
    confirmBook: 'Si prefieres comentarlo de viva voz, puedes reservar una llamada en este enlace:',
    confirmPhotos: (n) => (n > 0 ? 'Si quieres que veamos las fotos de la vivienda, responde a este correo y adjúntalas.' : 'Si tienes fotos de la vivienda, puedes responder a este correo y adjuntarlas.'),
    r1Subject: '¿Quieres que hablemos de tu reforma? · 2con2estudio',
    r1Body: (tipo) => `Hace un día recibimos tu solicitud de ${tipo.toLowerCase()}. Si sigues interesado/a, puedes reservar una llamada para comentarla:`,
    r2Subject: 'Un último aviso sobre tu solicitud · 2con2estudio',
    r2Body: (tipo) => `Te escribimos por última vez sobre tu solicitud de ${tipo.toLowerCase()}. Si todavía quieres hablarlo, este es el enlace para reservar una llamada:`,
    r2Close: 'No volveremos a escribirte sobre esta solicitud.',
    ignore: 'Si ya no te interesa, puedes ignorar este mensaje.',
    footer: (site) => `Recibes este mensaje porque enviaste una solicitud en ${site}.`,
    unsub: 'Darme de baja',
    unsubLead: 'Si no quieres recibir más mensajes:',
    postal: 'Dirección postal:',
    ownerSubject: (tipo, m2, nombre) => `Nueva solicitud · ${tipo} · ${m2} m² · ${nombre}`,
    ownerLead: 'Nueva solicitud recibida desde la web.',
    labels: { nombre: 'Nombre', email: 'Email', telefono: 'Teléfono', tipo: 'Tipo de reforma', acabados: 'Acabados', m2: 'Superficie', mensaje: 'Mensaje', estado: 'Estado', id: 'Referencia', fecha: 'Fecha', fotos: 'Fotos' },
    photos: (n) => (n > 0 ? `El visitante seleccionó ${n} foto(s); no se han subido (se le ha pedido que las envíe por correo).` : 'Sin fotos.'),
    aiTitle: 'Borrador sugerido (generado por IA, NO enviado; revísalo antes de usarlo)',
  },
  en: {
    hello: (n) => `Hello ${n},`,
    sign: 'Bea Pérez and Gonzalo Pau',
    confirmSubject: 'We have received your request · 2con2estudio',
    confirmIntro: (tipo, m2) => `We have received your ${tipo.toLowerCase()} request (${m2} m²). We will review the information you sent and get in touch with you.`,
    confirmBook: 'If you would rather talk it through, you can book a call here:',
    confirmPhotos: (n) => (n > 0 ? 'If you would like us to see photos of the property, reply to this email and attach them.' : 'If you have photos of the property, you can reply to this email and attach them.'),
    r1Subject: 'Would you like to talk about your renovation? · 2con2estudio',
    r1Body: (tipo) => `We received your ${tipo.toLowerCase()} request a day ago. If you are still interested, you can book a call to discuss it:`,
    r2Subject: 'One last note about your request · 2con2estudio',
    r2Body: (tipo) => `This is our last message about your ${tipo.toLowerCase()} request. If you still want to talk it over, here is the link to book a call:`,
    r2Close: 'We will not write to you again about this request.',
    ignore: 'If you are no longer interested, you can ignore this message.',
    footer: (site) => `You are receiving this message because you sent a request on ${site}.`,
    unsub: 'Unsubscribe',
    unsubLead: 'If you do not want to receive more messages:',
    postal: 'Postal address:',
    ownerSubject: (tipo, m2, nombre) => `New request · ${tipo} · ${m2} m² · ${nombre}`,
    ownerLead: 'New request received from the website.',
    labels: { nombre: 'Name', email: 'Email', telefono: 'Phone', tipo: 'Type of renovation', acabados: 'Finishes', m2: 'Area', mensaje: 'Message', estado: 'Status', id: 'Reference', fecha: 'Date', fotos: 'Photos' },
    photos: (n) => (n > 0 ? `The visitor selected ${n} photo(s); they were not uploaded (the visitor was asked to send them by email).` : 'No photos.'),
    aiTitle: 'Suggested draft (AI-generated, NOT sent; review before using)',
  },
};

const labelsOf = (lead) => {
  const d = DICT[lead.lang] || DICT.es;
  return { tipo: d.tipos[lead.reform_type] || lead.reform_type, acabados: d.acabadosOpts[lead.finishes] || lead.finishes };
};

// Marco HTML común: una sola columna, sin imágenes ni estilos de marca (los clientes de correo los recortan).
const wrap = (inner) =>
  `<!doctype html><html><body style="margin:0;background:#ffffff"><div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#0b0b0b;max-width:560px;margin:0 auto;padding:24px">${inner}</div></body></html>`;

function visitorFooter(lead, cfg, unsubUrl) {
  const t = T[lead.lang];
  const postal = cfg.postalAddress || FALTA_TEXT.postalAddress;
  return {
    text: `\n--\n${t.footer(cfg.siteName)}\n${t.unsubLead} ${unsubUrl}\n${t.postal} ${postal}\n`,
    html: `<hr style="border:0;border-top:1px solid #d6d6d2;margin:24px 0 12px"><p style="font-size:12px;color:#3a3a38;margin:0">${esc(t.footer(cfg.siteName))}<br>${esc(t.unsubLead)} <a href="${esc(unsubUrl)}" style="color:#3a3a38">${esc(t.unsub)}</a><br>${esc(t.postal)} ${esc(postal)}</p>`,
  };
}

const unsubHeaders = (unsubUrl) => ({ 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' });

export function visitorConfirmation({ lead, cfg, unsubUrl, photos = 0 }) {
  const t = T[lead.lang];
  const l = labelsOf(lead);
  const book = cfg.bookingUrl || FALTA_TEXT.bookingUrl;
  const foot = visitorFooter(lead, cfg, unsubUrl);
  const text = `${t.hello(lead.name)}\n\n${t.confirmIntro(l.tipo, fmtM2(lead.area_m2))}\n\n${t.confirmBook}\n${book}\n\n${t.confirmPhotos(photos)}\n\n${t.sign}\n${cfg.siteName}\n${foot.text}`;
  const html = wrap(
    `<p>${esc(t.hello(lead.name))}</p><p>${esc(t.confirmIntro(l.tipo, fmtM2(lead.area_m2)))}</p><p>${esc(t.confirmBook)}<br><a href="${esc(book)}" style="color:#0b0b0b">${esc(book)}</a></p><p>${esc(t.confirmPhotos(photos))}</p><p>${esc(t.sign)}<br>${esc(cfg.siteName)}</p>${foot.html}`,
  );
  return { kind: 'visitor_confirmation', to: lead.email, subject: t.confirmSubject, text, html, headers: unsubHeaders(unsubUrl) };
}

export function reminder({ n, lead, cfg, unsubUrl }) {
  const t = T[lead.lang];
  const l = labelsOf(lead);
  const book = cfg.bookingUrl || FALTA_TEXT.bookingUrl;
  const body = n === 1 ? t.r1Body(l.tipo) : t.r2Body(l.tipo);
  const close = n === 2 ? t.r2Close : t.ignore;
  const foot = visitorFooter(lead, cfg, unsubUrl);
  const text = `${t.hello(lead.name)}\n\n${body}\n${book}\n\n${close}\n\n${t.sign}\n${cfg.siteName}\n${foot.text}`;
  const html = wrap(
    `<p>${esc(t.hello(lead.name))}</p><p>${esc(body)}<br><a href="${esc(book)}" style="color:#0b0b0b">${esc(book)}</a></p><p>${esc(close)}</p><p>${esc(t.sign)}<br>${esc(cfg.siteName)}</p>${foot.html}`,
  );
  return { kind: `reminder${n}`, to: lead.email, subject: n === 1 ? t.r1Subject : t.r2Subject, text, html, headers: unsubHeaders(unsubUrl) };
}

// Resumen al dueño. Va en el idioma del panel del dueño (español); incluye el idioma del visitante.
export function ownerSummary({ lead, cfg, photos = 0, aiDraft = '' }) {
  const t = T.es;
  const l = { tipo: DICT.es.tipos[lead.reform_type] || lead.reform_type, acabados: DICT.es.acabadosOpts[lead.finishes] || lead.finishes };
  const rows = [
    [t.labels.nombre, lead.name], [t.labels.email, lead.email], [t.labels.telefono, lead.phone],
    [t.labels.tipo, l.tipo], [t.labels.acabados, l.acabados], [t.labels.m2, `${fmtM2(lead.area_m2)} m²`],
    [t.labels.fotos, t.photos(photos)], [t.labels.estado, `${lead.status || 'new'} · idioma: ${lead.lang}`],
    [t.labels.fecha, lead.created_at], [t.labels.id, lead.id],
  ];
  const text = `${t.ownerLead}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${t.labels.mensaje}:\n${lead.message}\n${aiDraft ? `\n--\n${t.aiTitle}:\n${aiDraft}\n` : ''}`;
  const html = wrap(
    `<p>${esc(t.ownerLead)}</p><table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#3a3a38;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}</table><p style="margin:16px 0 4px;color:#3a3a38">${esc(t.labels.mensaje)}</p><p style="margin:0;white-space:pre-wrap">${esc(lead.message)}</p>${aiDraft ? `<hr style="border:0;border-top:1px solid #d6d6d2;margin:20px 0 12px"><p style="margin:0 0 4px;color:#3a3a38">${esc(t.aiTitle)}</p><p style="margin:0;white-space:pre-wrap">${esc(aiDraft)}</p>` : ''}`,
  );
  return {
    kind: 'owner_summary', to: cfg.ownerEmail,
    subject: oneLine(t.ownerSubject(l.tipo, fmtM2(lead.area_m2), lead.name)).slice(0, 180),
    text, html, replyTo: lead.email,
  };
}
