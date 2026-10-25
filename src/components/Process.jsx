import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLang, ui, pick } from '../i18n.js';
import { process as steps } from '../data/clinic.js';
import { Logo, MaskLines } from './primitives.jsx';

const pad = (n) => String(n + 1).padStart(2, '0');

/* Animación de firma "dusk": el degradado Hero Horizon se desplaza de ámbar a cobalto con el scroll
   mientras un panel de cristal sticky revela los 4 pasos con texto enmascarado (clip + translate por línea). */
export function Process() {
  const reduce = useReducedMotion();
  return reduce ? <ProcessStatic /> : <ProcessSticky />;
}

function Heading({ t }) {
  return (
    <>
      <span className="eyebrow" style={{ color: '#fff' }}>{t.eyebrow}</span>
      <h2 id="proceso-h" className="h2">{t.title}</h2>
    </>
  );
}

function ProcessSticky() {
  const { lang } = useLang();
  const t = ui[lang].process;
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const gx = useTransform(scrollYProgress, [0, 1], ['0%', '-66.6667%']);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.max(0, Math.min(steps.length - 1, Math.floor(v * steps.length)));
    setActive((prev) => (prev === i ? prev : i));
  });

  const s = steps[active];
  const stepVariants = { hidden: {}, show: {}, exit: {} };

  return (
    <section className="process" id="proceso" ref={ref} aria-labelledby="proceso-h">
      <div className="process__sticky">
        <div className="process__stage">
          <motion.div className="process__gradient" style={{ x: gx }} aria-hidden="true" />
          <div className="process__panel glass">
            <div className="process__side">
              <div className="process__seal"><Logo tone="gradient" /></div>
              <Heading t={t} />
              <ol className="steps-nav" aria-hidden="true">
                {steps.map((st, i) => (
                  <li key={st.id} className={i === active ? 'is-active' : ''}>
                    <span>{pad(i)}</span>{pick(st.title, lang)}
                  </li>
                ))}
              </ol>
            </div>

            <div className="process__main" aria-hidden="true">
              <AnimatePresence mode="wait">
                <motion.div key={`${s.id}-${lang}`} variants={stepVariants} initial="hidden" animate="show" exit="exit">
                  <span className="step__num">{t.step} {pad(active)} {t.of} {pad(steps.length - 1)}</span>
                  <MaskLines inherit as="h3" lines={[pick(s.title, lang)]} className="step__title" />
                  <p className="step__kicker">
                    <MaskLines inherit lines={[pick(s.kicker, lang)]} />
                  </p>
                  <div className="step__lines">
                    <MaskLines inherit lines={s.lines[lang]} delay={0.15} stagger={0.12} />
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="progress" role="presentation"><motion.i style={{ scaleX: bar }} /></div>
            </div>

            {/* Versión accesible: los 4 pasos completos para lector de pantalla */}
            <ol className="sr-only" aria-label={t.progress}>
              {steps.map((st) => (
                <li key={st.id}>
                  <strong>{pick(st.title, lang)}</strong>. {pick(st.kicker, lang)}. {st.lines[lang].join(' ')}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* prefers-reduced-motion: mismos contenidos, sin sticky ni desplazamiento */
function ProcessStatic() {
  const { lang } = useLang();
  const t = ui[lang].process;
  return (
    <section className="process process--static section" id="proceso" aria-labelledby="proceso-h" style={{ paddingBlock: 0 }}>
      <div style={{ padding: '0 var(--gutter)' }}>
        <div className="process__stage">
          <div className="process__gradient" aria-hidden="true" />
          <div className="wrap" style={{ position: 'relative' }}>
            <div className="process__seal"><Logo tone="gradient" /></div>
            <Heading t={t} />
            <ol className="static-steps">
              {steps.map((st, i) => (
                <li key={st.id} className="glass card">
                  <span className="step__num">{t.step} {pad(i)} {t.of} {pad(steps.length - 1)}</span>
                  <h3>{pick(st.title, lang)}</h3>
                  <p><strong style={{ fontWeight: 500 }}>{pick(st.kicker, lang)}</strong></p>
                  {st.lines[lang].map((l) => <p key={l}>{l}</p>)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
