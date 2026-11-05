import test from 'node:test';
import assert from 'node:assert/strict';
import { processRequest } from '../api/solicitud.js';
import { DEMO_PRICING } from '../src/data/pricing.demo.js';

// JPEG mínimo sintético (solo cabecera): lo justo para pasar la comprobación de tipo por bytes.
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 1)]).toString('base64');
const base = () => ({
  lang: 'es', website: '', tipo: 'cocina', tipoOtro: '', vivienda: 'piso', viviendaOtro: '', m2Vivienda: 80,
  estancias: [{ nombre: 'cocina', modo: 'm2', m2: 10 }], acabados: 'medio', plazo: '3m',
  mensaje: 'Quiero reformar la cocina entera', nombre: 'Prueba', email: 'prueba@example.com', telefono: '600000000', rgpd: true,
  fotos: [{ name: 'a.jpg', type: 'image/jpeg', size: 204, data: jpeg }],
});
const env = { RESEND_API_KEY: 'test', CONTACT_TO_EMAIL: 'destino@example.com' };
const okFetch = (calls) => async (url, init) => { calls.push({ url, init }); return { ok: true }; };

test('solicitud válida: envía un email con adjunto y sin guardar nada', async () => {
  const calls = [];
  const r = await processRequest({ body: base(), env, fetchFn: okFetch(calls), store: new Map() });
  assert.equal(r.status, 200);
  assert.equal(calls.length, 1);
  const sent = JSON.parse(calls[0].init.body);
  assert.deepEqual(sent.to, ['destino@example.com']);
  assert.equal(sent.attachments.length, 1);
  assert.match(sent.text, /Baremo: sin calcular/);
});

test('con baremo DEMO activo el email incluye la horquilla', async () => {
  const calls = [];
  await processRequest({ body: base(), env: { ...env, __PRICING: DEMO_PRICING, __SHOW: true }, fetchFn: okFetch(calls), store: new Map() });
  assert.match(JSON.parse(calls[0].init.body).text, /11000 € – 13000 €/);
});

test('honeypot: responde 200 pero no envía', async () => {
  const calls = [];
  const r = await processRequest({ body: { ...base(), website: 'spam' }, env, fetchFn: okFetch(calls), store: new Map() });
  assert.equal(r.status, 200); assert.equal(calls.length, 0);
});

test('rechaza texto corto, sin fotos y sin RGPD', async () => {
  const a = await processRequest({ body: { ...base(), mensaje: 'corto' }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(a.status, 400); assert.equal(a.json.errors.mensaje, 'minLen');
  const b = await processRequest({ body: { ...base(), fotos: [] }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(b.json.errors.fotos, 'required');
  const c = await processRequest({ body: { ...base(), rgpd: false }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(c.json.errors.rgpd, 'required');
});

test('rechaza ficheros que no son imagen aunque declaren image/jpeg', async () => {
  const fake = Buffer.from('<?php echo 1; ?> esto no es una imagen').toString('base64');
  const r = await processRequest({ body: { ...base(), fotos: [{ name: 'a.jpg', type: 'image/jpeg', size: 40, data: fake }] }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(r.status, 400); assert.equal(r.json.errors.fotos, 'type');
});

test('rechaza fotos demasiado pesadas y más de 8', async () => {
  const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(1.6 * 1024 * 1024, 1)]).toString('base64');
  const r = await processRequest({ body: { ...base(), fotos: [{ name: 'a.jpg', type: 'image/jpeg', size: 1, data: big }] }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(r.status, 400);
  const nine = Array.from({ length: 9 }, () => base().fotos[0]);
  const r2 = await processRequest({ body: { ...base(), fotos: nine }, env, fetchFn: okFetch([]), store: new Map() });
  assert.equal(r2.json.errors.fotos, 'count');
});

test('límite de frecuencia: la sexta petición de la misma IP devuelve 429', async () => {
  const store = new Map(); let last;
  for (let i = 0; i < 6; i += 1) last = await processRequest({ body: base(), ip: '1.2.3.4', env, fetchFn: okFetch([]), store });
  assert.equal(last.status, 429);
});

test('sin variables de entorno devuelve error de configuración, no datos', async () => {
  const r = await processRequest({ body: base(), env: {}, fetchFn: okFetch([]), store: new Map() });
  assert.equal(r.status, 500); assert.equal(r.json.error, 'config');
});
