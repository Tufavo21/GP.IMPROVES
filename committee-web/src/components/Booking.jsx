import { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { langStore, nightStore, useStore, useTr } from '../lib/store.js';
import { DAY, RULES, upcomingNights, fmtDate, eur, quote } from '../lib/nights.js';
import { TABLES, ZONES, BOTTLES, MENU_CATEGORIES, priceFor } from '../content/data.js';

export const MIN_TEXT = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CAT_EN = { Ginebra: 'Gin', Vodka: 'Vodka', Ron: 'Rum', Whisky: 'Whisky', Tequila: 'Tequila', Licores: 'Liqueurs', Champán: 'Champagne' };
const VIEW = { first: [1000, 620], upper: [1000, 420] };
const zoneName = (id) => ZONES.find((z) => z.id === id).name;

export function ageOn(birth, dateISO) {
  const b = new Date(`${birth}T12:00:00`); const d = new Date(`${dateISO}T12:00:00`);
  let a = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) a -= 1;
  return a;
}

// Validadores compartidos con la lista. Devuelven un código que la interfaz traduce.
export const CHECK = {
  name: (v) => { const s = v.trim(); return !s ? 'required' : s.length < 2 ? 'name' : null; },
  email: (v) => { const s = v.trim(); return !s ? 'required' : !EMAIL_RE.test(s) ? 'email' : null; },
  phone: (v) => { const s = v.replace(/[\s.\-()]/g, ''); return !s ? 'required' : !/^\+?\d{9,15}$/.test(s) ? 'phone' : null; },
  birth: (v) => (!v ? 'required' : Number.isNaN(new Date(v).getTime()) || new Date(v) > new Date() ? 'birth' : null),
  text: (v) => { const s = v.trim(); return !s ? 'required' : s.length < MIN_TEXT ? 'minLen' : s.length > 600 ? 'maxLen' : null; },
  consent: (v) => (v === true ? null : 'consent'),
};

export function useErrorText() {
  const tr = useTr();
  return (code, extra) => ({
    required: tr('Este campo es obligatorio.', 'This field is required.'),
    name: tr('Escribe tu nombre completo.', 'Enter your full name.'),
    email: tr('Revisa el correo: falta algo, por ejemplo la @ o el dominio.', 'Check the email: something is missing, such as the @ or the domain.'),
    phone: tr('Escribe un teléfono de 9 a 15 cifras, con prefijo si no es español.', 'Enter a phone number of 9 to 15 digits, with country code if not Spanish.'),
    birth: tr('Elige una fecha de nacimiento válida.', 'Pick a valid date of birth.'),
    minLen: tr(`Cuéntanos un poco más: mínimo ${MIN_TEXT} caracteres.`, `Tell us a bit more: at least ${MIN_TEXT} characters.`),
    maxLen: tr('Máximo 600 caracteres.', '600 characters at most.'),
    consent: tr('Necesitamos tu aceptación para continuar.', 'We need your consent to continue.'),
    age: tr(`Esa noche la edad mínima es de ${extra} años.`, `The minimum age that night is ${extra}.`),
    table: tr('Elige una mesa en el plano o en la lista.', 'Pick a table on the plan or from the list.'),
  }[code]);
}

export function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field${error ? ' field--bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
      {error ? <p className="field__err" id={`${id}-err`} role="alert">{error}</p> : null}
    </div>
  );
}
export const aria = (id, error, hint) => ({ 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined });

