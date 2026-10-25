import { useCallback, useEffect, useMemo, useState } from 'react';
import { LangContext, ui, buildJsonLd } from './i18n.js';
import { Banner, Nav } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { Value, DuskStrip, Treatments, Team, Facilities, Testimonials, Faq } from './components/Sections.jsx';
import { Process } from './components/Process.jsx';
import { Location, Contact, Footer } from './components/Contact.jsx';

const STORE = 'marjal-lang';

function initialLang() {
  try {
    const s = localStorage.getItem(STORE);
    if (s === 'es' || s === 'en') return s;
  } catch { /* almacenamiento no disponible */ }
  return 'es';
}

function setMeta(sel, attr, value) {
  const el = document.head.querySelector(sel);
  if (el) el.setAttribute(attr, value);
}

export default function App() {
  const [lang, setLangState] = useState(initialLang);
  const [pre, setPre] = useState(null);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(STORE, l); } catch { /* ignorar */ }
  }, []);

  // <html lang>, <title>, meta y JSON-LD siguen al idioma
  useEffect(() => {
    const t = ui[lang].meta;
    document.documentElement.lang = lang;
    document.title = t.title;
    setMeta('meta[name="description"]', 'content', t.description);
    setMeta('meta[property="og:title"]', 'content', t.title);
    setMeta('meta[property="og:description"]', 'content', t.description);
    setMeta('meta[property="og:locale"]', 'content', t.ogLocale);
    setMeta('meta[name="twitter:title"]', 'content', t.title);
    setMeta('meta[name="twitter:description"]', 'content', t.description);
    const ld = document.getElementById('jsonld');
    if (ld) ld.textContent = JSON.stringify(buildJsonLd(lang));
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  const pickTreatment = (id) => {
    setPre({ id, n: Date.now() });
    document.getElementById('contacto')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <LangContext.Provider value={value}>
      <a className="skip" href="#main">{ui[lang].skip}</a>
      <Nav />
      <div className="top">
        <Banner />
        <main id="main">
          <Hero />
          <Value />
          <DuskStrip />
          <Treatments onPick={pickTreatment} />
          <Process />
          <Team />
          <Facilities />
          <Testimonials />
          <Faq />
          <Location />
          <Contact preselect={pre} />
        </main>
        <Footer />
      </div>
    </LangContext.Provider>
  );
}
