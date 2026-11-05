import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { BUSINESS } from '../data/business.js';
import {
  ACABADOS, ESTANCIAS, MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_BYTES, MIN_TEXT, PLAZOS, STEP_VALIDATORS, TIPOS, VIVIENDAS, roomArea, validateAll,
} from '../../shared/schema.js';
import { computeEstimate, loadPricing } from '../lib/estimate.js';
import { processFile, toBase64 } from '../lib/compress.js';

const RANGES = { m2Vivienda: [10, 2000], m2: [1, 500], largo: [0.5, 40], ancho: [0.5, 40], alto: [1.8, 6] };
const num = (s) => {
  const t = String(s ?? '').trim().replace(',', '.');
  return t === '' ? NaN : Number(t);
};
const newRoom = (id) => ({ id, nombre: '', modo: 'm2', m2: '', largo: '', ancho: '', alto: '' });
const INITIAL = {
  tipo: '', tipoOtro: '', vivienda: '', viviendaOtro: '', m2Vivienda: '', acabados: '', plazo: '',
  nombre: '', email: '', telefono: '', mensaje: '', rgpd: false, website: '',
};
const kb = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fid = (k) => `f-${k.replaceAll('.', '-')}`;

function normalize(d, rooms, photos) {
  return {
    tipo: d.tipo, tipoOtro: d.tipoOtro.trim(), vivienda: d.vivienda, viviendaOtro: d.viviendaOtro.trim(),
    m2Vivienda: num(d.m2Vivienda),
    estancias: rooms.map((r) => ({ nombre: r.nombre, modo: r.modo, m2: num(r.m2), largo: num(r.largo), ancho: num(r.ancho), alto: num(r.alto) })),
    acabados: d.acabados, plazo: d.plazo, mensaje: d.mensaje.trim(), nombre: d.nombre.trim(), email: d.email.trim(),
    telefono: d.telefono.trim(), rgpd: d.rgpd,
    fotos: photos.map((p) => ({ name: p.name, type: p.type, size: p.size })),
  };
}

/* ---------- Piezas ---------- */
function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="hint mono" id={`${id}-h`}>{hint}</p>}
      {children}
      <p className="err" id={`${id}-e`} aria-live="polite">{error}</p>
    </div>
  );
}
const ctl = (key, error, hint) => ({
  id: fid(key), 'data-k': key, 'aria-invalid': error ? 'true' : undefined,
  'aria-describedby': [hint ? `${fid(key)}-h` : null, error ? `${fid(key)}-e` : null].filter(Boolean).join(' ') || undefined,
});

function Choice({ name, value, checked, onChange, label, sub, dataK }) {
  return (
    <label className="choice">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} data-k={dataK} />
      <span><span>{label}{sub && <small>{sub}</small>}</span></span>
    </label>
  );
}

function Diagram({ on, label, words }) {
  const hl = (k) => (on === k ? 'true' : undefined);
  return (
    <svg className="diagram" viewBox="0 0 220 176" role="img" aria-label={label}>
      <path className="ed fl" d="M30 130 L150 130 L190 100 L70 100 Z" />
      <path className="ed" d="M30 130 V50 M150 130 V50 M190 100 V20 M70 100 V20 M30 50 H150 L190 20 H70 Z" />
      <g data-on={hl('largo')}><path className="dm" d="M30 148 H150 M30 143 V153 M150 143 V153" data-on={hl('largo')} /><text x="76" y="168">{words.largo}</text></g>
      <g data-on={hl('ancho')}><path className="dm" d="M160 136 L200 106 M156 131 L164 141 M196 101 L204 111" data-on={hl('ancho')} /><text x="176" y="130">{words.ancho}</text></g>
      <g data-on={hl('alto')}><path className="dm" d="M14 130 V50 M9 130 H19 M9 50 H19" data-on={hl('alto')} /><text x="0" y="92" transform="rotate(-90 4 92)" textAnchor="middle">{words.alto}</text></g>
    </svg>
  );
}

