// Señal «ready»: la home está a la vista (la carga de entrada terminó, se saltó o no hizo falta).
// Las entradas (M15 del hero, Reveal) esperan a esta señal para no animarse detrás de la cortina.
const listeners = new Set();
export const readyState = { done: false, at: 0 };

export function markReady() {
  if (readyState.done) return;
  readyState.done = true;
  readyState.at = typeof performance !== 'undefined' ? performance.now() : 0;
  if (typeof document !== 'undefined') document.documentElement.dataset.ready = '1';
  listeners.forEach((fn) => { try { fn(); } catch { /* un oyente roto no bloquea a los demás */ } });
  listeners.clear();
}

export function onReady(fn) {
  if (readyState.done) { fn(); return () => {}; }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Red de seguridad: pase lo que pase con la carga, a los 3,5 s la home está lista.
if (typeof window !== 'undefined') setTimeout(markReady, 3500);
