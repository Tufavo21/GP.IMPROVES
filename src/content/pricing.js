// Baremo de precios orientativo (€/m²) por tipo de reforma y nivel de acabados.
// [FALTA: baremo de precios] — VACÍO a propósito. No inventar cifras.
// Para activarlo: rellenar min/max de cada celda y poner SHOW_ESTIMATE = true. Entonces el formulario
// muestra un rango «aproximado y no vinculante» (m² × €/m²). Celdas en null no muestran nada.

export const SHOW_ESTIMATE = false;

export const FINISHES = ['estandar', 'medio', 'alto'];
export const TYPES = ['integral', 'cocina', 'bano', 'interiorismo', 'otra'];

export const PRICING = {
  integral: { estandar: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
  cocina: { estandar: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
  bano: { estandar: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
  interiorismo: { estandar: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
  otra: { estandar: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
};

// Devuelve { min, max } en euros redondeados a centenas, o null si no hay que mostrar nada.
export function estimate(type, finish, m2, table = PRICING, enabled = SHOW_ESTIMATE) {
  if (!enabled) return null;
  const cell = table?.[type]?.[finish];
  const area = Number(m2);
  if (!cell || cell.min == null || cell.max == null || !Number.isFinite(area) || area <= 0) return null;
  const r = (v) => Math.round(v / 100) * 100;
  return { min: r(cell.min * area), max: r(cell.max * area) };
}
