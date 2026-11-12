import { addTick, startTicker, reducedMotion } from './ticker.js';
import { createSpring } from './spring.js';
import { ACCENTS } from './nights.js';
import { nightStore } from './store.js';

// El acento de la web es el de la noche elegida. Cambia por muelles (interrumpible) y se
// publica como variable CSS y como valor para el shader.
export const accent = { rgb: [...ACCENTS.thu] };
const springs = accent.rgb.map((v) => createSpring(v, { tension: 70, friction: 18, precision: 0.05 }));

function publish() {
  const [r, g, b] = accent.rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))));
  document.documentElement.style.setProperty('--acc', `rgb(${r} ${g} ${b})`);
}

export function startAccent() {
  startTicker();
  publish();
  const apply = () => {
    const target = ACCENTS[nightStore.get()];
    springs.forEach((s, i) => { if (reducedMotion) s.jump(target[i]); else s.set(target[i]); });
    if (reducedMotion) { accent.rgb = [...target]; publish(); }
  };
  const unsub = nightStore.sub(apply);
  const untick = addTick((t) => {
    let moving = false;
    springs.forEach((s, i) => { if (s.step(t.dt)) moving = true; accent.rgb[i] = s.value; });
    if (moving) publish();
  });
  return () => { unsub(); untick(); };
}
