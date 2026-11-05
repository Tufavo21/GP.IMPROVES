import test from 'node:test';
import assert from 'node:assert/strict';
import { computeEstimate } from '../src/lib/estimate.js';
import { PRICING, SHOW_ESTIMATE } from '../src/data/pricing.js';
import { DEMO_PRICING } from '../src/data/pricing.demo.js';

const d = { tipo: 'cocina', acabados: 'medio', m2Vivienda: 80, estancias: [{ modo: 'm2', m2: 10 }] };

test('el baremo de producción está vacío y desactivado', () => {
  assert.equal(SHOW_ESTIMATE, false);
  for (const row of Object.values(PRICING)) for (const c of Object.values(row)) assert.deepEqual(c, { min: null, max: null });
  assert.equal(computeEstimate(d, PRICING, SHOW_ESTIMATE), null);
});

test('con baremo vacío no hay cifra aunque el flag esté activo', () => {
  assert.equal(computeEstimate(d, PRICING, true), null);
});

test('con valores DEMO y flag activo calcula la horquilla', () => {
  assert.deepEqual(computeEstimate(d, DEMO_PRICING, true), { min: 11000, max: 13000, m2: 10 });
});

test('reforma integral usa los m² de la vivienda; "otro" sin baremo no calcula', () => {
  assert.deepEqual(computeEstimate({ ...d, tipo: 'integral' }, DEMO_PRICING, true), { min: 48000, max: 64000, m2: 80 });
  assert.equal(computeEstimate({ ...d, tipo: 'otro' }, DEMO_PRICING, true), null);
});
