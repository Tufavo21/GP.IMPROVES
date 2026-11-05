import { useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { DEMO_PHOTOS } from '../content/demo-content.js';
import Picture from './Picture.jsx';

// Antes / durante / después del MISMO encuadre, en horizontal 3:2 y sin recorte (las tres fotos tienen
// exactamente el mismo tamaño en píxeles). La imagen queda limpia: los controles van DEBAJO, fuera de ella:
//   ←   02 / 03 · DURANTE   →   + una línea de proceso en 3 tramos que se rellena.
// Avanza sola cada 3,2 s mientras está a la vista (el tramo activo se rellena con el tiempo) y se para
// en cuanto alguien usa una flecha. Teclado: flechas ← → con el foco en la barra.
// Cambio de fase por barrido de izquierda a derecha (clip-path). prefers-reduced-motion: fundido y sin
// avance automático.
const ORDER = ['antes', 'durante', 'despues'];
const AUTO_MS = 3200;

export default function Phases({ id, sizes }) {
  const { t, pick } = useI18n();
  const box = useRef(null);
  const fills = useRef([]);
  const [cur, setCur] = useState(0);
  const st = useRef({ inView: false, touched: false, last: 0, cur: 0 });
  st.current.cur = cur;

  useViewport(box, ({ inView }) => { st.current.inView = inView; }, !reducedMotion);
  useTick((ts) => {
    const s = st.current;
    if (!s.last) s.last = ts.time;
    const auto = s.inView && !s.touched;
    if (!auto) s.last = ts.time;
    const k = auto ? Math.min(1, (ts.time - s.last) / AUTO_MS) : 1;
    // línea de proceso: tramos anteriores llenos, el activo según el tiempo, los siguientes vacíos
    fills.current.forEach((f, i) => {
      if (!f) return;
      const v = (i < s.cur ? 1 : i > s.cur ? 0 : k).toFixed(3);
      if (f.dataset.v !== v) { f.dataset.v = v; f.style.setProperty('--v', v); }
    });
    if (auto && k >= 1) { s.last = ts.time; setCur((c) => (c + 1) % ORDER.length); }
  }, 'write', !reducedMotion);

  const go = (i) => { st.current.touched = true; setCur(Math.max(0, Math.min(ORDER.length - 1, i))); };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
  };
  const alt = (f) => pick(DEMO_PHOTOS[f === 'durante' ? id : `${id}-${f}`]);
  const label = t(`projects.phase.${ORDER[cur]}`);

  return (
    <div className="phases" ref={box}>
      <div className="phases__media" data-logo="plate">
        {ORDER.map((f, i) => (
          <div key={f} className={`phases__layer ${i <= cur ? 'is-in' : ''}`} style={{ zIndex: i }} aria-hidden={i !== cur}>
            <Picture id={id} variant={f === 'durante' ? '' : f} alt={i === cur ? alt(f) : ''} sizes={sizes} className="phases__pic" />
          </div>
        ))}
      </div>
      <div className="phases__bar" role="group" aria-label={t('projects.phases')} onKeyDown={onKey}>
        <button type="button" className="phases__arrow" onClick={() => go(cur - 1)} disabled={cur === 0} aria-label={t('projects.prev')}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <p className="phases__now" aria-live="polite">
          <span className="phases__count label">{String(cur + 1).padStart(2, '0')} / {String(ORDER.length).padStart(2, '0')}</span>
          <span className="phases__name display" key={ORDER[cur]}>{label}</span>
        </p>
        <button type="button" className="phases__arrow" onClick={() => go(cur + 1)} disabled={cur === ORDER.length - 1} aria-label={t('projects.next')}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <ol className="phases__line" aria-hidden="true">
          {ORDER.map((f, i) => (
            <li key={f} className={`phases__seg ${i === cur ? 'is-cur' : ''}`}>
              <span className="phases__fill" ref={(el) => { fills.current[i] = el; }} style={{ '--v': i < cur || (reducedMotion && i === cur) ? 1 : 0 }} />
              <span className="phases__seg-l label">{t(`projects.phase.${f}`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
