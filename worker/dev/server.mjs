// Servidor local del Worker SIN wrangler: node worker/dev/server.mjs  (puerto 8787)
// Usa el mismo código de worker/src con una D1 simulada sobre node:sqlite (archivo worker/.data/dev.sqlite).
// Lee variables de worker/.dev.vars (formato CLAVE=valor; NO se sube al repositorio).
// Extras SOLO de desarrollo:  GET /__scheduled?now=<ISO>  ejecuta la cron.   Cabecera x-test-ip simula una IP.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../src/index.js';
import { runReminders } from '../src/scheduled.js';
import { createD1 } from './d1-shim.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PORT = Number(process.env.PORT || 8787);

function loadVars(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
  return out;
}

mkdirSync(resolve(root, '.data'), { recursive: true });
const DB = createD1(process.env.DEV_DB || resolve(root, '.data/dev.sqlite'));
await DB.exec(readFileSync(resolve(root, 'schema.sql'), 'utf8'));
const env = { DEMO_MODE: 'true', ...loadVars(resolve(root, '.dev.vars')), DB };
if (!env.APP_SECRET) console.warn('⚠ Falta APP_SECRET en worker/.dev.vars (las altas devolverán 503).');

createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const headers = new Headers(req.headers);
  headers.set('CF-Connecting-IP', String(req.headers['x-test-ip'] || req.socket.remoteAddress || 'local'));
  try {
    if (url.pathname === '/__scheduled') {
      const out = await runReminders(env, url.searchParams.get('now') ? new Date(url.searchParams.get('now')) : new Date());
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(out));
    }
    const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const response = await worker.fetch(request, env, { waitUntil() {} });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('{"ok":false}');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Worker local en http://127.0.0.1:${PORT}  (demo: ${env.DEMO_MODE})`));
