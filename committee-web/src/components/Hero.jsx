import { useLayoutEffect, useRef } from 'react';
import LightCanvas from './LightCanvas.jsx';
import { useTick, reducedMotion, scrollToId } from '../lib/hooks.js';
import { clamp, range } from '../lib/spring.js';
import { useTr } from '../lib/store.js';

const ROWS = ['COM', 'MIT', 'TEE'];
const MAX_SCALE = 30;

// Firma: la palabra COMMITTEE es una ventana a la sala. Con el scroll, la «I» crece hasta
// llenar la pantalla y la sala queda a la vista. La palabra se escala con font-size (no con
// transform) para que el borde de la letra siga nítido a cualquier tamaño.
export default function Hero() {
  const tr = useTr();
  const wrap = useRef(null);
  const mask = useRef(null);
  const word = useRef(null);
  const intro = useRef(null);
  const after = useRef(null);
  const active = useRef(true);
  const m = useRef(null);

  const measure = () => {
    const el = word.current;
    if (!el) return;
    const vw = document.documentElement.clientWidth; const vh = window.innerHeight;
    el.style.fontSize = '100px'; el.style.left = '0px'; el.style.top = '0px';
    const r = el.getBoundingClientRect();
    const fit = Math.min((vw * 0.94) / r.width, (vh * 0.7) / r.height);
    const base = 100 * fit;
    const i = el.querySelector('[data-i]').getBoundingClientRect();
    m.current = {
      base, w: r.width * fit, h: r.height * fit,
      ix: (i.left + i.width / 2 - r.left) * fit, iy: (i.top + i.height / 2 - r.top) * fit,
      vw, vh,
    };
  };

  const place = (p) => {
    const el = word.current; const d = m.current;
    if (!el || !d) return;
    const e = p * p * p;
    const s = 1 + e * (MAX_SCALE - 1);
    // Posición de reposo: palabra centrada. Destino: la «I» en el centro de la pantalla.
    const restX = (d.vw - d.w) / 2 + d.ix; const restY = (d.vh - d.h) / 2 + d.iy;
    const k = clamp(p * 1.6);
    const ax = restX + (d.vw / 2 - restX) * k; const ay = restY + (d.vh / 2 - restY) * k;
    el.style.fontSize = `${(d.base * s).toFixed(2)}px`;
    el.style.left = `${(ax - d.ix * s).toFixed(2)}px`;
    el.style.top = `${(ay - d.iy * s).toFixed(2)}px`;
    mask.current.style.opacity = (1 - range(p, 0.62, 0.9)).toFixed(3);
    mask.current.style.visibility = p >= 0.9 ? 'hidden' : 'visible';
    if (reducedMotion) return;
    if (intro.current) intro.current.style.opacity = (1 - range(p, 0.02, 0.2)).toFixed(3);
    if (after.current) {
      const a = range(p, 0.78, 0.96);
      after.current.style.opacity = a.toFixed(3);
      after.current.style.transform = `translate3d(0,${((1 - a) * 28).toFixed(1)}px,0)`;
      after.current.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
    }
  };

  useLayoutEffect(() => {
    measure();
    place(0);
    document.fonts?.ready.then(() => { measure(); place(0); });
  }, []);

  useTick((t) => {
    const el = wrap.current;
    if (!el) return;
    if (t.resized) measure();
    if (!t.scrolled && !t.resized) return;
    const r = el.getBoundingClientRect();
    active.current = r.bottom > 0 && r.top < t.vh;
    if (reducedMotion) return;
    place(clamp(-r.top / (r.height - t.vh)));
  }, 'read');

  return (
    <section className={`hero${reducedMotion ? ' hero--static' : ''}`} ref={wrap} id="top" data-tone="dark" aria-labelledby="hero-title">
      <div className="hero__stage">
        <LightCanvas activeRef={active} />
        <div className="hero__mask" ref={mask} aria-hidden="true">
          <div className="hero__word" ref={word}>
            {ROWS.map((row) => (
              <span className="hero__row" key={row}>
                {Array.from(row).map((ch, i) => <span key={`${row}${i}`} data-i={ch === 'I' ? '' : undefined}>{ch}</span>)}
              </span>
            ))}
          </div>
        </div>
        <h1 className="sr-only" id="hero-title">Committee Club Valencia</h1>
        <div className="hero__intro" ref={intro}>
          <p>València</p>
          <p>{tr('Jueves · Viernes · Sábado', 'Thursday · Friday · Saturday')}</p>
          <p className="hero__hint">{tr('Baja para entrar', 'Scroll to step inside')}</p>
        </div>
        <div className="hero__after" ref={after}>
          <p className="hero__claim">{tr('La noche de València cabe en una palabra.', 'Valencia’s night fits in one word.')}</p>
          <div className="hero__cta">
            <a className="btn btn--acc" href="#entradas" onClick={(e) => { e.preventDefault(); scrollToId('entradas'); }}><span>{tr('Comprar entradas', 'Buy tickets')}</span></a>
            <a className="btn" href="#reservados" onClick={(e) => { e.preventDefault(); scrollToId('reservados'); }}><span>{tr('Reservar mesa', 'Book a table')}</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
