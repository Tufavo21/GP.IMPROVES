import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { useLang, ui } from '../i18n.js';
import { Logo, IconSparkle, IconMenu, IconClose, ease } from './primitives.jsx';

export function Banner() {
  const { lang } = useLang();
  const t = ui[lang].banner;
  return (
    <div className="banner" role="note" aria-label={t.label}>
      <p className="banner__pill">
        <IconSparkle aria-hidden="true" />
        <span>{t.text}</span>
      </p>
    </div>
  );
}

export function Nav() {
  const { lang, setLang } = useLang();
  const t = ui[lang];
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => setCompact(v > 48));

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="nav-wrap">
      <nav className={`nav${compact ? ' is-compact' : ''}`} aria-label={t.nav.label}>
        <a href="#top" aria-label={t.nav.home} onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <div className="nav__links">
          {t.nav.links.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </div>
        <div className="nav__right">
          <div className="langs" role="group" aria-label={t.lang.label}>
            <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')} lang="es" aria-label={t.lang.esName}>{t.lang.es}</button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en" aria-label={t.lang.enName}>{t.lang.en}</button>
          </div>
          <a className="btn btn--primary btn--sm" href="#contacto">{t.nav.cta}</a>
          <button
            type="button"
            className="btn btn--ghost btn--sm nav__menu"
            aria-expanded={open}
            aria-controls="mobile-panel"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose className="icon" /> : <IconMenu className="icon" />}
            <span>{open ? t.nav.closeMenu : t.nav.menu}</span>
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-panel"
              className="mobile-panel is-open"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              {t.nav.links.map(([id, label]) => (
                <a key={id} className="link" href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
              ))}
              <a className="btn btn--primary" href="#contacto" onClick={() => setOpen(false)}>{t.nav.cta}</a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
