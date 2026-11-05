// Tests del baremo y de la validación del formulario. Uso: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimate, PRICING, SHOW_ESTIMATE } from '../src/content/pricing.js';
import { validate, photoProblem } from '../src/lib/validate.js';

test('el baremo publicado está vacío y desactivado', () => {
  assert.equal(SHOW_ESTIMATE, false);
  for (const type of Object.values(PRICING)) for (const cell of Object.values(type)) {
    assert.equal(cell.min, null); assert.equal(cell.max, null);
  }
  assert.equal(estimate('cocina', 'medio', 20), null);
});

test('con un baremo rellenado y activado devuelve un rango redondeado', () => {
  const table = { cocina: { medio: { min: 500, max: 800 } } };
  assert.deepEqual(estimate('cocina', 'medio', 12.3, table, true), { min: 6200, max: 9800 });
  assert.equal(estimate('cocina', 'alto', 12, table, true), null);
  assert.equal(estimate('cocina', 'medio', 0, table, true), null);
});

test('todo obligatorio salvo las fotos; descripción mínimo 10 caracteres', () => {
  const e = validate({});
  assert.deepEqual(Object.keys(e), ['nombre', 'email', 'telefono', 'tipo', 'acabados', 'm2', 'descripcion', 'privacidad']);
  const bad = validate({ nombre: 'A', email: 'x@y', telefono: '123', tipo: 'cocina', acabados: 'medio', m2: '0', descripcion: 'corto', privacidad: false });
  assert.deepEqual(bad, { nombre: 'name', email: 'email', telefono: 'phone', m2: 'm2', descripcion: 'minLen', privacidad: 'privacy' });
  const ok = validate({ nombre: 'Ana Prueba', email: 'ana@ejemplo.test', telefono: '+34 600 000 000', tipo: 'bano', acabados: 'alto', m2: '8', descripcion: 'Cambiar bañera por plato de ducha', privacidad: true });
  assert.deepEqual(ok, {});
});

test('fotos: tipo y peso', () => {
  assert.equal(photoProblem({ name: 'a.txt', type: 'text/plain', size: 10 }), 'fileType');
  assert.equal(photoProblem({ name: 'a.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 }), 'fileSize');
  assert.equal(photoProblem({ name: 'a.heic', type: '', size: 1000 }), null);
});