function Plan({ floor, type, selected, onSelect, lang }) {
  const tr = useTr();
  const [w, h] = VIEW[floor];
  const tables = TABLES.filter((t) => t.floor === floor);
  return (
    <svg className="plan" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={tr('Plano de mesas', 'Table plan')}>
      <rect className="plan__room" x="30" y="30" width={w - 60} height={h - 60} rx="8" />
      {floor === 'first' ? (
        <>
          <rect className="plan__block" x="400" y="150" width="200" height="46" rx="4" />
          <text className="plan__label" x="500" y="180" textAnchor="middle">{tr('CABINA', 'BOOTH')}</text>
          <text className="plan__ghost" x="500" y="375" textAnchor="middle">{tr('PISTA', 'FLOOR')}</text>
          <text className="plan__zone" x="500" y="72" textAnchor="middle">PRINCIPAL</text>
          <text className="plan__zone" x="92" y="345" textAnchor="middle" transform="rotate(-90 92 345)">TARIMA</text>
          <text className="plan__zone" x="908" y="345" textAnchor="middle" transform="rotate(90 908 345)">TARIMA</text>
          <text className="plan__zone" x="500" y="512" textAnchor="middle">GHOST</text>
        </>
      ) : (
        <>
          <text className="plan__zone" x="500" y="52" textAnchor="middle">PETIT COMITÉ</text>
          <rect className="plan__block" x="60" y="120" width="60" height="180" rx="4" />
          <text className="plan__label" x="90" y="215" textAnchor="middle" transform="rotate(-90 90 215)">{tr('BARRA', 'BAR')}</text>
        </>
      )}
      {tables.map((t) => {
        const on = selected === t.id;
        const label = `${tr('Mesa', 'Table')} ${t.id}, ${zoneName(t.zone)}, ${eur(priceFor(t, type), lang)}`;
        return (
          <g key={t.id} className={`plan__t${on ? ' is-on' : ''}`} role="button" tabIndex={0} aria-pressed={on} aria-label={label}
            onClick={() => onSelect(t.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}>
            <circle cx={t.x} cy={t.y} r="30" className="plan__hit" />
            <circle cx={t.x} cy={t.y} r="21" className="plan__dot" />
            <text x={t.x} y={t.y + 5} textAnchor="middle">{t.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Booking({ pick }) {
  const tr = useTr();
  const lang = useStore(langStore);
  const errText = useErrorText();
  const nights = useMemo(() => upcomingNights(6), []);
  const night = useStore(nightStore);
  const [date, setDate] = useState(() => nights[0]?.date);
  const [floor, setFloor] = useState('first');
  const [tableId, setTableId] = useState(null);
  const [guests, setGuests] = useState(RULES.baseGuests);
  const [cart, setCart] = useState({});
  const [cat, setCat] = useState(MENU_CATEGORIES[0]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', birth: '', text: '', consent: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const formRef = useRef(null);

  const current = nights.find((n) => n.date === date) || nights[0];
  const type = current?.type || 'thu';

  // La noche elegida en «La semana» mueve la fecha; elegir fecha aquí tiñe la web.
  useEffect(() => {
    if (current && night !== current.type) {
      const n = nights.find((x) => x.type === night);
      if (n) setDate(n.date);
    }
  }, [night]); // eslint-disable-line react-hooks/exhaustive-deps
  // Llegada desde un cartel de zona.
  useEffect(() => {
    if (!pick) return;
    setFloor(pick.zone.floor);
    const first = TABLES.find((t) => t.zone === pick.zone.id);
    if (first) setTableId(first.id);
  }, [pick]);

  const table = TABLES.find((t) => t.id === tableId) || null;
  const lines = BOTTLES.filter((b) => cart[b.id]).map((b) => ({ ...b, qty: cart[b.id] }));
  const q = table ? quote(table, type, guests, lines) : null;
  const add = (id, d) => setCart((c) => { const n = Math.max(0, Math.min(9, (c[id] || 0) + d)); const next = { ...c }; if (n) next[id] = n; else delete next[id]; return next; });
  const set = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined })); setDone(false); };
  const selectTable = (id) => { setTableId(id); const t = TABLES.find((x) => x.id === id); if (t) setFloor(t.floor); setErrors((er) => ({ ...er, table: undefined })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!table) er.table = 'table';
    for (const k of ['name', 'phone', 'email', 'birth', 'text', 'consent']) { const c = CHECK[k](form[k]); if (c) er[k] = c; }
    if (!er.birth && current && ageOn(form.birth, current.date) < RULES.minAge[type]) er.birth = 'age';
    setErrors(er);
    const firstBad = ['table', 'name', 'phone', 'email', 'birth', 'text', 'consent'].find((k) => er[k]);
    if (firstBad) {
      const el = firstBad === 'table' ? document.getElementById('bk-table') : formRef.current.querySelector(`[name="${firstBad}"]`);
      el?.focus();
      return;
    }
    setDone(true); // Maqueta: no hay envío real ni cobro.
  };
  const e = (k) => (errors[k] ? errText(errors[k], RULES.minAge[type]) : null);

  if (!current) {
    return (
      <section className="book" id="reservados" data-tone="dark"><div className="wrap">
        <h2 className="display">{tr('Volvemos en septiembre.', 'Back in September.')}</h2>
      </div></section>
    );
  }

  return (
    <section className="book" id="reservados" data-tone="dark" aria-labelledby="book-title">
      <div className="wrap">
        <Reveal as="h2" id="book-title" className="display" text={tr('Tu mesa y tu botella, en un solo paso.', 'Your table and your bottle, in one step.')} />
        <p className="lead">{tr(
          `Elige noche, mesa y botellas. El precio de la mesa es un consumo mínimo: lo que pidas se descuenta de él. Mesas para ${RULES.baseGuests} personas, con hasta ${RULES.maxExtra} más (+20 % por persona).`,
          `Pick your night, table and bottles. The table price is a minimum spend: what you order counts towards it. Tables seat ${RULES.baseGuests}, with up to ${RULES.maxExtra} more (+20% each).`,
        )}</p>

        <div className="book__dates" role="group" aria-label={tr('Noche', 'Night')}>
          {nights.map((n) => (
            <button type="button" key={n.date} className="datechip" aria-pressed={n.date === current.date}
              onClick={() => { setDate(n.date); nightStore.set(n.type); setDone(false); }}>
              <span>{DAY[n.type].short[lang]}</span><b>{String(n.day).padStart(2, '0')}</b>
            </button>
          ))}
        </div>

        <div className="book__grid">
          <div className="book__main">
            <div className="tabs" role="group" aria-label={tr('Planta', 'Floor')}>
              <button type="button" aria-pressed={floor === 'first'} onClick={() => setFloor('first')}>First Floor</button>
              <button type="button" aria-pressed={floor === 'upper'} onClick={() => setFloor('upper')}>Petit</button>
            </div>
            <Plan floor={floor} type={type} selected={tableId} onSelect={selectTable} lang={lang} />
            <p className="note">{tr('Plano ilustrativo. La disponibilidad se confirma al tramitar la reserva.', 'Illustrative plan. Availability is confirmed when the booking is processed.')}</p>

            <Field id="bk-table" label={tr('Mesa', 'Table')} error={e('table')}>
              <select id="bk-table" value={tableId || ''} onChange={(ev) => selectTable(ev.target.value || null)} {...aria('bk-table', e('table'))}>
                <option value="">{tr('Elige una mesa', 'Pick a table')}</option>
                {ZONES.map((z) => (
                  <optgroup key={z.id} label={z.name}>
                    {TABLES.filter((t) => t.zone === z.id).map((t) => <option key={t.id} value={t.id}>{t.id} · {eur(priceFor(t, type), lang)}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>

            <h3 className="book__h">{tr('Botellas', 'Bottles')}</h3>
            <div className="tabs tabs--wrap" role="group" aria-label={tr('Categoría', 'Category')}>
              {MENU_CATEGORIES.map((c) => <button type="button" key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{lang === 'es' ? c : CAT_EN[c]}</button>)}
            </div>
            <ul className="bottles">
              {BOTTLES.filter((b) => b.category === cat).map((b) => (
                <li key={b.id} className={cart[b.id] ? 'is-in' : ''}>
                  <span className="bottles__name">{b.name}</span>
                  <span className="bottles__price">{eur(b.price, lang)}</span>
                  <span className="qty">
                    <button type="button" onClick={() => add(b.id, -1)} disabled={!cart[b.id]} aria-label={tr(`Quitar ${b.name}`, `Remove ${b.name}`)}>−</button>
                    <output aria-label={tr('Cantidad', 'Quantity')}>{cart[b.id] || 0}</output>
                    <button type="button" onClick={() => add(b.id, 1)} aria-label={tr(`Añadir ${b.name}`, `Add ${b.name}`)}>+</button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="note">{tr('Carta 2026/27 según fuentes públicas. Los destilados incluyen refrescos.', '2026/27 menu from public sources. Spirits include mixers.')}</p>
          </div>

          <aside className="ticket" aria-label={tr('Tu reserva', 'Your booking')}>
            <p className="ticket__night">{fmtDate(current.date, lang)}</p>
            {table ? (
              <>
                <p className="ticket__table"><b>{table.id}</b><span>{zoneName(table.zone)}<br />{table.floor === 'first' ? 'First Floor' : tr('Planta superior', 'Upper floor')}</span></p>
                <div className="ticket__guests">
                  <span>{tr('Personas', 'Guests')}</span>
                  <span className="qty">
                    <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={tr('Una persona menos', 'One guest fewer')}>−</button>
                    <output>{guests}</output>
                    <button type="button" onClick={() => setGuests((g) => Math.min(RULES.baseGuests + RULES.maxExtra, g + 1))} disabled={guests >= RULES.baseGuests + RULES.maxExtra} aria-label={tr('Una persona más', 'One more guest')}>+</button>
                  </span>
                </div>
                <dl className="ticket__lines">
                  <div><dt>{tr('Consumo mínimo', 'Minimum spend')}{q.extra ? ` (+${q.extra})` : ''}</dt><dd>{eur(q.minimum, lang)}</dd></div>
                  {lines.map((b) => <div key={b.id}><dt>{b.qty} × {b.name}</dt><dd>{eur(b.price * b.qty, lang)}</dd></div>)}
                  {lines.length ? <div><dt>{q.remaining ? tr('Te queda por elegir', 'Still to choose') : tr('Mínimo cubierto', 'Minimum covered')}</dt><dd>{q.remaining ? eur(q.remaining, lang) : eur(0, lang)}</dd></div> : null}
                </dl>
                <p className="ticket__total"><span>Total</span><b>{eur(q.total, lang)}</b></p>
                <p className="ticket__dep">{tr(`Señal del ${RULES.depositPct * 100} %`, `${RULES.depositPct * 100}% deposit`)}: <b>{eur(q.deposit, lang)}</b></p>
                {table.estimado ? <p className="note">{tr('Precio estimado para esta mesa.', 'Estimated price for this table.')}</p> : null}
              </>
            ) : <p className="ticket__empty">{tr('Elige una mesa en el plano para ver el precio.', 'Pick a table on the plan to see the price.')}</p>}
          </aside>
        </div>

        <form className="form" ref={formRef} onSubmit={submit} noValidate>
          <h3 className="book__h">{tr('Tus datos', 'Your details')}</h3>
          <div className="form__grid">
            <Field id="bk-name" label={tr('Nombre y apellidos', 'Full name')} error={e('name')}>
              <input id="bk-name" name="name" autoComplete="name" value={form.name} onChange={set('name')} {...aria('bk-name', e('name'))} />
            </Field>
            <Field id="bk-phone" label={tr('Teléfono', 'Phone')} error={e('phone')}>
              <input id="bk-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} {...aria('bk-phone', e('phone'))} />
            </Field>
            <Field id="bk-email" label={tr('Correo electrónico', 'Email')} error={e('email')}>
              <input id="bk-email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} {...aria('bk-email', e('email'))} />
            </Field>
            <Field id="bk-birth" label={tr('Fecha de nacimiento', 'Date of birth')} error={e('birth')} hint={tr(`Edad mínima esa noche: ${RULES.minAge[type]} años.`, `Minimum age that night: ${RULES.minAge[type]}.`)}>
              <input id="bk-birth" name="birth" type="date" autoComplete="bday" value={form.birth} onChange={set('birth')} {...aria('bk-birth', e('birth'), true)} />
            </Field>
            <Field id="bk-text" label={tr('¿Qué celebráis?', 'What are you celebrating?')} error={e('text')} hint={tr(`Cumpleaños, despedida, una noche con amigos… Mínimo ${MIN_TEXT} caracteres.`, `Birthday, send-off, a night with friends… At least ${MIN_TEXT} characters.`)}>
              <textarea id="bk-text" name="text" rows="3" maxLength="600" value={form.text} onChange={set('text')} {...aria('bk-text', e('text'), true)} />
            </Field>
          </div>
          <div className={`check${errors.consent ? ' field--bad' : ''}`}>
            <input id="bk-consent" name="consent" type="checkbox" checked={form.consent} onChange={set('consent')} {...aria('bk-consent', e('consent'))} />
            <label htmlFor="bk-consent">{tr('Acepto que el club use estos datos para gestionar mi reserva.', 'I agree to the club using these details to manage my booking.')}</label>
            {errors.consent ? <p className="field__err" id="bk-consent-err" role="alert">{e('consent')}</p> : null}
          </div>
          <button className="btn btn--acc btn--big" type="submit"><span>{tr('Solicitar reserva', 'Request booking')}</span></button>
          {done && table ? (
            <div className="form__done" role="status">
              <b>{tr('Todo correcto. Esto es una maqueta: no se ha enviado nada ni se ha cobrado la señal.', 'All good. This is a mock-up: nothing was sent and no deposit was charged.')}</b>
              <p>{tr('En la versión real recibirías ahora un enlace de pago de la señal, válido durante', 'In the live version you would now get a deposit payment link, valid for')} {RULES.depositWindowHours} h: {table.id} · {fmtDate(current.date, lang)} · {eur(q.deposit, lang)}.</p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
