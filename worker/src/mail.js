// Envío de correo con la API de Resend + PUERTA DEL MODO DEMO.
// [FALTA: elegir proveedor y clave] Para cambiar a Brevo u otro, solo hay que reescribir el bloque `fetch` de `deliver`.
import { mailConfigProblems } from './config.js';

const maskEmail = (e) => String(e).replace(/^(.).*(@.*)$/, '$1***$2');

// Resultado: { status: 'sent' | 'logged' | 'skipped' | 'failed', preview? }
//  sent    → lo aceptó el proveedor
//  logged  → modo demo y destinatario fuera de la lista blanca: NO sale, solo log + vista previa
//  skipped → faltan configuración o clave: no sale
//  failed  → el proveedor devolvió error
export async function deliver(env, cfg, msg, log = console) {
  const message = cfg.demo ? demoMark(msg) : msg;
  const to = String(message.to).trim();
  const preview = { to: maskEmail(to), subject: message.subject, text: message.text };

  if (cfg.demo && !cfg.allowlist.includes(to.toLowerCase())) {
    log.log(JSON.stringify({ event: 'mail.demo_blocked', kind: message.kind, to: maskEmail(to), subject: message.subject, chars: message.text.length }));
    return { status: 'logged', preview };
  }
  // Fuera de demo faltan los datos obligatorios; en demo (destinatario permitido) basta con clave y remitente.
  const missing = cfg.demo
    ? [!env.RESEND_API_KEY && 'RESEND_API_KEY', !cfg.mailFrom && 'MAIL_FROM'].filter(Boolean)
    : mailConfigProblems(env, cfg);
  if (missing.length) {
    log.warn(JSON.stringify({ event: 'mail.skipped', kind: message.kind, missing }));
    return { status: 'skipped', preview: cfg.demo ? preview : undefined };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: cfg.mailFrom,
        to: [to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo || undefined,
        headers: message.headers || undefined,
      }),
    });
    if (!res.ok) {
      log.error(JSON.stringify({ event: 'mail.failed', kind: message.kind, http: res.status })); // sin cuerpo ni clave
      return { status: 'failed' };
    }
    log.log(JSON.stringify({ event: 'mail.sent', kind: message.kind, to: maskEmail(to) }));
    return { status: 'sent', preview: cfg.demo ? preview : undefined };
  } catch (err) {
    log.error(JSON.stringify({ event: 'mail.error', kind: message.kind, name: err?.name }));
    return { status: 'failed' };
  }
}

// En demo todo lleva la marca [DEMO]: asunto y cuerpo (los datos de la demo son ficticios).
function demoMark(msg) {
  const banner = '[DEMO] Mensaje de demostración con datos ficticios. No es una comunicación real.';
  return {
    ...msg,
    subject: msg.subject.startsWith('[DEMO]') ? msg.subject : `[DEMO] ${msg.subject}`,
    text: `${banner}\n\n${msg.text}`,
    // el banner va dentro del primer <div> de la plantilla (el marco de `templates.js`)
    html: msg.html.replace(/(<div[^>]*>)/, `$1<p style="margin:0 0 16px;padding:8px 10px;border:1px solid #0b0b0b;font-size:13px">${banner}</p>`),
  };
}
