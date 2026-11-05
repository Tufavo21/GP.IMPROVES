import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { addTick, reducedMotion, setLenis, getLenis, startTicker, tickerState } from './ticker.js';

// Suscribe una función al ticker único mientras el componente está montado.
export function useTick(fn, phase = 'write', enabled = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return undefined;
    startTicker();
    return addTick((s) => ref.current(s), phase);
  }, [phase, enabled]);
}

// Vigilante de viewport dentro del ticker (sin IntersectionObserver): mide en la fase 'read' solo
// cuando hay scroll o resize, y expone rect y progreso al componente.
// progress: 0 cuando el borde superior toca el borde inferior del viewport, 1 cuando sale por arriba.
export function useViewport(ref, onChange, enabled = true) {
  const cb = useRef(onChange);
  const fresh = useRef(4); // mide los primeros fotogramas tras montar aunque no haya scroll
  cb.current = onChange;
  useTick((s) => {
    const el = ref.current;
    if (!el) return;
    if (fresh.current > 0) fresh.current -= 1;
    else if (!s.scrolled && s.frame % 30 !== 0) return;
    const r = el.getBoundingClientRect();
    const inView = r.bottom > 0 && r.top < s.vh;
    const progress = (s.vh - r.top) / (s.vh + r.height);
    cb.current({ rect: r, inView, progress, vh: s.vh, vw: s.vw, tier: s.tier });
  }, 'read', enabled);
}

// Scroll suave con Lenis, conducido por el ticker. Se desactiva con prefers-reduced-motion.
export function useLenis() {
  useEffect(() => {
    if (reducedMotion) return undefined;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.12, smoothWheel: true });
    setLenis(lenis);
    startTicker();
    return () => { lenis.destroy(); setLenis(null); };
  }, []);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = -(document.querySelector('.nav')?.offsetHeight || 0) + 1;
  const lenis = getLenis();
  if (lenis) { lenis.start(); lenis.scrollTo(el, { offset, duration: 1.2, force: true }); }
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'auto' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

export { reducedMotion, tickerState };
