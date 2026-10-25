import { useEffect, useId, useRef, useState } from 'react';
import { useLang, ui, pick } from '../i18n.js';
import { clinic, treatments } from '../data/clinic.js';
import { Reveal, Logo, IconAlert, IconArrow } from './primitives.jsx';

/* ---------- Ubicación y horario ---------- */
export function Location() {
  const { lang } = useLang();
  const t = ui[lang].location;
  const a = clinic.address;
  const q = encodeURIComponent(`${a.street}, ${a.postalCode} ${a.city}`);
  return (
    <section className="section" id="ubicacion" aria-labelledby="ub-h">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="ub-h" className="h2">{t.title}</h2>
        </Reveal>
        <div className="loc">
          <Reveal className="loc__card surface-light on-light">
            <Logo tone="light" />
            <div>
              <h3>{t.address}</h3>
              <address>{a.street}<br />{a.postalCode} {a.city}</address>
            </div>
            <div>
              <h3>{t.hours}</h3>
              <div className="hours">
                {clinic.hours.map((h) => (
                  <div key={h.days.es}><span>{pick(h.days, lang)}</span><span>{pick(h.time, lang)}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h3>{t.phone}</h3>
              <a className="tel" href={`tel:${clinic.phoneHref}`}>{clinic.phone}</a>
            </div>
            <a className="btn btn--dark" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
              {t.directions} <IconArrow className="icon" />
            </a>
          </Reveal>
          <Reveal className="loc__map glass" delay={0.08}>
            <svg viewBox="0 0 700 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label={t.mapLabel}>
              <g fill="none" stroke="rgba(229,229,229,0.22)" strokeWidth="1">
                <path d="M-20 90 L720 150" /><path d="M-20 250 L720 200" /><path d="M-20 360 L720 390" />
                <path d="M120 -20 L170 440" /><path d="M330 -20 L300 440" /><path d="M520 -20 L580 440" />
              </g>
              <g fill="none" stroke="rgba(229,229,229,0.5)" strokeWidth="1.5">
                <path d="M-20 170 C180 160 300 240 720 230" />
                <path d="M410 -20 C400 120 440 260 430 440" />
              </g>
              <circle cx="372" cy="205" r="26" fill="none" stroke="rgba(229,229,229,0.5)" />
              <circle cx="372" cy="205" r="9" fill="#fff" />
              <circle cx="372" cy="205" r="3" fill="#161616" />
            </svg>
            <span className="tag">{t.note}</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Validación ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ES_RE = /^(?:(?:\+|00)34)?[6-9]\d{8}$/;
const PHONE_INT_RE = /^(?:\+|00)\d{8,15}$/;
const MIN_TEXT = 10;

function validate(v, e) {
  const err = {};
  const name = v.name.trim();
  if (!name) err.name = e.nameRequired; else if (name.length < MIN_TEXT) err.name = e.nameShort;
  const email = v.email.trim();
  if (!email) err.email = e.emailRequired; else if (!EMAIL_RE.test(email)) err.email = e.emailFormat;
  const phone = v.phone.replace(/[\s.\-()]/g, '');
  if (!phone) err.phone = e.phoneRequired; else if (!PHONE_ES_RE.test(phone) && !PHONE_INT_RE.test(phone)) err.phone = e.phoneFormat;
  if (!v.treatment) err.treatment = e.treatmentRequired;
  const msg = v.message.trim();
  if (!msg) err.message = e.messageRequired; else if (msg.length < MIN_TEXT) err.message = e.messageShort;
  if (!v.consent) err.consent = e.consentRequired;
  return err;
}

const EMPTY = { name: '', email: '', phone: '', treatment: '', message: '', consent: false };
const ORDER = ['name', 'email', 'phone', 'treatment', 'message', 'consent'];

/* ---------- Contacto ---------- */
export function Contact({ preselect }) {
  const { lang } = useLang();
  const t = ui[lang].contact;
  const uid = useId();
  const formRef = useRef(null);
  const [v, setV] = useState(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(false);
  const errors = validate(v, t.errors);
  const shown = attempted ? errors : {};
  const count = Object.keys(shown).length;

  useEffect(() => {
    if (preselect?.id) setV((s) => ({ ...s, treatment: preselect.id }));
  }, [preselect]);

  const set = (k) => (ev) => setV((s) => ({ ...s, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }));

  const onSubmit = (ev) => {
    ev.preventDefault();
    setAttempted(true);
    const errs = validate(v, t.errors);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    // Beta sin backend: NO se envía nada.
    setDone(true);
  };

  const reset = () => { setV(EMPTY); setAttempted(false); setDone(false); };

  const fid = (k) => `${uid}-${k}`;
  const field = (k) => ({
    id: fid(k),
    name: k,
    'aria-invalid': shown[k] ? 'true' : 'false',
    'aria-describedby': `${fid(k)}-err${k === 'message' ? ` ${fid(k)}-count` : ''}`,
    'aria-required': 'true',
    required: true,
    onChange: set(k),
  });
  const Err = ({ k }) => (
    <p id={`${fid(k)}-err`} className={`err${shown[k] ? ' is-on' : ''}`}>
      {shown[k] && (<><IconAlert aria-hidden="true" /><span>{shown[k]}</span></>)}
    </p>
  );

  return (
    <section className="section" id="contacto" aria-labelledby="contacto-h">
      <div className="wrap contact">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="contacto-h" className="h2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
          <dl className="aside">
            <div><dt>{t.aside.phone}</dt><dd><a href={`tel:${clinic.phoneHref}`}>{clinic.phone}</a></dd></div>
            <div><dt>{t.aside.email}</dt><dd><a href={`mailto:${clinic.email}`}>{clinic.email}</a></dd></div>
            <div><dt>{t.aside.visit}</dt><dd>{clinic.address.street}, {clinic.address.postalCode} {clinic.address.city}</dd></div>
          </dl>
        </Reveal>

        <Reveal delay={0.08} className="glass form-wrap" style={{ borderRadius: 40 }}>
          {done ? (
            <div className="form" role="status">
              <div className="success">
                <strong>{t.success}</strong>
                <p className="muted">{t.successSub}</p>
                <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>{t.reset}</button>
              </div>
            </div>
          ) : (
            <form className="form" ref={formRef} noValidate onSubmit={onSubmit} aria-label={t.form}>
              <p className="muted" style={{ fontSize: 14 }}>{t.required}</p>
              <div className="summary-wrap">
                <div className={`summary${count ? ' is-on' : ''}`} role="status" aria-live="polite">
                  {count ? t.summary(count) : ''}
                </div>
              </div>

              <div className="field">
                <label htmlFor={fid('name')}>{t.fields.name.label}</label>
                <input className="input" type="text" autoComplete="name" placeholder={t.fields.name.ph} value={v.name} {...field('name')} />
                <Err k="name" />
              </div>

              <div className="form__row">
                <div className="field">
                  <label htmlFor={fid('email')}>{t.fields.email.label}</label>
                  <input className="input" type="email" inputMode="email" autoComplete="email" placeholder={t.fields.email.ph} value={v.email} {...field('email')} />
                  <Err k="email" />
                </div>
                <div className="field">
                  <label htmlFor={fid('phone')}>{t.fields.phone.label}</label>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder={t.fields.phone.ph} value={v.phone} {...field('phone')} />
                  <Err k="phone" />
                </div>
              </div>

              <div className="field">
                <label htmlFor={fid('treatment')}>{t.fields.treatment.label}</label>
                <select className="input" value={v.treatment} {...field('treatment')}>
                  <option value="" disabled>{t.fields.treatment.ph}</option>
                  {treatments.map((tr) => <option key={tr.id} value={tr.id}>{pick(tr.name, lang)}</option>)}
                  <option value="unsure">{t.fields.treatment.unsure}</option>
                </select>
                <Err k="treatment" />
              </div>

              <div className="field">
                <label htmlFor={fid('message')}>{t.fields.message.label}</label>
                <textarea className="input" rows={4} placeholder={t.fields.message.ph} value={v.message} {...field('message')} />
                <span id={`${fid('message')}-count`} className="count">{t.charCount(v.message.trim().length, MIN_TEXT)}</span>
                <Err k="message" />
              </div>

              <div className="field">
                <label className="check" htmlFor={fid('consent')}>
                  <input type="checkbox" checked={v.consent} {...field('consent')} id={fid('consent')} />
                  <span>{t.fields.consent}</span>
                </label>
                <Err k="consent" />
              </div>

              <div>
                <button type="submit" className="btn btn--primary">{t.submit} <IconArrow className="icon" /></button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  const { lang } = useLang();
  const t = ui[lang];
  const f = t.footer;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <Logo />
            <p className="footer__blurb">{f.blurb}</p>
          </div>
          <nav aria-label={f.explore}>
            <h2>{f.explore}</h2>
            <ul>
              {t.nav.links.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}
              <li><a href="#contacto">{t.nav.cta}</a></li>
            </ul>
          </nav>
          <div>
            <h2>{f.contact}</h2>
            <ul>
              <li><a href={`tel:${clinic.phoneHref}`}>{clinic.phone}</a></li>
              <li><a href={`mailto:${clinic.email}`}>{clinic.email}</a></li>
              <li>{clinic.address.street}<br />{clinic.address.postalCode} {clinic.address.city}</li>
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>{f.rights(new Date().getFullYear())}</span>
          <span>{f.legal}</span>
          <a href="#top">{f.top}</a>
        </div>
      </div>
    </footer>
  );
}
