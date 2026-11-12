import { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { langStore, nightStore, useStore, useTr } from '../lib/store.js';
import { DAY, OPENS, CLOSES, CLUB, RULES, upcomingNights, fmtDate, eur } from '../lib/nights.js';
import { CHECK, Field, aria, useErrorText } from './Booking.jsx';

const MAX_QTY = 10;

// Entradas: noche, tramo y cantidad en una sola pantalla. Los tres precios son los
// publicados; qué tramo está a la venta en cada momento lo decide la venta oficial.
export default function Tickets() {
  const tr = useTr();
  const lang = useStore(langStore);
  const night = useStore(nightStore);
  const errText = useErrorText();
  const nights = useMemo(() => upcomingNights(6), []);
  const [date, setDate] = useState(() => nights[0]?.date);
  const [tier, setTier] = useState(0);
  const [qty, setQty] = useState(2);
  const [form, setForm] = useState({ name: '', email: '', consent: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const current = nights.find((n) => n.date === date) || nights[0];

  useEffect(() => {
    if (current && night !== current.type) { const n = nights.find((x) => x.type === night); if (n) setDate(n.date); }
  }, [night]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;
  const type = current.type;
  const price = CLUB.entry.tiers[tier];
  const tierName = [tr('Primer tramo', 'First release'), tr('Segundo tramo', 'Second release'), tr('Último tramo', 'Final release')];
  const set = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined })); setDone(false); };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    for (const k of ['name', 'email', 'consent']) { const c = CHECK[k](form[k]); if (c) er[k] = c; }
    setErrors(er);
    const bad = ['name', 'email', 'consent'].find((k) => er[k]);
    if (bad) { ref.current.querySelector(`[name="${bad}"]`)?.focus(); return; }
    setDone(true); // Maqueta: sin venta real.
  };
  const e = (k) => (errors[k] ? errText(errors[k]) : null);

  return (
    <section className="tix" id="entradas" data-tone="dark" aria-labelledby="tix-title">
      <div className="wrap">
        <Reveal as="h2" id="tix-title" className="display" text={tr('Entradas. Con tu primera copa.', 'Tickets. First drink included.')} />
        <p className="lead">{tr(
          'Cada entrada incluye una consumición. Cuanto antes compres, mejor precio: la venta sale en tres tramos.',
          'Every ticket includes one drink. The earlier you buy, the better the price: tickets go on sale in three releases.',
        )}</p>
        <div className="tix__grid">
          <div>
            <h3 className="tix__h">{tr('Noche', 'Night')}</h3>
            <div className="book__dates" role="group" aria-label={tr('Noche', 'Night')}>
              {nights.map((n) => (
                <button type="button" key={n.date} className="datechip" aria-pressed={n.date === current.date}
                  onClick={() => { setDate(n.date); nightStore.set(n.type); setDone(false); }}>
                  <span>{DAY[n.type].short[lang]}</span><b>{String(n.day).padStart(2, '0')}</b>
                </button>
              ))}
            </div>
            <h3 className="tix__h">{tr('Tramo', 'Release')}</h3>
            <div className="tiers" role="radiogroup" aria-label={tr('Tramo', 'Release')}>
              {CLUB.entry.tiers.map((p, i) => (
                <label key={p} className={`tier${tier === i ? ' is-on' : ''}`}>
                  <input type="radio" name="tier" checked={tier === i} onChange={() => { setTier(i); setDone(false); }} />
                  <span className="tier__name">{tierName[i]}</span>
                  <b>{eur(p, lang)}</b>
                </label>
              ))}
            </div>
            <p className="note">{tr('El tramo disponible depende de la venta de cada noche.', 'The release on sale depends on each night’s sales.')}</p>
          </div>

          <form className="stub" ref={ref} onSubmit={submit} noValidate>
            <p className="stub__night">{fmtDate(current.date, lang)}</p>
            <p className="stub__meta">{tr('Puertas', 'Doors')} {OPENS[type]} – {CLOSES} · +{RULES.minAge[type]} · {tr('una consumición', 'one drink')}</p>
            <div className="stub__qty">
              <span>{tr('Entradas', 'Tickets')}</span>
              <span className="qty">
                <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} disabled={qty <= 1} aria-label={tr('Una entrada menos', 'One ticket fewer')}>−</button>
                <output>{qty}</output>
                <button type="button" onClick={() => setQty((v) => Math.min(MAX_QTY, v + 1))} disabled={qty >= MAX_QTY} aria-label={tr('Una entrada más', 'One more ticket')}>+</button>
              </span>
            </div>
            <p className="stub__total"><span>{qty} × {eur(price, lang)}</span><b>{eur(qty * price, lang)}</b></p>
            <Field id="tx-name" label={tr('Nombre y apellidos', 'Full name')} error={e('name')}>
              <input id="tx-name" name="name" autoComplete="name" value={form.name} onChange={set('name')} {...aria('tx-name', e('name'))} />
            </Field>
            <Field id="tx-email" label={tr('Correo para recibir las entradas', 'Email to receive your tickets')} error={e('email')}>
              <input id="tx-email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} {...aria('tx-email', e('email'))} />
            </Field>
            <div className={`check${errors.consent ? ' field--bad' : ''}`}>
              <input id="tx-consent" name="consent" type="checkbox" checked={form.consent} onChange={set('consent')} {...aria('tx-consent', e('consent'))} />
              <label htmlFor="tx-consent">{tr(`Confirmo que todos tendremos ${RULES.minAge[type]} años o más esa noche.`, `I confirm we will all be ${RULES.minAge[type]} or over that night.`)}</label>
              {errors.consent ? <p className="field__err" id="tx-consent-err" role="alert">{e('consent')}</p> : null}
            </div>
            <button className="btn btn--ink btn--big" type="submit"><span>{tr('Comprar entradas', 'Buy tickets')}</span></button>
            {done ? (
              <div className="form__done" role="status">
                <b>{tr('Todo correcto. Esto es una maqueta: no se ha vendido ni cobrado nada.', 'All good. This is a mock-up: nothing was sold or charged.')}</b>
                <p>{tr('En la versión real pasarías ahora al pago y recibirías las entradas con su código QR.', 'In the live version you would now go to payment and receive your tickets with their QR code.')}</p>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
