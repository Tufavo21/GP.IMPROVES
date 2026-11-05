import { motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { Btn, EASE, Magnetic } from './ui.jsx';

// Palabra que sube desde una ventana recortada al cargar.
function Word({ children, delay }) {
  const reduce = useReducedMotion();
  return (
    <span className="mask" aria-hidden="true">
      <motion.span initial={reduce ? false : { y: '112%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay }}>{children}</motion.span>
    </span>
  );
}

export default function Hero() {
  const { t, dict } = useI18n();
  const reduce = useReducedMotion();
  const [a, b, c, d] = dict.hero.lines;
  const fade = (delay) => ({ initial: reduce ? false : { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay } });
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <h1 className="d-xl" aria-label={t('hero.h1')}>
          <span className="hl">
            <Word delay={0.1}>{a}</Word>
            <Word delay={0.2}>{b}</Word>
          </span>
          <span className="hl">
            <Word delay={0.3}>{c}</Word>
            <Word delay={0.4}>{d}</Word>
          </span>
        </h1>
        <div className="hero-foot">
          <motion.p className="lead" {...fade(1.1)}>{t('hero.lead')}</motion.p>
          <motion.div className="actions" {...fade(1.25)}>
            <Magnetic><Btn href="#presupuesto">{t('hero.cta')}</Btn></Magnetic>
            <Magnetic><Btn variant="white" href="#proyectos">{t('hero.ctaProjects')}</Btn></Magnetic>
          </motion.div>
          <motion.a className="scroll-cue" href="#estudio" {...fade(1.5)}>
            <i aria-hidden="true" />{t('hero.scroll')}
          </motion.a>
        </div>
      </div>
    </section>
  );
}