/* ---------- Formulario ---------- */
export default function Quote() {
  const { t, lang, dict } = useI18n();
  const f = dict.form;
  const uid = useRef(1);
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [rooms, setRooms] = useState(() => [newRoom(0)]);
  const [photos, setPhotos] = useState([]);
  const [photoMsgs, setPhotoMsgs] = useState([]);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [result, setResult] = useState(null);
  const [over, setOver] = useState(false);
  const [dimFocus, setDimFocus] = useState({});
  const [pr, setPr] = useState({ pricing: null, show: false });
  const formRef = useRef(null);
  const headRef = useRef(null);
  const fileRef = useRef(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => { loadPricing().then(setPr); }, []);
  useEffect(() => () => photosRef.current.forEach((p) => p.url && URL.revokeObjectURL(p.url)), []);

  // Vista previa de resultado solo en desarrollo/pruebas (no existe en el build de producción).
  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(location.search).get('result') === '1') {
      setResult({ d: { tipo: 'cocina', acabados: 'medio', m2Vivienda: 80, estancias: [{ modo: 'm2', m2: 10 }] } });
    }
  }, []);

  const norm = useMemo(() => normalize(data, rooms, photos), [data, rooms, photos]);

  const msg = useCallback((key, errs = errors) => {
    const code = errs[key];
    if (!code) return '';
    const last = key.split('.').pop();
    if (key === 'fotos' && code === 'required') return t('form.errors.photosRequired');
    if (key === 'estancias' && code === 'required') return t('form.errors.estanciasRequired');
    if (key === 'rgpd') return t('form.errors.rgpd');
    const [min, max] = RANGES[last] || [];
    return t(`form.errors.${code}`, { min: code === 'minLen' ? MIN_TEXT : min, max: code === 'count' ? MAX_PHOTOS : max, phone: BUSINESS.phone.display });
  }, [errors, t]);

  const validateStep = (s, d = norm) => STEP_VALIDATORS[s](d);

  // Una vez intentado avanzar, los errores del paso se recalculan al editar.
  useEffect(() => { if (attempted) setErrors(validateStep(step)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [norm, attempted, step]);

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setVal = (k) => (v) => setData((d) => ({ ...d, [k]: v }));
  const setRoom = (id, patch) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const focusFirst = (errs) => {
    const first = Object.keys(errs)[0];
    requestAnimationFrame(() => formRef.current?.querySelector(`[data-k="${first}"]`)?.focus());
  };
  const goto = (s) => {
    setStep(s); setAttempted(false); setErrors({}); setServerErr('');
    requestAnimationFrame(() => { headRef.current?.focus({ preventScroll: true }); document.getElementById('presupuesto')?.scrollIntoView({ block: 'start' }); });
  };
  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setAttempted(true); setErrors(errs); focusFirst(errs); return; }
    goto(step + 1);
  };

  /* Fotos */
  const makeUrl = (r) => (r.heic ? null : URL.createObjectURL(r.blob));
  const fitTotal = async (items) => {
    let cur = items;
    for (let i = 0; i < 3; i += 1) {
      if (cur.reduce((s, p) => s + p.size, 0) <= MAX_TOTAL_BYTES) break;
      const target = Math.floor((MAX_TOTAL_BYTES * 0.9) / cur.length);
      cur = await Promise.all(cur.map(async (p) => {
        if (p.size <= target || p.heic) return p;
        const r = await processFile(p.file, target);
        if (!r.ok) return p;
        if (p.url) URL.revokeObjectURL(p.url);
        return { ...p, ...r, url: makeUrl(r) };
      }));
    }
    return cur;
  };
  const addFiles = async (list) => {
    if (busy) return;
    const files = [...list];
    if (!files.length) return;
    setBusy(true);
    const msgs = [];
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) msgs.push(t('form.errors.count', { max: MAX_PHOTOS }));
    const added = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const r = await processFile(file, MAX_PHOTO_BYTES);
      if (!r.ok) { msgs.push(`${file.name}: ${t(`form.errors.${r.code}`, { name: file.name })}`); continue; }
      added.push({ id: uid.current++, file, ...r, url: makeUrl(r) });
    }
    const merged = await fitTotal([...photos, ...added]);
    setPhotos(merged); setPhotoMsgs(msgs); setBusy(false);
  };
  const removePhoto = (id) => {
    setPhotos((ps) => ps.filter((p) => { if (p.id === id && p.url) URL.revokeObjectURL(p.url); return p.id !== id; }));
    setPhotoMsgs([]);
  };

  /* Envío */
  const send = async () => {
    const all = validateAll(norm);
    if (Object.keys(all).length) {
      const firstStep = STEP_VALIDATORS.findIndex((v) => Object.keys(v(norm)).length);
      setStep(firstStep); setAttempted(true); setErrors(all); focusFirst(all); return;
    }
    setSending(true); setServerErr('');
    try {
      const fotos = await Promise.all(photos.map(async (p) => ({ name: p.name, type: p.type, size: p.size, data: await toBase64(p.blob) })));
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...norm, lang, website: data.website, fotos }),
      });
      if (res.ok) { setResult({ d: norm }); }
      else if (res.status === 429) setServerErr(t('form.errors.rate', { phone: BUSINESS.phone.display }));
      else setServerErr(t('form.errors.server', { phone: BUSINESS.phone.display }));
    } catch {
      setServerErr(t('form.errors.network'));
    } finally { setSending(false); }
  };

  const reset = () => {
    photos.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    setData(INITIAL); setRooms([newRoom(uid.current++)]); setPhotos([]); setPhotoMsgs([]); setResult(null); goto(0);
  };

  const onSubmit = (e) => { e.preventDefault(); if (step < 5) next(); else send(); };

  const errList = Object.keys(errors).map((k) => ({ k, text: msg(k) }));
  const fm = new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  /* ---------- Resultado ---------- */
  if (result) {
    const est = computeEstimate(result.d, pr.pricing, pr.show);
    return (
      <section className="section quote on-dark" id="presupuesto" aria-labelledby="q-t">
        <div className="narrow quote-wrap">
          <div className="quote-side"><h2 id="q-t" className="display">{t('quote.title')}</h2></div>
          <div className="form-card result" role="status" aria-live="polite">
            <h3 className="h40" ref={headRef} tabIndex={-1}>{t('form.result.title')}</h3>
            <p className="lead" style={{ color: 'var(--slate)' }}>{t('form.result.body')}</p>
            {est && (
              <div data-testid="estimate">
                <p className="body">{t('form.result.estimateLead')}</p>
                <p className="est">{t('form.result.estimate', { min: fm.format(est.min), max: fm.format(est.max) })}</p>
                <p className="mono" style={{ marginTop: 8 }}>{t('form.result.estimateBasis', { m2: est.m2 })}</p>
                <p className="legal" style={{ marginTop: 16 }}>{t('form.result.legal')}</p>
              </div>
            )}
            <div><button type="button" className="btn btn-ghost" onClick={reset}>{t('form.result.again')}</button></div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Pasos ---------- */
  const e = (k) => msg(k);
  const stepBody = [
    // 0 Reforma
    <fieldset key="s0">
      <legend ref={headRef} tabIndex={-1}>{f.tipo.legend}</legend>
      <div className="fields">
        <div className="choices" role="radiogroup" aria-label={f.tipo.legend}>
          {TIPOS.map((v, i) => <Choice key={v} name="tipo" value={v} checked={data.tipo === v} onChange={setVal('tipo')} label={f.tipo.options[v]} dataK={i === 0 ? 'tipo' : undefined} />)}
        </div>
        <p className="err" aria-live="polite">{e('tipo')}</p>
        {data.tipo === 'otro' && (
          <Field id={fid('tipoOtro')} label={f.tipo.otroLabel} error={e('tipoOtro')} hint={t('form.contact.messageHint', { min: MIN_TEXT })}>
            <textarea className="textarea" value={data.tipoOtro} onChange={set('tipoOtro')} placeholder={f.tipo.otroPh} {...ctl('tipoOtro', e('tipoOtro'), true)} />
          </Field>
        )}
      </div>
    </fieldset>,
    // 1 Vivienda
    <fieldset key="s1">
      <legend ref={headRef} tabIndex={-1}>{f.home.legend}</legend>
      <div className="fields">
        <div className="field">
          <span className="lbl" id="vv-l">{f.home.tipoLabel}</span>
          <div className="choices" role="radiogroup" aria-labelledby="vv-l">
            {VIVIENDAS.map((v, i) => <Choice key={v} name="vivienda" value={v} checked={data.vivienda === v} onChange={setVal('vivienda')} label={f.home.options[v]} dataK={i === 0 ? 'vivienda' : undefined} />)}
          </div>
          <p className="err" aria-live="polite">{e('vivienda')}</p>
        </div>
        {data.vivienda === 'otro' && (
          <Field id={fid('viviendaOtro')} label={f.home.otroLabel} error={e('viviendaOtro')} hint={t('form.contact.messageHint', { min: MIN_TEXT })}>
            <textarea className="textarea" value={data.viviendaOtro} onChange={set('viviendaOtro')} placeholder={f.home.otroPh} {...ctl('viviendaOtro', e('viviendaOtro'), true)} />
          </Field>
        )}
        <Field id={fid('m2Vivienda')} label={f.home.m2Label} error={e('m2Vivienda')}>
          <input className="input" type="text" inputMode="decimal" autoComplete="off" value={data.m2Vivienda} onChange={set('m2Vivienda')} placeholder={f.home.m2Ph} {...ctl('m2Vivienda', e('m2Vivienda'))} />
        </Field>
      </div>
    </fieldset>,
    // 2 Medidas
    <fieldset key="s2">
      <legend ref={headRef} tabIndex={-1}>{f.rooms.legend}</legend>
      <p className="body" style={{ marginBottom: 20 }}>{f.rooms.help}</p>
      <div className="fields">
        {rooms.map((r, i) => {
          const area = roomArea({ ...r, m2: num(r.m2), largo: num(r.largo), ancho: num(r.ancho) });
          const k = (s) => `estancia.${i}.${s}`;
          return (
            <div className="room" key={r.id} role="group" aria-label={t('form.rooms.room', { n: i + 1 })}>
              <div className="room-top">
                <h3>{t('form.rooms.room', { n: i + 1 })}</h3>
                {rooms.length > 1 && <button type="button" className="btn btn-ghost btn-icon" aria-label={t('form.rooms.remove', { n: i + 1 })} onClick={() => setRooms((rs) => rs.filter((x) => x.id !== r.id))}>×</button>}
              </div>
              <Field id={fid(k('nombre'))} label={f.rooms.name} error={e(k('nombre'))}>
                <select className="select" value={r.nombre} onChange={(ev) => setRoom(r.id, { nombre: ev.target.value })} {...ctl(k('nombre'), e(k('nombre')))}>
                  <option value="" disabled>—</option>
                  {ESTANCIAS.map((n) => <option key={n} value={n}>{f.rooms.names[n]}</option>)}
                </select>
              </Field>
              <div className="field">
                <span className="lbl" id={`md-${r.id}`}>{f.rooms.modeLabel}</span>
                <div className="seg" role="radiogroup" aria-labelledby={`md-${r.id}`}>
                  {['m2', 'lah'].map((m) => (
                    <label key={m}><input type="radio" name={`modo-${r.id}`} value={m} checked={r.modo === m} onChange={() => setRoom(r.id, { modo: m })} /><span>{f.rooms.modes[m]}</span></label>
                  ))}
                </div>
              </div>
              {r.modo === 'm2' ? (
                <Field id={fid(k('m2'))} label={f.rooms.m2} error={e(k('m2'))}>
                  <input className="input" type="text" inputMode="decimal" autoComplete="off" value={r.m2} onChange={(ev) => setRoom(r.id, { m2: ev.target.value })} {...ctl(k('m2'), e(k('m2')))} />
                </Field>
              ) : (
                <div className="room-grid">
                  <div className="dims">
                    {['largo', 'ancho', 'alto'].map((d) => (
                      <Field key={d} id={fid(k(d))} label={f.rooms[d]} error={e(k(d))}>
                        <input className="input" type="text" inputMode="decimal" autoComplete="off" value={r[d]} onChange={(ev) => setRoom(r.id, { [d]: ev.target.value })}
                          onFocus={() => setDimFocus((x) => ({ ...x, [r.id]: d }))} onBlur={() => setDimFocus((x) => ({ ...x, [r.id]: null }))} {...ctl(k(d), e(k(d)))} />
                      </Field>
                    ))}
                  </div>
                  <Diagram on={dimFocus[r.id]} label={f.rooms.diagramLabel} words={f.rooms.diagram} />
                </div>
              )}
              {Number.isFinite(area) && area > 0 && <p className="mono">{t('form.rooms.area', { m2: Math.round(area * 10) / 10 })}</p>}
            </div>
          );
        })}
        <p className="err" aria-live="polite" data-k="estancias" tabIndex={-1}>{e('estancias')}</p>
        {rooms.length < 8 && <div><button type="button" className="btn btn-ghost btn-small" onClick={() => setRooms((rs) => [...rs, newRoom(uid.current++)])}>+ {f.rooms.add}</button></div>}
      </div>
    </fieldset>,
    // 3 Acabados
    <fieldset key="s3">
      <legend ref={headRef} tabIndex={-1}>{f.finish.legend}</legend>
      <div className="fields">
        <div className="field">
          <span className="lbl" id="ac-l">{f.finish.finishLabel}</span>
          <div className="choices three" role="radiogroup" aria-labelledby="ac-l">
            {ACABADOS.map((v, i) => <Choice key={v} name="acabados" value={v} checked={data.acabados === v} onChange={setVal('acabados')} label={f.finish.finishes[v]} sub={f.finish.finishHelp[v]} dataK={i === 0 ? 'acabados' : undefined} />)}
          </div>
          <p className="err" aria-live="polite">{e('acabados')}</p>
        </div>
        <Field id={fid('plazo')} label={f.finish.plazoLabel} error={e('plazo')}>
          <select className="select" value={data.plazo} onChange={set('plazo')} {...ctl('plazo', e('plazo'))}>
            <option value="" disabled>—</option>
            {PLAZOS.map((p) => <option key={p} value={p}>{f.finish.plazos[p]}</option>)}
          </select>
        </Field>
      </div>
    </fieldset>,
    // 4 Fotos
    <fieldset key="s4">
      <legend ref={headRef} tabIndex={-1}>{f.photos.legend}</legend>
      <div
        className="drop" data-over={over}
        onDragOver={(ev) => { ev.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(ev) => { ev.preventDefault(); setOver(false); addFiles(ev.dataTransfer.files); }}
      >
        <p className="big">{f.photos.drop}</p>
        <p className="mono">{f.photos.or}</p>
        <button type="button" className="btn btn-fill" data-k="fotos" disabled={busy || photos.length >= MAX_PHOTOS} onClick={() => fileRef.current?.click()}>{busy ? f.photos.processing : f.photos.choose}</button>
        <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          onChange={(ev) => { addFiles(ev.target.files); ev.target.value = ''; }} />
        <p className="body" style={{ fontSize: 14 }}>{f.photos.help}</p>
        <p className="mono" aria-live="polite">{t('form.photos.count', { n: photos.length, max: MAX_PHOTOS })}</p>
      </div>
      <p className="err" id="fotos-e" aria-live="polite" style={{ marginTop: 12 }}>{e('fotos')}</p>
      <div className="err" aria-live="polite" style={{ marginTop: 8 }}>{photoMsgs.map((m) => <p key={m}>{m}</p>)}</div>
      {photos.length > 0 && (
        <ul className="thumbs">
          {photos.map((p, i) => (
            <li className="thumb" key={p.id}>
              {p.url ? <img src={p.url} alt={t('form.photos.previewAlt', { n: i + 1, name: p.name })} width="200" height="200" /> : <span className="name mono">{p.name}</span>}
              <span className="tag sz">{kb(p.size)}</span>
              <button type="button" className="rm" aria-label={t('form.photos.remove', { name: p.name })} onClick={() => removePhoto(p.id)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>,
    // 5 Contacto
    <fieldset key="s5">
      <legend ref={headRef} tabIndex={-1}>{f.contact.legend}</legend>
      <div className="fields">
        <Field id={fid('nombre')} label={f.contact.name} error={e('nombre')}>
          <input className="input" type="text" autoComplete="name" value={data.nombre} onChange={set('nombre')} placeholder={f.contact.namePh} {...ctl('nombre', e('nombre'))} />
        </Field>
        <Field id={fid('email')} label={f.contact.email} error={e('email')}>
          <input className="input" type="email" autoComplete="email" inputMode="email" value={data.email} onChange={set('email')} placeholder={f.contact.emailPh} {...ctl('email', e('email'))} />
        </Field>
        <Field id={fid('telefono')} label={f.contact.phone} error={e('telefono')}>
          <input className="input" type="tel" autoComplete="tel" inputMode="tel" value={data.telefono} onChange={set('telefono')} placeholder={f.contact.phonePh} {...ctl('telefono', e('telefono'))} />
        </Field>
        <Field id={fid('mensaje')} label={f.contact.message} error={e('mensaje')} hint={t('form.contact.messageHint', { min: MIN_TEXT })}>
          <textarea className="textarea" value={data.mensaje} onChange={set('mensaje')} placeholder={f.contact.messagePh} {...ctl('mensaje', e('mensaje'), true)} />
        </Field>
        <div className="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} /></label></div>
        <div className="field">
          <div className="check">
            <input type="checkbox" id="f-rgpd" data-k="rgpd" checked={data.rgpd} onChange={set('rgpd')} aria-invalid={e('rgpd') ? 'true' : undefined} aria-describedby={e('rgpd') ? 'f-rgpd-e' : undefined} />
            <label htmlFor="f-rgpd">{f.contact.rgpd.split(f.contact.rgpdLink)[0]}<a href="#privacidad-pie" onClick={(ev) => { ev.preventDefault(); document.querySelector('[aria-controls="privacidad"]')?.click(); document.getElementById('privacidad')?.scrollIntoView({ behavior: 'smooth' }); }}>{f.contact.rgpdLink}</a>{f.contact.rgpd.split(f.contact.rgpdLink)[1]}</label>
          </div>
          <p className="err" id="f-rgpd-e" aria-live="polite">{e('rgpd')}</p>
        </div>
      </div>
    </fieldset>,
  ];

  return (
    <section className="section quote on-dark" id="presupuesto" aria-labelledby="q-t">
      <div className="narrow quote-wrap">
        <div className="quote-side">
          <h2 id="q-t" className="display">{t('quote.title')}</h2>
          <p className="lead">{t('quote.intro')}</p>
          <p className="mono tip">{t('quote.mobileTip')}</p>
        </div>
        <form ref={formRef} className="form-card" noValidate onSubmit={onSubmit} aria-label={f.ariaForm}>
          <div className="progress" aria-hidden="true">{f.steps.map((s, i) => <i key={s} data-on={i <= step} />)}</div>
          <p className="step-meta mono" aria-live="polite"><span>{t('form.stepOf', { n: step + 1, total: 6 })}</span><span>{f.steps[step]}</span></p>
          {errList.length > 0 && (
            <div className="errsum" role="alert">
              {f.errorsTitle}
              <ul>{errList.map((x) => <li key={x.k}>{x.text}</li>)}</ul>
            </div>
          )}
          {stepBody[step]}
          {serverErr && <p className="errsum" role="alert" style={{ marginTop: 20 }}>{serverErr}</p>}
          <div className="form-nav">
            {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => goto(step - 1)}>{f.back}</button>}
            {step < 5
              ? <button type="submit" className="btn btn-fill">{f.next}</button>
              : <button type="submit" className="btn btn-fill" disabled={sending}>{sending ? f.sending : f.send}</button>}
          </div>
        </form>
      </div>
    </section>
  );
}
