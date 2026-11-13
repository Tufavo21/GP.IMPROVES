// Utilidades criptográficas (Web Crypto, disponible en Workers y en Node 22).
const enc = new TextEncoder();

const b64u = (buf) => {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
export async function hmacB64u(secret, message) {
  return b64u(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(message)));
}
export async function hmacHex(secret, message) {
  return hex(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(message)));
}

export function timingSafeEqual(a, b) {
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

// Token de baja sin estado: `<id>.<hmac(id)>`. No hace falta guardarlo; no se puede falsificar sin APP_SECRET.
export async function makeUnsubToken(secret, id) {
  return `${id}.${(await hmacB64u(secret, `unsub:${id}`)).slice(0, 24)}`;
}
export async function readUnsubToken(secret, token) {
  const t = String(token || '');
  const i = t.lastIndexOf('.');
  if (i < 1) return null;
  const id = t.slice(0, i);
  const expected = await makeUnsubToken(secret, id);
  return timingSafeEqual(expected, t) ? id : null;
}

// La IP nunca se guarda en claro: solo este hash con clave.
export async function ipKey(secret, ip) {
  return (await hmacB64u(secret, `ip:${ip}`)).slice(0, 32);
}
