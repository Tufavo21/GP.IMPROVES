// Respuestas HTTP comunes.
const BASE = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex',
};
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...BASE, 'Content-Type': 'application/json; charset=utf-8', ...extra } });
export const html = (body, status = 200) =>
  new Response(body, {
    status,
    headers: { ...BASE, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'" },
  });
