import { totalRoomArea } from '../../shared/schema.js';

// Superficie sobre la que se calcula: reforma integral → m² de la vivienda; resto → suma de las estancias.
export function estimateArea(d) {
  return d.tipo === 'integral' ? Number(d.m2Vivienda) || 0 : totalRoomArea(d.estancias);
}

// Devuelve { min, max, m2 } redondeado a la decena, o null si no hay baremo o está desactivado.
export function computeEstimate(d, pricing, show) {
  if (!show || !pricing) return null;
  const cell = pricing[d.tipo]?.[d.acabados];
  if (!cell || cell.min == null || cell.max == null) return null;
  const m2 = estimateArea(d);
  if (!(m2 > 0)) return null;
  const r = (n) => Math.round(n / 10) * 10;
  return { min: r(cell.min * m2), max: r(cell.max * m2), m2: Math.round(m2 * 10) / 10 };
}

// Carga el baremo activo. En producción es siempre pricing.js; los valores DEMO solo existen en modo test.
export async function loadPricing() {
  if (import.meta.env.MODE === 'test') {
    const m = await import('../data/pricing.demo.js');
    return { pricing: m.DEMO_PRICING, show: m.DEMO_SHOW_ESTIMATE };
  }
  const m = await import('../data/pricing.js');
  return { pricing: m.PRICING, show: m.SHOW_ESTIMATE };
}
