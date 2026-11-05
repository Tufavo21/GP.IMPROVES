import { useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useViewport, reducedMotion } from '../lib/hooks.js';
import { range, easeOut } from '../lib/spring.js';
import { BUSINESS, FALTA, SHOW_PLACEHOLDERS } from '../content/business.js';
import { DEMO_ENABLED, STATS, TEAM_ROLES } from '../content/demo-content.js';
import { SectionHead, Falta } from '../components/ui.jsx';

// M22 — conteo disparado por la posición de scroll: 0 cuando el elemento asoma por abajo
// (top:bottom) y valor final cuando su centro llega al centro del viewport (center:center).
function Counter({ value, label, lang }) {
  const ref = useRef(null);
  const num = useRef(null);
  const last = useRef(-1);
  const fmt = (n) => n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB');
  useViewport(ref, ({ rect, vh }) => {
    const start = vh; const end = vh / 2 - rect.height / 2;
    const p = easeOut(range(rect.top, start, end));
    const v = Math.round(value * p);
    if (v !== last.current && num.current) { last.current = v; num.current.textContent = fmt(v); }
  }, !reducedMotion);
  return (
    <li className="stat" ref={ref}>
      <span className="stat__n display" aria-hidden="true" ref={num}>{fmt(value)}</span>
      <span className="sr-only">{fmt(value)} </span>
      <span className="stat__l">{label}</span>
    </li>
  );
}

export default function Studio({ index, total }) {
  const { t, pick, lang } = useI18n();
  return (
    <section id="estudio" className="section studio" data-logo="light" aria-labelledby="estudio-t">
      <SectionHead index={index} total={total} title={t('studio.title')} lede={t('studio.lede')} id="estudio-t" />
      <div className="grid studio__body">
        <div className="studio__text">
          {t('studio.body').map((p) => <p key={p.slice(0, 16)}>{p}</p>)}
        </div>
        <ul className="studio__team" aria-label={t('studio.team')}>
          {BUSINESS.founders.map((name) => (
            <li className="person" key={name}>
              <div className="person__ph" aria-hidden="true">{SHOW_PLACEHOLDERS ? <Falta>{FALTA.photo}</Falta> : null}</div>
              <p className="person__name">{name}</p>
              {DEMO_ENABLED ? <p className="person__role label">{pick(TEAM_ROLES[name])}</p> : null}
            </li>
          ))}
        </ul>
      </div>
      {DEMO_ENABLED ? (
        <ul className="grid stats" aria-label={t('stats.aria')}>
          {STATS.map((s) => <Counter key={s.value} value={s.value} label={pick(s.label)} lang={lang} />)}
        </ul>
      ) : null}
    </section>
  );
}
