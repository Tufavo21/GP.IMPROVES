import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { reducedMotion } from '../lib/hooks.js';
import { BUSINESS, FALTA, SHOW_PLACEHOLDERS } from '../content/business.js';
import { TYPES, FINISHES, estimate } from '../content/pricing.js';
import { validate, VALIDATORS, FIELD_ORDER, MIN_TEXT, MAX_TEXT, MAX_PHOTOS, MAX_PHOTO_MB, photoProblem } from '../lib/validate.js';
import { submitRequest, buildMailto } from '../lib/submit.js';
import { SectionHead, Button, Icon, Falta } from '../components/ui.jsx';

const EMPTY = { nombre: '', email: '', telefono: '', tipo: '', acabados: '', m2: '', descripcion: '', privacidad: false, website: '' };

function Err({ id, code, t }) {
  if (!code) return null;
  const msg = t(`contact.errors.${code}`, { min: MIN_TEXT, max: MAX_TEXT });
  return <p className="field__err" id={id}><Icon.alert /> {msg}</p>;
}

export default function Contact({ index, total }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [photoErr, setPhotoErr] = useState([]);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState(null); // {kind: 'ok'|'fail', text, href?, linkText?, preview?}
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState('');
  const formRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData((d) => ({ ...d, [k]: v }));
    if (touched[k] || errors[k]) setErrors((er) => ({ ...er, [k]: VALIDATORS[k]?.(v) || undefined }));
  };
  const blur = (k) => () => {
    setTouched((tc) => ({ ...tc, [k]: true }));
    if (VALIDATORS[k]) setErrors((er) => ({ ...er, [k]: VALIDATORS[k](data[k]) || undefined }));
  };

  const addFiles = (list) => {
    const errs = [];
    const next = [...photos];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) { errs.push(t('contact.errors.fileCount', { max: MAX_PHOTOS })); break; }
      const prob = photoProblem(f);
      if (prob) { errs.push(t(`contact.errors.${prob}`, { name: f.name, mb: MAX_PHOTO_MB })); continue; }
      const heic = /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
      next.push({ file: f, name: f.name, size: f.size, url: heic ? null : URL.createObjectURL(f), key: `${f.name}-${f.size}-${f.lastModified}` });
    }
    setPhotos(next);
    setPhotoErr(errs);
  };
  const removePhoto = (key) => setPhotos((ps) => {
    const p = ps.find((x) => x.key === key);
    if (p?.url) URL.revokeObjectURL(p.url);
    return ps.filter((x) => x.key !== key);
  });

  const est = useMemo(() => estimate(data.tipo, data.acabados, data.m2), [data.tipo, data.acabados, data.m2]);
  const fmtEur = (v) => v.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errs = validate(data);
    setErrors(errs);
    setTouched(Object.fromEntries(FIELD_ORDER.map((k) => [k, true])));
    const keys = FIELD_ORDER.filter((k) => errs[k]);
    if (keys.length) {
      setSummary(keys.length === 1 ? t('contact.errors.summaryOne') : t('contact.errors.summary', { n: keys.length }));
      formRef.current?.querySelector(`[name="${keys[0]}"]`)?.focus();
      return;
    }
    setSummary('');
    if (data.website) return; // honeypot (para cuando haya backend)
    setSending(true);
    const labels = {
      ...t('contact.fields'),
      tipoValue: t(`contact.tipos.${data.tipo}`),
      acabadosValue: t(`contact.acabadosOpts.${data.acabados}`),
    };
    const res = await submitRequest({ data: { ...data, website: undefined }, photos, labels, lang });
    setSending(false);
    if (!res.ok) {
      const bad = res.error?.kind === 'validation' ? FIELD_ORDER.filter((k) => res.error.errors?.[k]) : [];
      if (bad.length) { // el servidor ha rechazado campos: se muestran con los mismos mensajes del formulario
        setErrors(Object.fromEntries(bad.map((k) => [k, t(`contact.errors.${res.error.errors[k]}`) ? res.error.errors[k] : 'required'])));
        setTouched(Object.fromEntries(FIELD_ORDER.map((k) => [k, true])));
        setSummary(bad.length === 1 ? t('contact.errors.summaryOne') : t('contact.errors.summary', { n: bad.length }));
        formRef.current?.querySelector(`[name="${bad[0]}"]`)?.focus();
      } else if (res.error?.kind === 'rate') {
        setStatus({ kind: 'fail', text: t('contact.rateLimited') });
      } else { // el Worker no responde o falla: mensaje + enlace mailto de respaldo
        setStatus({ kind: 'fail', text: t('contact.failed', { email: BUSINESS.email, phone: BUSINESS.phone.intl }), href: buildMailto({ data, photos, labels }), linkText: t('contact.failedMailto') });
      }
    } else if (res.mode === 'mailto') setStatus({ kind: 'ok', text: photos.length ? t('contact.mailtoDone', { n: photos.length }) : t('contact.mailtoDoneNoPhotos') });
    else if (res.mode === 'lead') {
      const text = res.mail === 'sent' ? t('contact.leadDone') : res.demo ? t('contact.leadDoneDemo') : t('contact.leadDoneNoMail');
      setStatus({ kind: 'ok', text, preview: res.demo ? res.preview : undefined });
      photos.forEach((p) => p.url && URL.revokeObjectURL(p.url));
      setData(EMPTY); setPhotos([]); setPhotoErr([]); setTouched({}); setErrors({});
    } else setStatus({ kind: 'ok', text: t('contact.httpDone') });
  };

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const aria = (k, extra) => ({
    'aria-invalid': err(k) ? 'true' : undefined,
    'aria-describedby': [err(k) ? `${k}-err` : null, extra].filter(Boolean).join(' ') || undefined,
  });
  const fieldCls = (k, v) => `field ${err(k) ? 'is-err' : ''} ${v !== '' && v != null ? 'has-v' : ''}`;
  const F = t('contact.fields');

  const text = (k, type = 'text', props = {}) => (
    <div className={fieldCls(k, data[k])}>
      <input className="field__in" id={k} name={k} type={type} value={data[k]} onChange={set(k)} onBlur={blur(k)}
        placeholder=" " required {...aria(k)} {...props} />
      <label className="field__lb" htmlFor={k}>{F[k]}</label>
      <Err id={`${k}-err`} code={err(k)} t={t} />
    </div>
  );
  const select = (k, opts, labelsKey) => (
    <div className={fieldCls(k, data[k])}>
      <select className="field__in field__sel" id={k} name={k} value={data[k]} onChange={set(k)} onBlur={blur(k)} required {...aria(k)}>
        <option value="" disabled>{t('contact.choose')}</option>
        {opts.map((o) => <option key={o} value={o}>{t(`contact.${labelsKey}.${o}`)}</option>)}
      </select>
      <label className="field__lb field__lb--fixed" htmlFor={k}>{F[k]}</label>
      <Err id={`${k}-err`} code={err(k)} t={t} />
    </div>
  );

  return (
    <section id="presupuesto" className="section contact" data-logo="light" aria-labelledby="presupuesto-t">
      <SectionHead index={index} total={total} title={t('contact.title')} lede={t('contact.lede')} id="presupuesto-t" />
      <div className="grid contact__body">
        <aside className="contact__info">
          <p>{t('contact.body')}</p>
          <dl className="contact__dl">
            <div><dt className="label">{t('contact.phone')}</dt><dd><a href={BUSINESS.phone.href}>{BUSINESS.phone.intl}</a></dd></div>
            <div><dt className="label">{t('contact.email')}</dt><dd><a href={`mailto:${BUSINESS.email}`} className="break">{BUSINESS.email}</a></dd></div>
            <div><dt className="label">{t('contact.instagram')}</dt><dd><a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer">{BUSINESS.instagram.handle}</a></dd></div>
            <div><dt className="label">{t('contact.city')}</dt><dd>{BUSINESS.city}</dd></div>
          </dl>
        </aside>

        <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-describedby="form-summary" aria-busy={sending}>
          <p id="form-summary" className="form__summary" role="alert">{summary ? <><Icon.alert /> {summary}</> : null}</p>
          <div className="form__row">
            {text('nombre', 'text', { autoComplete: 'name', minLength: 2, maxLength: 120 })}
          </div>
          <div className="form__row form__row--2">
            {text('email', 'email', { autoComplete: 'email', inputMode: 'email', maxLength: 200 })}
            {text('telefono', 'tel', { autoComplete: 'tel', inputMode: 'tel', maxLength: 20 })}
          </div>
          <div className="form__row form__row--3">
            {select('tipo', TYPES, 'tipos')}
            {select('acabados', FINISHES, 'acabadosOpts')}
            {text('m2', 'number', { min: 1, max: 2000, step: 1, inputMode: 'numeric' })}
          </div>
          {est ? (
            <p className="form__est" aria-live="polite">
              <span className="label">{t('contact.estimate')}</span>
              <span className="form__est-n">{fmtEur(est.min)} – {fmtEur(est.max)}</span>
              <span className="form__est-note">{t('contact.estimateNote')}</span>
            </p>
          ) : null}
          <div className={fieldCls('descripcion', data.descripcion)}>
            <textarea className="field__in field__ta" id="descripcion" name="descripcion" rows={5} value={data.descripcion}
              onChange={set('descripcion')} onBlur={blur('descripcion')} placeholder=" " required minLength={MIN_TEXT} maxLength={MAX_TEXT}
              {...aria('descripcion', 'descripcion-hint')} />
            <label className="field__lb" htmlFor="descripcion">{F.descripcion}</label>
            <p className="field__hint" id="descripcion-hint">
              <span>{t('contact.descHint')}</span>
              <span className="field__count" aria-hidden="true">{t('contact.counter', { n: data.descripcion.trim().length, max: MAX_TEXT })}</span>
            </p>
            <Err id="descripcion-err" code={err('descripcion')} t={t} />
          </div>

          <div className="drop-wrap">
            <p className="label drop__title" id="fotos-lb">{F.fotos}</p>
            <label className={`drop ${drag ? 'is-drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
              <Icon.upload />
              <span>{t('contact.drop')} <u>{t('contact.browse')}</u></span>
              <span className="drop__hint" id="fotos-hint">{t('contact.dropHint', { max: MAX_PHOTOS, mb: MAX_PHOTO_MB })}</span>
              <input ref={fileRef} className="sr-only" type="file" name="fotos" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                aria-labelledby="fotos-lb" aria-describedby="fotos-hint fotos-err" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>
            <div id="fotos-err" aria-live="polite">{photoErr.map((m) => <p className="field__err" key={m}><Icon.alert /> {m}</p>)}</div>
            {photos.length ? (
              <ul className="thumbs">
                {photos.map((p) => (
                  <li className="thumb" key={p.key}>
                    {p.url ? <img src={p.url} alt="" /> : <span className="thumb__heic label">HEIC</span>}
                    <span className="thumb__name">{p.name}</span>
                    <button type="button" className="thumb__x" onClick={() => removePhoto(p.key)} aria-label={t('contact.remove', { name: p.name })}><Icon.close /></button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className={`check ${err('privacidad') ? 'is-err' : ''}`}>
            <input type="checkbox" id="privacidad" name="privacidad" checked={data.privacidad} onChange={set('privacidad')} required {...aria('privacidad')} />
            <label htmlFor="privacidad">{F.privacidad}{SHOW_PLACEHOLDERS ? <> <Falta>{FALTA.privacy}</Falta></> : null}</label>
            <Err id="privacidad-err" code={err('privacidad')} t={t} />
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} />
          </div>

          <div className="form__foot">
            <Button type="submit" variant="solid" disabled={sending}>{sending ? t('contact.sending') : t('contact.submit')}</Button>
            <p className="form__privacy">{t('contact.privacyNote')}</p>
          </div>
          <div aria-live="polite">
            <AnimatePresence>
              {status ? (
                <m.p key={status.text} className={`form__status form__status--${status.kind}`} role={status.kind === 'fail' ? 'alert' : 'status'}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}>
                  {status.text}
                  {status.href ? <> <a href={status.href}>{status.linkText}</a></> : null}
                </m.p>
              ) : null}
            </AnimatePresence>
            {status?.preview ? (
              <details className="form__preview">
                <summary>{t('contact.previewTitle')}</summary>
                <p>{status.preview.subject}</p>
                <pre>{status.preview.text}</pre>
              </details>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
