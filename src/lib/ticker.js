// Ticker único: un solo requestAnimationFrame para todo lo que se mueve en la web.
// Fases: 'read' (medir el DOM) y luego 'write' (escribir estilos), para no forzar reflows.
// Tiers por dispositivo: mobile / tablet / desktop.
// Hook de verificación: window.__cfTicker.step(n) avanza n fotogramas a mano (los navegadores
// automatizados frenan el rAF) y .stats() devuelve los ms medios por fotograma.

const subs = { read: new Set(), write: new Set() };
const state = {
  time: 0, dt: 16.67, frame: 0,
  scrollY: 0, vw: 0, vh: 0, tier: 'desktop',
  scrolled: true, resized: true, // cambiaron desde el fotograma anterior
};
let lenis = null;
let rafId = 0;
let lastFrameAt = 0;
let lastScroll = -1;
let lastW = 0; let lastH = 0;
const costs = [];

export const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function computeTier() {
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (w < 768 || (coarse && w < 900)) return 'mobile';
  if (w < 1100 || coarse) return 'tablet';
  return 'desktop';
}

function run(now, dt) {
  const t0 = performance.now();
  state.dt = Math.min(64, Math.max(0, dt));
  state.time = now;
  state.frame += 1;
  if (lenis) lenis.raf(now);
  const w = window.innerWidth; const h = window.innerHeight;
  state.resized = w !== lastW || h !== lastH;
  if (state.resized) { lastW = w; lastH = h; state.vw = w; state.vh = h; state.tier = computeTier(); }
  state.scrollY = window.scrollY;
  state.scrolled = state.scrollY !== lastScroll || state.resized;
  lastScroll = state.scrollY;
  for (const fn of subs.read) fn(state);
  for (const fn of subs.write) fn(state);
  costs.push(performance.now() - t0);
  if (costs.length > 120) costs.shift();
}

function loop(now) {
  const dt = lastFrameAt ? now - lastFrameAt : 16.67;
  lastFrameAt = now;
  run(now, dt);
  rafId = requestAnimationFrame(loop);
}

export function startTicker() {
  if (rafId || typeof window === 'undefined') return;
  state.vw = window.innerWidth; state.vh = window.innerHeight; state.tier = computeTier();
  rafId = requestAnimationFrame(loop);
  // Vigilante: si el rAF se congela (pestaña en segundo plano, navegador automatizado), avanza a mano
  // para que ninguna animación deje contenido a medias.
  setInterval(() => {
    const now = performance.now();
    if (now - lastFrameAt > 400) { run(now, 64); lastFrameAt = now; }
  }, 250);
  window.addEventListener('resize', () => { state.resized = true; }, { passive: true });
}

export function addTick(fn, phase = 'write') {
  subs[phase].add(fn);
  return () => subs[phase].delete(fn);
}

export function setLenis(instance) { lenis = instance; }
export function getLenis() { return lenis; }
export const tickerState = state;

// Avance manual (verificación): n fotogramas de dt ms.
export function step(n = 1, dt = 16.67) {
  for (let i = 0; i < n; i += 1) { lastFrameAt += dt; run(lastFrameAt, dt); }
  return { frame: state.frame, scrollY: state.scrollY };
}

if (typeof window !== 'undefined') {
  window.__cfTicker = {
    step,
    stats: () => {
      const avg = costs.reduce((s, c) => s + c, 0) / (costs.length || 1);
      return { msPerFrame: +avg.toFixed(3), maxMs: +Math.max(0, ...costs).toFixed(3), subscribers: subs.read.size + subs.write.size, tier: state.tier, reducedMotion };
    },
    state,
  };
}
