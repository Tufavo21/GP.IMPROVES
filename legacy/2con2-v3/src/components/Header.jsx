import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { asset } from '../lib/asset.js';
import { BUSINESS } from '../data/business.js';
import { Btn } from './ui.jsx';

const LINKS = [['studio', '#estudio'], ['services', '#reformas'], ['projects', '#proyectos'], ['process', '#proceso'], ['faq', '#preguntas'], ['contact', '#contacto']];

const parse = (c) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
};
const lum = ({ r, g, b }) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
const PUTTY = { r: 202, g: 199, b: 180, a: 1 };

// Elige logo blanco/negro según el fondo real bajo el logo (sin caja propia). Si ninguna versión alcanza
// AA (4.5:1) o hay una foto debajo, añade una placa del color base de la sección detrás del logo.
function useLogoTone(ref) {
  const [tone, setTone] = useState({ ink: 'black', plate: null });
  useEffect(() => {
    let raf = 0;
    // Muestrea cinco puntos del logo: si el fondo cambia dentro de él (p. ej. al cruzar una sección), usa placa.
    const probe = (x, y) => {
      const stack = document.elementsFromPoint(x, y).filter((n) => !n.closest('[data-logo-ui]'));
      let bg = null; let image = false;
      for (const n of stack) {
        if (n.tagName === 'IMG' || n.tagName === 'VIDEO') { image = true; continue; }
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.9) { bg = c; break; }
      }
      bg = bg || PUTTY;
      let base = PUTTY;
      for (const n of stack) {
        if (n.tagName !== 'SECTION' && n.tagName !== 'FOOTER') continue;
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.9) { base = c; break; }
      }
      const L = lum(bg);
      return { image, base, cb: contrast(L, 0), cw: contrast(L, 1) };
    };
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pts = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].map(([a, b]) => probe(r.left + r.width * a, r.top + r.height * b));
      const needsPlate = pts.some((p) => p.image || Math.max(p.cb, p.cw) < 4.5) || pts.some((p) => (p.cb >= p.cw) !== (pts[0].cb >= pts[0].cw));
      const c0 = pts[0];
      if (needsPlate) {
        const Lp = lum(c0.base);
        setTone({ ink: contrast(Lp, 0) >= contrast(Lp, 1) ? 'black' : 'white', plate: `rgb(${c0.base.r}, ${c0.base.g}, ${c0.base.b})` });
      } else {
        setTone({ ink: c0.cb >= c0.cw ? 'black' : 'white', plate: null });
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const id = setTimeout(measure, 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(id); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [ref]);
  return tone;
}

// La cabecera fija baja 36px al inicio (hueco de la barra amarilla) y se pega arriba al hacer scroll.
function useHeaderTop() {
  useEffect(() => {
    let raf = 0;
    const set = () => { raf = 0; document.documentElement.style.setProperty('--hdr-top', `${Math.max(0, 36 - window.scrollY)}px`); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(set); };
    set();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);
}

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const logoRef = useRef(null);
  const tone = useLogoTone(logoRef);
  useHeaderTop();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="bar">
        <span>{t('bar.text')}</span>
        <a href="#presupuesto">{t('bar.cta')}</a>
      </div>

      <header className="header" data-logo-ui>
        <a
          ref={logoRef}
          className="logo"
          href="#top"
          aria-label={t('a11y.home')}
          data-ink={tone.ink}
          data-plate={tone.plate ? '' : undefined}
          style={tone.plate ? { '--plate': tone.plate } : undefined}
        >
          <img className="logo-b" src={asset('logo-2con2estudio-negro.png')} width="480" height="442" alt="" />
          <img className="logo-w" src={asset('logo-2con2estudio-blanco.png')} width="480" height="442" alt="" />
        </a>

        <div className="hr">
          <a className="btn ig" href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={t('a11y.instagram')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" />
            </svg>
          </a>
          <div className="lang" role="group" aria-label={t('a11y.langGroup')}>
            <button type="button" lang="es" aria-pressed={lang === 'es'} aria-label={t('a11y.langEs')} onClick={() => setLang('es')}>ES</button>
            <button type="button" lang="en" aria-pressed={lang === 'en'} aria-label={t('a11y.langEn')} onClick={() => setLang('en')}>EN</button>
          </div>
          <Btn className="cta" href="#presupuesto">{t('nav.cta')}</Btn>
          <button type="button" className="btn burger" aria-expanded={open} aria-controls="menu" aria-label={open ? t('a11y.closeMenu') : t('a11y.menu')} onClick={() => setOpen((o) => !o)}>
            <i aria-hidden="true" /><span>{t('a11y.menuLabel')}</span>
          </button>
        </div>

        <nav id="menu" className="menu" data-open={open} aria-label={t('a11y.mainNav')}>
          {LINKS.map(([k, href], i) => <a key={k} href={href} style={{ '--i': i }} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{t(`nav.${k}`)}</a>)}
          <a className="menu-ig" href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>Instagram {BUSINESS.instagram.handle}</a>
          <Btn variant="white" href="#presupuesto" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{t('nav.cta')}</Btn>
        </nav>
      </header>

      <nav className="navlinks" aria-label={t('a11y.mainNav')} data-logo-ui>
        {LINKS.map(([k, href]) => <a key={k} href={href}>{t(`nav.${k}`)}</a>)}
      </nav>
    </>
  );
}
