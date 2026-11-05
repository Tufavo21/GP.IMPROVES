import { useMemo } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import Ph from './Ph.jsx';
import { Reveal, SplitText } from './ui.jsx';

const TONES = ['paper', 'carbon', 'putty', 'paper', 'carbon'];

// Cada paso es una tarjeta fijada arriba; la siguiente la cubre y la anterior se encoge y se oscurece.
function Card({ step, i, n, cardRef, nextRef }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: nextRef || cardRef, offset: ['start end', 'start 22%'] });
  const last = i === n - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, last || reduce ? 1 : 0.94]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, last || reduce ? 0 : 0.5]);
  return (
    <motion.article ref={cardRef} className="pcard" data-tone={TONES[i % TONES.length]} style={{ '--i': i, scale }}>
      <div className="tx">
        <h3>{step.title}</h3>
        <p className="body">{step.text}</p>
      </div>
      <span className="num" aria-hidden="true">{i + 1}</span>
      <motion.span className="shade" style={{ opacity: shade }} aria-hidden="true" />
    </motion.article>
  );
}

export default function Process() {
  const { t, dict } = useI18n();
  const steps = dict.process.steps;
  const refs = useMemo(() => steps.map(() => ({ current: null })), [steps.length]);
  return (
    <section className="process" id="proceso" aria-labelledby="proc-t">
      <div className="wrap">
        <div className="process-head">
          <SplitText as="h2" id="proc-t" className="d-lg" text={t('process.title')} />
          <Reveal><p className="lead">{t('process.intro')}</p></Reveal>
          <Reveal delay={0.06}><Ph k="process" /></Reveal>
        </div>
        <ol className="stack">
          {steps.map((s, i) => (
            <li key={s.title} style={{ display: 'contents' }}>
              <Card step={s} i={i} n={steps.length} cardRef={refs[i]} nextRef={refs[i + 1]} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
