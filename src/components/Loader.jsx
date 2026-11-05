import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, reducedMotion, getLenis } from '../lib/hooks.js';
import { createSpring, range, easeOut, clamp } from '../lib/spring.js';
import { markReady } from '../lib/ready.js';
import { PIECES, piecePath } from '../lib/pieces.js';
import { LOGO } from '../content/images.js';

// M7 + M20 — Carga de entrada «de obra». Mecánica de construcción por piezas (contorno → volumen →
// ensamblaje), con formas propias y monocromas. Seis piezas de obra se dibujan en línea de 1 px, se
// rellenan con falso volumen (capas apiladas con offset, sin sombras), y la losa y los dos listones se
// encajan en el marco del logo mientras el resto se recoge dentro; aparece el logo y una cortina
// (translateY 0 → -100 %) revela la home y emite «ready».
//  · Una vez por sesión (sessionStorage con try/catch). Botón «Saltar» y Escape.
//  · No bloquea: el contenido ya está renderizado debajo; si el JS falla, una animación CSS retira la
//    capa a los 3,2 s y ready.js marca la home como lista a los 3,5 s.
//  · prefers-reduced-motion: no hay carga (la home aparece tal cual).
const KEY = '2con2-intro';
const T = { draw: [0, 650], fill: [520, 1050], join: 1050, logo: [1720, 2000], fade: [1900, 2080], curtain: [2050, 2600] };
const SKIP_CURTAIN = 380;

// Verificación: ?introT=1300 congela la carga en ese instante (ms) para capturar el fotograma.
const HOLD = (() => { try { const v = new URLSearchParams(window.location.search).get('introT'); return v == null ? null : Number(v); } catch { return null; } })();

function seen() {
  if (HOLD != null) return false;
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}
function remember() {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* sin almacenamiento: se verá en cada carga */ }
}

export default function Loader() {
  const { t } = useI18n();
  const [show] = useState(() => !reducedMotion && typeof window !== 'undefined' && !seen());
  const [gone, setGone] = useState(false);
  const root = useRef(null);
  const nodes = useRef([]);
  const logo = useRef(null);
  const st = useRef({ start: 0, skipAt: 0, springs: PIECES.map(() => createSpring(0, { tension: 150, friction: 17 })), done: false });

  useEffect(() => {
    if (!show) { markReady(); return undefined; }
    remember();
    st.current.start = performance.now();
    window.__cfIntro = { shown: true, start: st.current.start, frames: 0 }; // verificación
    // Lenis se crea en el efecto de App (después de este): se detiene en el siguiente fotograma
    const raf = requestAnimationFrame(() => { if (!st.current.done) getLenis()?.stop(); });
    const safety = setTimeout(() => getLenis()?.start(), 3200);
    const onKey = (e) => { if (e.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); window.removeEventListener('keydown', onKey); getLenis()?.start(); };
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    const s = st.current;
    if (s.done) return;
    s.done = true;
    if (window.__cfIntro) { window.__cfIntro.end = performance.now() - s.start; window.__cfIntro.skipped = !!s.skipAt; }
    getLenis()?.start();
    setGone(true);
  };
  const skip = () => {
    const s = st.current;
    if (!s.skipAt) { s.skipAt = performance.now(); markReady(); }
  };

  useTick((ts) => {
    const s = st.current;
    if (!show || s.done || !root.current) return;
    const el = HOLD != null ? HOLD : ts.time - s.start;
    if (window.__cfIntro) window.__cfIntro.frames += 1;
    // Cortina (también tras «Saltar», más corta)
    let cur = range(el, T.curtain[0], T.curtain[1]);
    if (s.skipAt) cur = Math.max(cur, range(ts.time - s.skipAt, 0, SKIP_CURTAIN));
    if (cur > 0) markReady();
    const ease = cur < 0.5 ? 4 * cur ** 3 : 1 - (-2 * cur + 2) ** 3 / 2;
    root.current.style.transform = cur > 0 ? `translate3d(0,${(-100 * ease).toFixed(2)}%,0)` : '';
    if (cur >= 1) { finish(); return; }

    const draw = easeOut(range(el, T.draw[0], T.draw[1]));
    const fill = easeOut(range(el, T.fill[0], T.fill[1]));
    const logoA = range(el, T.logo[0], T.logo[1]);
    const fade = range(el, T.fade[0], T.fade[1]);
    if (logo.current) logo.current.style.opacity = logoA.toFixed(3);

    PIECES.forEach((p, i) => {
      const n = nodes.current[i];
      if (!n) return;
      const sp = s.springs[i];
      if (el >= T.join + i * 55) sp.set(1);
      sp.step(ts.dt);
      const k = sp.value; // 0 = disperso, 1 = encajado (con un pequeño rebote)
      const kc = clamp(k);
      const x = p.from.x + (p.to.x - p.from.x) * k;
      const y = p.from.y + (p.to.y - p.from.y) * k;
      const r = p.from.r * (1 - k);
      const sx = 1 + (p.to.sx - 1) * kc;
      const sy = 1 + (p.to.sy - 1) * kc;
      n.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`);
      // Volumen: las capas se separan al rellenarse y se aplanan al encajar en el marco
      const d = 9 * fill * (1 - kc * (p.frame ? 1 : 0.6));
      n.back.setAttribute('transform', `translate(${(d / sx).toFixed(2)} ${(d / sy).toFixed(2)})`);
      n.mid.setAttribute('transform', `translate(${(d / 2 / sx).toFixed(2)} ${(d / 2 / sy).toFixed(2)})`);
      n.back.style.opacity = n.mid.style.opacity = fill.toFixed(3);
      n.front.style.strokeDashoffset = (1 - draw).toFixed(4);
      n.front.style.fillOpacity = fill.toFixed(3);
      const out = p.frame ? fade : Math.max(range(kc, 0.7, 1) * 0.65, logoA);
      n.g.style.opacity = (1 - out).toFixed(3);
    });
  }, 'write', show);

  if (!show || gone) return null;
  const lw = 360; const lh = Math.round((360 * LOGO.height) / LOGO.width);
  return (
    <div className="loader" ref={root} role="status" aria-live="polite" aria-label={t('loader.label')}>
      <svg className="loader__svg" viewBox="-420 -300 1200 931" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {PIECES.map((p, i) => {
          const d = piecePath(p.shape, p.w, p.h);
          return (
            <g key={p.id} ref={(g) => {
              if (!g) return;
              nodes.current[i] = { g, back: g.children[0], mid: g.children[1], front: g.children[2] };
            }} transform={`translate(${p.from.x} ${p.from.y}) rotate(${p.from.r})`}>
              <path d={d} fillRule="evenodd" fill="#0B0B0B" style={{ opacity: 0 }} />
              <path d={d} fillRule="evenodd" fill="#3A3A38" style={{ opacity: 0 }} />
              <path d={d} fillRule="evenodd" fill={p.fill} stroke="#0B0B0B" strokeWidth="1" vectorEffect="non-scaling-stroke"
                pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1, fillOpacity: 0 }} />
            </g>
          );
        })}
        <image ref={logo} href="/img-cliente/logo/logo-2con2estudio-negro-360.png" x="0" y="0" width={lw} height={lh} style={{ opacity: 0 }} />
      </svg>
      <button type="button" className="loader__skip" onClick={skip}>{t('loader.skip')}</button>
    </div>
  );
}
