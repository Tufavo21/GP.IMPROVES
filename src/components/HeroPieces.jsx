import { useEffect, useRef } from 'react';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { createSpring } from '../lib/spring.js';
import { piecePath2D, COLORS } from '../lib/pieces.js';

// M11 — Piezas ambientales detrás del lema. Mismo lenguaje que la carga de entrada (losa, listón,
// marco, arco, círculo) con falso volumen por capas desplazadas. Oscilan despacio y se apartan del
// cursor dentro de un radio fijo (muelles de la BASE en el ticker único). En táctil se mueven solas.
// Van por detrás del titular (z-index) con tinta suave, y nunca sobre el logo ni la foto.
// Fuera de pantalla no se dibuja. prefers-reduced-motion: un único fotograma estático.
const SET = [
  // Posiciones en los huecos que deja el titular (izquierda abajo, centro) y nunca bajo la entradilla
  { shape: 'frame', w: 80, h: 80, fill: COLORS.paper, x: 0.575, y: 0.2, r: 8, m: [0.86, 0.19] },
  { shape: 'arch', w: 70, h: 92, fill: COLORS.bone, x: 0.4, y: 0.66, r: -6 },
  { shape: 'rect', w: 150, h: 26, fill: COLORS.bone, x: 0.1, y: 0.7, r: -10, m: [0.14, 0.74] },
  { shape: 'circle', w: 60, h: 60, fill: COLORS.paper, x: 0.27, y: 0.9, r: 0, m: [0.17, 0.585] },
  { shape: 'rect', w: 20, h: 112, fill: COLORS.bone, x: 0.6, y: 0.48, r: 14 },
];
const RADIUS = 170; // px de repulsión
const PUSH = 80;

export default function HeroPieces() {
  const canvas = useRef(null);
  const st = useRef({ w: 0, h: 0, dpr: 1, inView: true, px: -9999, py: -9999, lastMove: 0, pieces: [], tier: 'desktop', drawn: false });

  const build = (tier) => {
    // Móvil: menos piezas, en los márgenes (posiciones `m`)
    const list = tier === 'mobile' ? SET.filter((p) => p.m) : SET;
    st.current.pieces = list.map((p, i) => ({
      ...p, ...(tier === 'mobile' ? { x: p.m[0], y: p.m[1] } : null), ph: i * 1.7,
      sx: createSpring(0, { tension: 120, friction: 14 }), sy: createSpring(0, { tension: 120, friction: 14 }),
    }));
  };

  const fit = () => {
    const c = canvas.current; const s = st.current;
    if (!c) return false;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (Math.round(r.width * dpr) === c.width && Math.round(r.height * dpr) === c.height) return false;
    s.w = r.width; s.h = r.height; s.dpr = dpr;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    return true;
  };

  const draw = (time) => {
    const c = canvas.current; const s = st.current;
    if (!c || !s.w) return;
    const ctx = c.getContext('2d');
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    ctx.clearRect(0, 0, s.w, s.h);
    const scale = s.tier === 'mobile' ? 0.62 : s.w < 1200 ? 0.85 : 1;
    for (const p of s.pieces) {
      const t = time / 1000;
      const ox = reducedMotion ? 0 : Math.sin(t * 0.42 + p.ph) * 10;
      const oy = reducedMotion ? 0 : Math.cos(t * 0.33 + p.ph * 1.3) * 8;
      const rot = ((p.r + (reducedMotion ? 0 : Math.sin(t * 0.25 + p.ph) * 4)) * Math.PI) / 180;
      ctx.save();
      ctx.translate(p.x * s.w + ox + p.sx.value, p.y * s.h + oy + p.sy.value);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      const path = piecePath2D(p.shape, p.w, p.h);
      // Falso volumen: tres capas apiladas con offset, sin sombras difusas
      ctx.fillStyle = 'rgba(11,11,11,0.16)'; ctx.translate(8, 8); ctx.fill(path, 'evenodd');
      ctx.fillStyle = 'rgba(58,58,56,0.14)'; ctx.translate(-4, -4); ctx.fill(path, 'evenodd');
      ctx.translate(-4, -4);
      ctx.fillStyle = p.fill; ctx.fill(path, 'evenodd');
      ctx.lineWidth = 1 / scale; ctx.strokeStyle = 'rgba(11,11,11,0.5)'; ctx.stroke(path);
      ctx.restore();
    }
  };

  useEffect(() => {
    const s = st.current;
    s.tier = window.innerWidth < 768 ? 'mobile' : 'desktop';
    build(s.tier);
    fit(); draw(0);
    if (reducedMotion) {
      const onR = () => { fit(); draw(0); };
      window.addEventListener('resize', onR);
      return () => window.removeEventListener('resize', onR);
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) return undefined;
    const onMove = (e) => {
      const r = canvas.current?.getBoundingClientRect();
      if (!r) return;
      s.px = e.clientX - r.left; s.py = e.clientY - r.top; s.lastMove = performance.now();
    };
    const onLeave = () => { s.px = -9999; s.py = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => { window.removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('pointerleave', onLeave); };
  }, []);

  useViewport(canvas, ({ inView }) => { st.current.inView = inView; }, !reducedMotion);

  useTick((ts) => {
    const s = st.current;
    if (!s.inView) return;
    if (ts.resized) {
      const tier = ts.tier === 'mobile' ? 'mobile' : 'desktop';
      if (tier !== s.tier) { s.tier = tier; build(tier); }
      fit();
    }
    const coarse = s.px < -999;
    for (const p of s.pieces) {
      let tx = 0; let ty = 0;
      if (!coarse) {
        const dx = p.x * s.w - s.px; const dy = p.y * s.h - s.py;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0.01) { const f = (1 - d / RADIUS) ** 2 * PUSH; tx = (dx / d) * f; ty = (dy / d) * f; }
      } else {
        // Táctil / sin cursor: deriva autónoma lenta
        const t = ts.time / 1000;
        tx = Math.sin(t * 0.18 + p.ph * 2) * 18; ty = Math.cos(t * 0.15 + p.ph) * 14;
      }
      p.sx.set(tx); p.sy.set(ty); p.sx.step(ts.dt); p.sy.step(ts.dt);
    }
    draw(ts.time);
  }, 'write', !reducedMotion);

  return <canvas ref={canvas} className="hero__pieces" aria-hidden="true" />;
}
