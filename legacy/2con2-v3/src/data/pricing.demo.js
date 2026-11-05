// SOLO PARA PRUEBAS. Valores inventados que únicamente se cargan con `vite --mode test`
// y en los tests automáticos. No se incluyen en el build de producción.
export const DEMO_SHOW_ESTIMATE = true;

const demo = (min, max) => ({ basico: { min, max }, medio: { min: min + 100, max: max + 100 }, alto: { min: min + 200, max: max + 200 } });

export const DEMO_PRICING = {
  cocina: demo(1000, 1200),
  bano: demo(900, 1100),
  integral: demo(500, 700),
  otro: { basico: { min: null, max: null }, medio: { min: null, max: null }, alto: { min: null, max: null } },
};
