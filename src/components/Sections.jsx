import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLang, ui, pick } from '../i18n.js';
import { treatments, team, facilities, testimonials, faqs } from '../data/clinic.js';
import { Reveal, ParallaxImg, IconCheck, IconPlus, IconArrow, ease } from './primitives.jsx';

/* ---------- Altura animada (acordeón): grid 0fr → 1fr, solo CSS ---------- */
function Collapse({ open, children, id, labelledBy, className }) {
  return (
    <div id={id} role="region" aria-labelledby={labelledBy} className={`collapse ${className}${open ? ' is-open' : ''}`}>
      <div className="collapse__inner">{children}</div>
    </div>
  );
}

/* ---------- Propuesta de valor ---------- */
export function Value() {
  const { lang } = useLang();
  const t = ui[lang].value;
  return (
    <section className="section" id="valor" aria-labelledby="valor-h">
      <div className="wrap value">
        <Reveal>
          <div className="frame frame--full value__img" style={{ borderRadius: '40px 40px 0 0' }}>
            <ParallaxImg src="/img/value.webp" w={1100} h={1650} alt={t.imageAlt} />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="valor-h" className="h2">{t.title}</h2>
            <p className="lead">{t.lead}</p>
          </Reveal>
          <ul className="value__list">
            {t.items.map(([h, p], i) => (
              <Reveal as="li" key={h} delay={0.05 * i} className="glass glass--hover card">
                <span className="icon-box"><IconCheck /></span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Franja Dusk Violet: el destello recorre la franja con el scroll ---------- */
export function DuskStrip() {
  const { lang } = useLang();
  const t = ui[lang].strip;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Capa 300% de ancho: la banda violeta (50% de la capa) cruza de izquierda a derecha.
  const x = useTransform(scrollYProgress, [0.05, 0.75], ['-16.6667%', '-83.3333%']);
  return (
    <section className="strip" ref={ref} aria-label={t.text}>
      <motion.div
        className="strip__wash"
        aria-hidden="true"
        style={reduce ? { x: '-50%' } : { x }}
      />
      <div className="wrap">
        <p className="strip__text">{t.text}</p>
        <p className="strip__sub">{t.sub}</p>
      </div>
    </section>
  );
}

/* ---------- Tratamientos: lista numerada 01–07 ---------- */
export function Treatments({ onPick }) {
  const { lang } = useLang();
  const t = ui[lang].treatments;
  const [open, setOpen] = useState(0);
  const uid = useId();
  return (
    <section className="section" id="tratamientos" aria-labelledby="trat-h">
      <div className="wrap two-col">
        <div className="sticky-head">
          <Reveal>
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="trat-h" className="h2">{t.title}</h2>
            <p className="lead">{t.lead}</p>
            <p className="note">{t.note}</p>
          </Reveal>
        </div>
        <ol className="rows">
          {treatments.map((tr, i) => {
            const isOpen = open === i;
            const name = pick(tr.name, lang);
            return (
              <li key={tr.id} className={`row${isOpen ? ' is-open' : ''}`}>
                <h3 style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="row__head"
                    id={`${uid}-h${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-p${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="row__name">{name}</span>
                    <span className="row__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  </button>
                </h3>
                <Collapse open={isOpen} id={`${uid}-p${i}`} labelledBy={`${uid}-h${i}`} className="row__panel">
                  <div className="row__body">
                    <p className="row__desc">{pick(tr.desc, lang)}</p>
                    <dl className="facts glass glass--hover">
                      <div><dt>{t.duration}</dt><dd>{pick(tr.duration, lang)}</dd></div>
                      <div><dt>{t.ideal}</dt><dd>{pick(tr.ideal, lang)}</dd></div>
                      <div><dt>{t.cost}</dt><dd>{pick(tr.from, lang)}</dd></div>
                    </dl>
                    <div className="row__cta">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => onPick(tr.id)}>
                        {t.cta} <IconArrow className="icon" />
                      </button>
                    </div>
                  </div>
                </Collapse>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Equipo ---------- */
export function Team() {
  const { lang } = useLang();
  const t = ui[lang].team;
  return (
    <section className="section" id="equipo" aria-labelledby="equipo-h">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="equipo-h" className="h2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
        </Reveal>
        <ul className="team">
          {team.map((m, i) => (
            <Reveal as="li" key={m.name} delay={0.06 * i} className="glass glass--hover card">
              <div className="mono" role="img" aria-label={`${t.monogram} ${m.name}`}>{m.initials}</div>
              <h3>{m.name}</h3>
              <p className="role">{pick(m.role, lang)}</p>
              <p className="bio">{pick(m.bio, lang)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Instalaciones ---------- */
export function Facilities() {
  const { lang } = useLang();
  const t = ui[lang].facilities;
  return (
    <section className="section" id="instalaciones" aria-labelledby="inst-h">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="inst-h" className="h2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
        </Reveal>
        <div className="fac">
          {facilities.map((f) => (
            <Reveal as="figure" key={f.img}>
              <div className="frame frame--full">
                <ParallaxImg src={f.img} w={f.w} h={f.h} alt={pick(f.alt, lang)} />
              </div>
              <figcaption>
                <h3>{pick(f.title, lang)}</h3>
                <p>{pick(f.text, lang)}</p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonios ---------- */
export function Testimonials() {
  const { lang } = useLang();
  const t = ui[lang].testimonials;
  return (
    <section className="section" id="opiniones" aria-labelledby="op-h">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="op-h" className="h2">{t.title}</h2>
        </Reveal>
        <ul className="testis">
          {testimonials.map((q, i) => (
            <Reveal as="li" key={q.who} delay={0.06 * i} className="glass glass--hover card">
              <blockquote>“{pick(q.quote, lang)}”</blockquote>
              <div>
                <p className="who">{q.who}</p>
                <p className="ctx">{pick(q.ctx, lang)}</p>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="demo-note">{t.demo}</p>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function Faq() {
  const { lang } = useLang();
  const t = ui[lang].faq;
  const [open, setOpen] = useState(-1);
  const uid = useId();
  return (
    <section className="section" id="faq" aria-labelledby="faq-h">
      <div className="wrap two-col">
        <div className="sticky-head">
          <Reveal>
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="faq-h" className="h2">{t.title}</h2>
            <p className="lead">{t.lead}</p>
          </Reveal>
        </div>
        <ul>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
                  <button type="button" className="faq__head" id={`${uid}-h${i}`} aria-expanded={isOpen} aria-controls={`${uid}-p${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span>{pick(f.q, lang)}</span>
                    <span className="faq__plus" aria-hidden="true"><IconPlus /></span>
                  </button>
                </h3>
                <Collapse open={isOpen} id={`${uid}-p${i}`} labelledBy={`${uid}-h${i}`} className="faq__body">
                  <p>{pick(f.a, lang)}</p>
                </Collapse>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
