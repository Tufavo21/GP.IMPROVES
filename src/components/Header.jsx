import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, scrollToId, reducedMotion } from '../lib/hooks.js';
import { getLenis } from '../lib/ticker.js';
import { BUSINESS } from '../content/business.js';
import { LOGO } from '../content/images.js';
import { Button, Icon } from './ui.jsx';

// Logo adaptable: se mira qué hay bajo el centro del logo (atributo data-logo de la sección o foto):
//  light → logo negro sin fondo · dark → logo blanco sin fondo · plate → placa papel + logo negro
// (fotos heterogéneas, donde ninguna de las dos versiones se lee bien por sí sola).
function useLogoMode(logoRef, headerRef, openRef) {
  const current = useRef('light');
  useTick((s) => {
    if (!s.scrolled && s.frame % 20 !== 0) return;
    const logo = logoRef.current; const header = headerRef.current;
    if (!logo || !header) return;
    const r = logo.getBoundingClientRect();
    const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.top + 2]];
    let next = 'light';
    const found = pts.map(([x, y]) => {
      const stack = document.elementsFromPoint(x, y);
      for (const el of stack) {
        if (header.contains(el)) continue;
        const z = el.closest('[data-logo]');
        if (z) return z.dataset.logo;
      }
      return 'light';
    });
    if (found.includes('plate')) next = 'plate';
    else if (found.every((f) => f === 'dark')) next = 'dark';
    else if (found.some((f) => f === 'dark')) next = 'plate'; // borde entre secciones: placa
    // Se escribe directamente en el DOM (sin re-render de React) para que cambie en el mismo fotograma.
    if (next !== current.current) { current.current = next; if (!openRef.current) header.dataset.mode = next; }
  }, 'read');
  return current;
}

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;
  const mode = useLogoMode(logoRef, headerRef, openRef);
  const links = t('nav.links');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('menu-open');
    getLenis()?.stop();
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('menu-open'); getLenis()?.start(); };
  }, [open]);

  const go = (id) => (e) => { e.preventDefault(); setOpen(false); scrollToId(id); };
  const shownMode = open ? 'dark' : mode.current;

  const LangSwitch = (
    <div className="lang" role="group" aria-label={t('nav.lang')}>
      {['es', 'en'].map((l) => (
        <button key={l} type="button" className="lang__b" aria-pressed={lang === l} onClick={() => setLang(l)}>
          <span aria-hidden="true">{l.toUpperCase()}</span>
          <span className="sr-only">{l === 'es' ? 'Español' : 'English'}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header ref={headerRef} className="nav" data-mode={shownMode}>
      <div className="nav__bar">
        <a href="#top" className="nav__logo" ref={logoRef} onClick={go('top')} aria-label={t('nav.home')}>
          <img className="nav__logo-img nav__logo-img--negro" src="/img-cliente/logo/logo-2con2estudio-negro-360.png" width={LOGO.width} height={LOGO.height} alt="" />
          <img className="nav__logo-img nav__logo-img--blanco" src="/img-cliente/logo/logo-2con2estudio-blanco-360.png" width={LOGO.width} height={LOGO.height} alt="" />
        </a>
        <nav className="nav__links" aria-label="Principal">
          {links.map(([id, label]) => (<a key={id} href={`#${id}`} onClick={go(id)} className="nav__link">{label}</a>))}
        </nav>
        <div className="nav__tools">
          {LangSwitch}
          <Button href="#presupuesto" variant="line" className="nav__cta">{t('nav.cta')}</Button>
          <button type="button" className="nav__burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            {open ? <Icon.close /> : <Icon.menu />}
            <span className="sr-only">{open ? t('nav.close') : t('nav.menu')}</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <m.div
            id="menu" className="menu" data-logo="dark"
            initial={reducedMotion ? false : { clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ type: 'spring', stiffness: 170, damping: 26 }}
          >
            <nav aria-label="Menú" className="menu__links">
              {links.map(([id, label], i) => (
                <a key={id} href={`#${id}`} onClick={go(id)} className="menu__link display">
                  <span className="label menu__n">{String(i + 1).padStart(2, '0')}</span>{label}
                </a>
              ))}
            </nav>
            <div className="menu__foot">
              <a href={BUSINESS.phone.href}>{BUSINESS.phone.intl}</a>
              <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer">{BUSINESS.instagram.handle}</a>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
