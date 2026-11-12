import { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { useTick, useViewport, reducedMotion, scrollToId } from '../lib/hooks.js';
import { createSpring, clamp } from '../lib/spring.js';
import { langStore, nightStore, setLang, useStore, useTr } from '../lib/store.js';
import { NIGHTS, DAY, OPENS, CLOSES, CLUB, RULES, upcomingNights, nextOf, monthName, eur, tableFrom, zoneFrom } from '../lib/nights.js';
import { TABLES, ZONES } from '../content/data.js';

const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };

/* ───────── Cabecera: la marca toma el tono de la sección que tiene debajo ───────── */
export function Header() {
  const tr = useTr();
  const lang = useStore(langStore);
  const ref = useRef(null);
  const tones = useRef([]);
  useEffect(() => { tones.current = Array.from(document.querySelectorAll('[data-tone]')); }, []);
  useTick((t) => {
    if (!t.scrolled && t.frame % 20 !== 0) return;
    let tone = 'dark'; let solid = 'no';
    for (const el of tones.current) {
      const r = el.getBoundingClientRect();
      if (r.top <= 30 && r.bottom > 30) { tone = el.dataset.tone; solid = el.id === 'top' ? 'no' : 'yes'; }
    }
    if (!ref.current) return;
    if (ref.current.dataset.tone !== tone) ref.current.dataset.tone = tone;
    if (ref.current.dataset.solid !== solid) ref.current.dataset.solid = solid;
  }, 'read');
  return (
    <header className="nav" ref={ref} data-tone="dark">
      <a className="nav__brand" href="#top" onClick={go('top')} aria-label="Committee Club Valencia">COMMITTEE</a>
      <nav className="nav__links" aria-label={tr('Secciones', 'Sections')}>
        <a href="#semana" onClick={go('semana')}>{tr('Semana', 'Week')}</a>
        <a href="#entradas" onClick={go('entradas')}>{tr('Entradas', 'Tickets')}</a>
        <a href="#reservados" onClick={go('reservados')}>{tr('Mesas VIP', 'VIP tables')}</a>
        <a href="#lista" onClick={go('lista')}>{tr('Lista', 'List')}</a>
        <a href="#info" onClick={go('info')}>Info</a>
      </nav>
      <div className="nav__end">
        <div className="lang" role="group" aria-label={tr('Idioma', 'Language')}>
          <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button>
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
        </div>
        <a className="nav__cta" href="#entradas" onClick={go('entradas')}>{tr('Entradas', 'Tickets')}</a>
      </div>
    </header>
  );
}

/* ───────── Dos salas: palabras fantasma que se cruzan con el scroll (M18) ───────── */
export function Rooms() {
  const tr = useTr();
  const ref = useRef(null);
  const a = useRef(null); const b = useRef(null);
  useViewport(ref, ({ progress, inView, vw }) => {
    if (!inView || reducedMotion) return;
    const x = (progress - 0.5) * vw * 0.5;
    a.current.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    b.current.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
  });
  return (
    <section className="rooms" ref={ref} data-tone="dark" aria-labelledby="rooms-title">
      <div className="rooms__ghost" aria-hidden="true">
        <span ref={a}>FIRST FLOOR FIRST FLOOR</span>
        <span ref={b}>PETIT PETIT PETIT PETIT</span>
      </div>
      <div className="wrap rooms__grid">
        <Reveal as="h2" id="rooms-title" className="display" text={tr('Dos salas bajo un mismo techo.', 'Two rooms under one roof.')} />
        <div className="rooms__list">
          <article>
            <h3>First Floor</h3>
            <p className="rooms__music">{tr('Reguetón · Comercial', 'Reggaeton · Commercial')}</p>
            <p>{tr('La pista grande. Aquí están la cabina, la tarima a ras de pista y las mesas de Principal y Ghost.', 'The main floor. Home to the booth, the dance-floor platform and the Principal and Ghost tables.')}</p>
          </article>
          <article>
            <h3>Petit</h3>
            <p className="rooms__music">Hip-hop · R&amp;B</p>
            <p>{tr('La planta superior. Otra música, otro ritmo y sus propias mesas.', 'The upper floor. Different music, a different pace and tables of its own.')}</p>
          </article>
        </div>
        <p className="rooms__foot">{tr(
          'Tres noches por semana, de septiembre a mayo, en el 200 de San Vicente Mártir.',
          'Three nights a week, September to May, at 200 San Vicente Mártir.',
        )}</p>
      </div>
    </section>
  );
}

