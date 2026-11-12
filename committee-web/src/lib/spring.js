// Solver de muelles a mano: integración semi-implícita de Euler en pasos de 1 ms.
// tension (rigidez), friction (amortiguación), mass = 1. Interrumpible: cambiar el destino a mitad
// de recorrido conserva la velocidad.
export function createSpring(initial = 0, { tension = 170, friction = 26, mass = 1, precision = 0.0005 } = {}) {
  const s = {
    value: initial, velocity: 0, target: initial, settled: true,
    set(target) { if (target !== s.target) { s.target = target; s.settled = false; } },
    jump(v) { s.value = v; s.target = v; s.velocity = 0; s.settled = true; },
    step(dtMs) {
      if (s.settled) return false;
      const steps = Math.min(64, Math.round(dtMs)) || 1;
      for (let i = 0; i < steps; i += 1) {
        const force = -tension * (s.value - s.target) - friction * s.velocity;
        s.velocity += (force / mass) * 0.001;
        s.value += s.velocity * 0.001;
      }
      if (Math.abs(s.velocity) < precision && Math.abs(s.value - s.target) < precision) {
        s.value = s.target; s.velocity = 0; s.settled = true;
      }
      return true;
    },
  };
  return s;
}

// Presets del proyecto
export const SPRINGS = {
  reveal: { tension: 120, friction: 20 }, // entrada de titulares
  soft: { tension: 90, friction: 22 }, // cambios de paso del proceso
  snappy: { tension: 260, friction: 30 }, // micro-interacciones
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (v, a, b) => clamp((v - a) / (b - a));
export const easeOut = (t) => 1 - (1 - t) ** 3;
