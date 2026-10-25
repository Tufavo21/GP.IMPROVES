import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLang, ui } from '../i18n.js';
import { MaskLines, IconCheck, IconArrow } from './primitives.jsx';

export function Hero() {
  const { lang } = useLang();
  const t = ui[lang].hero;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Capas con velocidades distintas: degradado lento, marco de imagen más rápido hacia abajo.
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-title" id="top">
      <motion.div className="hero__bg" style={reduce ? undefined : { y: bgY }} aria-hidden="true" />
      <div className="hero__inner">
        <motion.div className="hero__text" style={reduce ? undefined : { y: textY }}>
          <span className="hero__eyebrow">{t.eyebrow}</span>
          <h1 id="hero-title" className="display" key={lang} aria-label={t.title}>
            <MaskLines as="span" lines={splitTitle(t.title)} delay={0.1} />
          </h1>
          <p className="hero__lead">{t.lead}</p>
          <ul className="bullets">
            {t.bullets.map((b) => (
              <li key={b}>
                <span className="icon-box"><IconCheck /></span>
                {b}
              </li>
            ))}
          </ul>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#contacto">{t.cta} <IconArrow className="icon" /></a>
            <a className="btn btn--ghost" href="#tratamientos">{t.secondary}</a>
          </div>
        </motion.div>
        <motion.div className="hero__frame" style={reduce ? undefined : { y: frameY }}>
          <div className="frame">
            <img src="/img/hero.webp" width="1400" height="933" alt={t.imageAlt} fetchPriority="high" decoding="async" style={{ objectPosition: '50% 70%' }} />
            <span className="hero__caption">{t.caption}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function splitTitle(s) {
  // "Estética médica, sin prisa." → ["Estética médica,", "sin prisa."]
  const i = s.indexOf(', ');
  return i > -1 ? [s.slice(0, i + 1), s.slice(i + 2)] : [s];
}
