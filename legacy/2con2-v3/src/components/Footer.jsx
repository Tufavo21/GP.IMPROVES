import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { BUSINESS } from '../data/business.js';
import { asset } from '../lib/asset.js';
import Ph from './Ph.jsx';
import { EASE } from './ui.jsx';

// El nombre del estudio a tamaño monumental: cada letra sube al llegar al final de la página.
function Giant({ text }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="giant" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span className="mask" key={i}>
          <motion.span
            initial={reduce ? false : { y: '115%' }} animate={reduce || inView ? { y: 0 } : { y: '115%' }}
            transition={{ duration: 1.1, ease: EASE, delay: i * 0.045 }}
          >{ch}</motion.span>
        </span>
      ))}
    </div>
  );
}

export default function Footer() {
  const { t, lang, dict } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <footer className="footer on-dark" id="privacidad-pie">
      <div className="wrap">
        <div className="footer-top">
          <img className="flogo" src={asset('logo-2con2estudio-blanco.png')} width="480" height="442" alt={t('a11y.logoAlt')} loading="lazy" style={{ width: 76, height: 'auto' }} />
          <p className="slogan">{BUSINESS.slogan[lang]}</p>
          <div className="footer-links">
            <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer">{BUSINESS.instagram.handle}</a>
            <a href={`tel:${BUSINESS.phone.tel}`}>{BUSINESS.phone.intl}</a>
            <button type="button" aria-expanded={open} aria-controls="privacidad" onClick={() => setOpen((o) => !o)}>{t('footer.privacy')}</button>
            <a href="#top">{t('footer.top')}</a>
          </div>
          <div id="privacidad" className="privacy" data-open={open}>
            <h2 className="h40">{dict.privacy.title}</h2>
            <dl>
              {dict.privacy.items.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v.replace('{email}', BUSINESS.email)}</dd></div>
              ))}
            </dl>
            <div style={{ marginTop: 16 }}><Ph k="privacy" /></div>
          </div>
          <p className="cap footer-meta">{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
      <Giant text="2CON2ESTUDIO" />
    </footer>
  );
}