/* ───────── La semana: elegir noche cambia el color de toda la web (M12) ───────── */
export function Week() {
  const tr = useTr();
  const lang = useStore(langStore);
  const night = useStore(nightStore);
  const [shown, setShown] = useState(night);
  const nights = useMemo(() => upcomingNights(9), []);
  const pulse = useRef(createSpring(0, { tension: 210, friction: 21 }));
  const pending = useRef(null);
  const num = useRef(null); const rows = useRef(null);

  useEffect(() => {
    if (night === shown) return;
    if (reducedMotion) { setShown(night); return; }
    pending.current = night; pulse.current.set(1);
  }, [night]); // eslint-disable-line react-hooks/exhaustive-deps

  useTick((t) => {
    const sp = pulse.current;
    if (!sp.step(t.dt) && sp.settled && !pending.current) return;
    if (pending.current && sp.value > 0.9) { setShown(pending.current); pending.current = null; sp.set(0); }
    const v = clamp(sp.value, 0, 1.2);
    if (num.current) {
      num.current.style.transform = v < 0.002 ? '' : `scaleX(${(1 - v * 0.92).toFixed(3)})`;
      num.current.style.filter = v < 0.02 ? '' : `blur(${(v * 16).toFixed(1)}px)`;
    }
    if (rows.current) {
      Array.from(rows.current.children).forEach((el, i) => {
        el.style.transform = v < 0.002 ? '' : `translate3d(${(-v * 60).toFixed(1)}px,${(-v * (i + 1) * 46).toFixed(1)}px,0) scale(${(1 - v * 0.5).toFixed(3)})`;
        el.style.opacity = v < 0.002 ? '' : (1 - v).toFixed(3);
      });
    }
  });

  const n = nextOf(shown, nights);
  return (
    <section className="week" id="semana" data-tone="acc" aria-labelledby="week-title">
      <div className="wrap">
        <Reveal as="h2" id="week-title" className="display" text={tr('Tres noches. Elige la tuya.', 'Three nights. Pick yours.')} />
        <div className="week__grid">
          <div className="week__days" role="group" aria-label={tr('Noche', 'Night')}>
            {NIGHTS.map((k) => (
              <button type="button" key={k} className="week__day" aria-pressed={night === k} onClick={() => nightStore.set(k)}>
                <span>{DAY[k].short[lang]}</span>
              </button>
            ))}
          </div>
          <div className="week__detail" aria-live="polite">
            {n ? (
              <p className="week__date">
                <span className="week__num" ref={num}>{String(n.day).padStart(2, '0')}</span>
                <span className="week__month">{DAY[shown][lang]}<br />{tr('de', '')} {monthName(n.month, lang)}</span>
              </p>
            ) : <p className="week__date"><span className="week__month">{tr('Volvemos en septiembre', 'Back in September')}</span></p>}
            <dl className="week__rows" ref={rows}>
              <div><dt>{tr('Puertas', 'Doors')}</dt><dd>{OPENS[shown]} – {CLOSES}</dd></div>
              <div><dt>{tr('Edad mínima', 'Minimum age')}</dt><dd>+{RULES.minAge[shown]}</dd></div>
              <div><dt>{tr('Entrada', 'Entry')}</dt><dd>{tr('desde', 'from')} {eur(CLUB.entry.from, lang)} <small>{tr('con una consumición', 'one drink included')}</small></dd></div>
              <div><dt>{tr('Mesa VIP', 'VIP table')}</dt><dd>{tr('desde', 'from')} {eur(tableFrom(shown), lang)} <small>{tr('consumo mínimo', 'minimum spend')}</small></dd></div>
            </dl>
            <div className="week__cta">
              <a className="btn btn--ink" href="#entradas" onClick={go('entradas')}><span>{tr(`Entradas para el ${DAY[shown].es.toLowerCase()}`, `Tickets for ${DAY[shown].en}`)}</span></a>
              <a className="btn" href="#reservados" onClick={go('reservados')}><span>{tr('Reservar mesa', 'Book a table')}</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Zonas: carteles que se apilan y retroceden (M3) ───────── */
const ZONE_EN = {
  tarima: 'Right on the dance floor, with its own bar',
  principal: 'Behind the DJ booth',
  ghost: 'Private access and bottle show',
  petit: 'Upper floor · hip-hop and R&B',
};
const ZONE_TONE = { tarima: 'dark', principal: 'acc', ghost: 'dark', petit: 'acc' };
const VIEW = { first: [1000, 620], upper: [1000, 420] };

function MiniPlan({ zone }) {
  const [w, h] = VIEW[zone.floor];
  return (
    <svg className="mini" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <rect x="40" y="40" width={w - 80} height={h - 80} rx="6" />
      {TABLES.filter((t) => t.floor === zone.floor).map((t) => (
        <circle key={t.id} cx={t.x} cy={t.y} r="17" className={t.zone === zone.id ? 'on' : ''} />
      ))}
    </svg>
  );
}

export function Zones({ onPick }) {
  const tr = useTr();
  const lang = useStore(langStore);
  const night = useStore(nightStore);
  const refs = useRef([]);
  useTick((t) => {
    if (reducedMotion || (!t.scrolled && t.frame % 30 !== 0)) return;
    refs.current.forEach((el, i) => {
      const next = refs.current[i + 1];
      if (!el || !next) return;
      const cover = clamp(1 - next.getBoundingClientRect().top / t.vh);
      const inner = el.firstElementChild;
      inner.style.transform = cover < 0.001 ? '' : `scale(${(1 - cover * 0.1).toFixed(4)})`;
      inner.style.setProperty('--dim', (cover * 0.55).toFixed(3));
    });
  }, 'read');
  return (
    <section className="zones" id="zonas" aria-labelledby="zones-title">
      <h2 className="sr-only" id="zones-title">{tr('Zonas VIP', 'VIP zones')}</h2>
      {ZONES.map((z, i) => (
        <article className="zone" key={z.id} data-tone={ZONE_TONE[z.id]} ref={(el) => { refs.current[i] = el; }}>
          <div className="zone__in">
            <div className="zone__top">
              <p className="zone__floor">{z.floor === 'first' ? 'First Floor' : tr('Planta superior', 'Upper floor')}</p>
              <p className="zone__price">{tr('desde', 'from')} <b>{eur(zoneFrom(z.id, night), lang)}</b></p>
            </div>
            <h3 className="zone__name">{z.name}</h3>
            <div className="zone__bottom">
              <div>
                <p className="zone__desc">{lang === 'es' ? z.desc : ZONE_EN[z.id]}</p>
                <p className="zone__rule">{tr(
                  `Mesa para ${RULES.baseGuests}. El precio es consumo mínimo, con refrescos incluidos.`,
                  `Table for ${RULES.baseGuests}. The price is a minimum spend, mixers included.`,
                )}</p>
                <a className={`btn ${ZONE_TONE[z.id] === 'dark' ? 'btn--acc' : 'btn--ink'}`} href="#reservados" onClick={(e) => { e.preventDefault(); onPick(z); scrollToId('reservados'); }}>
                  <span>{tr(`Elegir mesa en ${z.name}`, `Pick a table in ${z.name}`)}</span>
                </a>
              </div>
              <figure className="zone__plan">
                <MiniPlan zone={z} />
                <figcaption>{tr('Plano ilustrativo', 'Illustrative plan')}</figcaption>
              </figure>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

/* ───────── Información práctica ───────── */
export function Info() {
  const tr = useTr();
  const lang = useStore(langStore);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Committee Club, Carrer de Sant Vicent Màrtir 200, València')}`;
  return (
    <section className="info" id="info" data-tone="acc" aria-labelledby="info-title">
      <div className="wrap">
        <Reveal as="h2" id="info-title" className="display" text={tr('Antes de venir.', 'Before you come.')} />
        <dl className="info__rows">
          <div><dt>{tr('Dónde', 'Where')}</dt><dd><a href={maps} target="_blank" rel="noreferrer">Carrer de Sant Vicent Màrtir, 200<br />46007 València</a></dd></div>
          <div><dt>{tr('Cuándo', 'When')}</dt><dd>{tr('Jueves desde las 00:30. Viernes y sábado desde medianoche. Hasta las 07:30.', 'Thursday from 00:30. Friday and Saturday from midnight. Until 07:30.')}</dd></div>
          <div><dt>{tr('Edad', 'Age')}</dt><dd>{tr('Jueves, mayores de 18. Viernes y sábado, mayores de 21.', 'Thursday, over 18. Friday and Saturday, over 21.')}</dd></div>
          <div><dt>{tr('Entrada', 'Entry')}</dt><dd>{CLUB.entry.tiers.map((p) => eur(p, lang)).join(' · ')}<br /><small>{tr('Según el tramo de venta. Incluye una consumición.', 'Depending on the release. One drink included.')}</small></dd></div>
          <div><dt>{tr('Vestimenta', 'Dress code')}</dt><dd>{tr('Casual elegante. Sin pantalón corto.', 'Smart casual. No shorts.')}</dd></div>
          <div><dt>{tr('Temporada', 'Season')}</dt><dd>{tr('De septiembre a mayo. Cerrado en verano.', 'September to May. Closed in summer.')}</dd></div>
          <div><dt>{tr('El grupo', 'The group')}</dt><dd>{CLUB.group}<br /><small>{CLUB.sisterVenues.join(' · ')}</small></dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ───────── Cierre: la palabra se ensancha al llegar (eje de anchura de la tipografía) ───────── */
export function Footer() {
  const tr = useTr();
  const ref = useRef(null); const word = useRef(null);
  useViewport(ref, ({ rect, vh, inView }) => {
    if (!inView || reducedMotion) return;
    const p = clamp((vh - rect.top) / Math.min(rect.height, vh));
    word.current.style.fontVariationSettings = `"wdth" ${(62 + p * 38).toFixed(1)}, "wght" 900`;
  });
  return (
    <footer className="foot" ref={ref} data-tone="dark">
      <div className="wrap">
        <p className="foot__word" ref={word} aria-hidden="true">COMMITTEE</p>
        <div className="foot__row">
          <p>Committee Club Valencia<br />Carrer de Sant Vicent Màrtir, 200 · 46007 València</p>
          <nav aria-label={tr('Pie', 'Footer')}>
            <a href="#entradas" onClick={go('entradas')}>{tr('Entradas', 'Tickets')}</a>
            <a href="#reservados" onClick={go('reservados')}>{tr('Mesas VIP', 'VIP tables')}</a>
            <a href="#lista" onClick={go('lista')}>{tr('Lista', 'List')}</a>
            <a href="#top" onClick={go('top')}>{tr('Arriba', 'Top')}</a>
          </nav>
        </div>
        <p className="foot__note">{tr(
          'Maqueta de propuesta de GP.IMPROVES. No es la web oficial de Committee ni de Grupo Salamandra. Precios y condiciones tomados de fuentes públicas en noviembre de 2026; pueden haber cambiado.',
          'Proposal mock-up by GP.IMPROVES. Not the official website of Committee or Grupo Salamandra. Prices and conditions taken from public sources in November 2026; they may have changed.',
        )}</p>
      </div>
    </footer>
  );
}

/* ───────── Cursor de doble anillo (M14), solo con ratón ───────── */
export function Cursor() {
  const dot = useRef(null); const ring = useRef(null);
  const s = useRef({ x: -100, y: -100, rx: -100, ry: -100, k: createSpring(1, { tension: 260, friction: 24 }), on: false });
  const [fine] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion);
  useEffect(() => {
    if (!fine) return undefined;
    document.documentElement.classList.add('has-cursor');
    const move = (e) => {
      const st = s.current;
      st.x = e.clientX; st.y = e.clientY;
      if (!st.on) { st.on = true; st.rx = st.x; st.ry = st.y; }
      st.k.set(e.target.closest?.('a,button,[role="button"],label,select,summary') ? 2.1 : 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); document.documentElement.classList.remove('has-cursor'); };
  }, [fine]);
  useTick((t) => {
    const st = s.current;
    if (!st.on) return;
    st.rx += (st.x - st.rx) * 0.16; st.ry += (st.y - st.ry) * 0.16; st.k.step(t.dt);
    dot.current.style.transform = `translate3d(${st.x}px,${st.y}px,0)`;
    ring.current.style.transform = `translate3d(${st.rx.toFixed(1)}px,${st.ry.toFixed(1)}px,0) scale(${st.k.value.toFixed(3)})`;
  }, 'write', fine);
  if (!fine) return null;
  return (<><div className="cur cur--dot" ref={dot} aria-hidden="true" /><div className="cur cur--ring" ref={ring} aria-hidden="true" /></>);
}
