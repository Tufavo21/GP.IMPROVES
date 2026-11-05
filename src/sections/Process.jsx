import { useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { createSpring, SPRINGS, clamp } from '../lib/spring.js';
import { CLIENT_PHOTOS } from '../content/business.js';
import { PROCESS } from '../content/demo-content.js';
import Picture from '../components/Picture.jsx';
import { SectionHead } from '../components/ui.jsx';

// M17 — sección fijada por rangos de scroll. Cada paso ocupa un tramo [i/n, (i+1)/n] del progreso
// normalizado. El texto queda fijo y cambia de paso; la imagen de fondo sigue evolucionando
// (escala continua dentro de cada tramo) y un rail de guiones se rellena por pasos.
// Sin JS o con prefers-reduced-motion: lista normal de pasos con su imagen (sin fijar).
const n = PROCESS.length;
const splitImg = (img) => {
  const m = img.match(/^(.*?)(-plano)?$/);
  return { id: m[1], variant: m[2] ? 'plano' : '' };
};

export default function Process({ index, total }) {
  const { t, pick } = useI18n();
  const root = useRef(null);
  const steps = useRef([]);
  const imgs = useRef([]);
  const dashes = useRef([]);
  const st = useRef({ p: 0, springs: [], active: -1 });
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    setPinned(true);
    st.current.springs = PROCESS.map((_, i) => createSpring(i === 0 ? 1 : 0, SPRINGS.soft));
  }, []);

  useViewport(root, ({ rect, vh }) => {
    const pin = root.current?.querySelector('.process__pin');
    const scrollable = rect.height - (pin?.offsetHeight || vh);
    st.current.p = scrollable > 0 ? clamp(-rect.top / scrollable) : 0;
  }, !reducedMotion);

  useTick((s) => {
    if (!pinned) return;
    const { p, springs } = st.current;
    const pos = p * n;
    const idx = Math.min(n - 1, Math.floor(pos));
    if (idx !== st.current.active) { st.current.active = idx; setActive(idx); }
    springs.forEach((sp, i) => {
      sp.set(i === idx ? 1 : 0);
      sp.step(s.dt);
      const v = sp.value;
      const local = clamp(pos - i); // progreso dentro del tramo del paso i
      const stepEl = steps.current[i];
      if (stepEl) {
        stepEl.style.opacity = v.toFixed(3);
        stepEl.style.transform = `translate3d(0,${((1 - v) * (i < idx ? -28 : 28)).toFixed(2)}px,0)`;
      }
      const im = imgs.current[i];
      if (im) {
        im.style.opacity = v.toFixed(3);
        im.style.transform = `scale(${(1.1 - 0.1 * local).toFixed(4)})`;
      }
      const d = dashes.current[i];
      if (d) d.style.transform = `scaleX(${local.toFixed(3)})`;
    });
  }, 'write', !reducedMotion);

  return (
    <section id="proceso" ref={root} className={`section process ${pinned ? 'is-pinned' : ''}`} data-logo="light" aria-labelledby="proceso-t"
      style={pinned ? { height: `${(n * 85 + 100)}vh` } : undefined}>
      <div className="process__pin">
        <SectionHead index={index} total={total} title={t('process.title')} lede={t('process.lede')} id="proceso-t" />
        <div className="grid process__body">
          <div className="process__rail" aria-hidden="true">
            {PROCESS.map((_, i) => (
              <span className="process__dash" key={i}><span ref={(el) => { dashes.current[i] = el; }} /></span>
            ))}
          </div>
          <ol className="process__steps">
            {PROCESS.map((s, i) => {
              const [title, text] = pick(s);
              return (
                <li key={title} className={`pstep ${i === active ? 'is-active' : ''}`} ref={(el) => { steps.current[i] = el; }}>
                  <p className="label pstep__n">{t('process.step')} {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</p>
                  <h3 className="pstep__title display">{title}</h3>
                  <p className="pstep__text">{text}</p>
                  <div className="pstep__media-static">
                    {(() => { const { id, variant } = splitImg(s.img); return <Picture id={id} variant={variant} alt={variant ? '' : pick(CLIENT_PHOTOS[id])} sizes="100vw" />; })()}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="process__stage" data-logo="plate" aria-hidden="true">
            {PROCESS.map((s, i) => {
              const { id, variant } = splitImg(s.img);
              return (
                <div className="process__img" key={s.img} ref={(el) => { imgs.current[i] = el; }}>
                  <Picture id={id} variant={variant} alt="" sizes="(max-width: 767px) 100vw, 55vw" />
                </div>
              );
            })}
            <p className="process__note label">{t('process.imgNote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
