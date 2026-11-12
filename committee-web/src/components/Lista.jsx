import { useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { useTr } from '../lib/store.js';
import { CHECK, Field, aria, useErrorText } from './Booking.jsx';

// La lista: recoge cumpleaños y sala preferida, la base de las campañas de cumpleaños y
// de reactivación con enlace exclusivo.
export default function Lista() {
  const tr = useTr();
  const errText = useErrorText();
  const ref = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', birth: '', room: '', consent: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const set = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined })); setDone(false); };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    for (const k of ['name', 'email', 'birth', 'consent']) { const c = CHECK[k](form[k]); if (c) er[k] = c; }
    if (!form.room) er.room = 'required';
    setErrors(er);
    const bad = ['name', 'email', 'birth', 'room', 'consent'].find((k) => er[k]);
    if (bad) { ref.current.querySelector(`[name="${bad}"]`)?.focus(); return; }
    setDone(true); // Maqueta: sin envío real.
  };
  const e = (k) => (errors[k] ? errText(errors[k]) : null);
  return (
    <section className="lista" id="lista" data-tone="dark" aria-labelledby="lista-title">
      <div className="wrap lista__grid">
        <div>
          <Reveal as="h2" id="lista-title" className="display" text={tr('Tu cumpleaños, con mesa.', 'Your birthday, with a table.')} />
          <p className="lead">{tr(
            'Apúntate a la lista. La semana de tu cumpleaños te llega un enlace solo para ti, con una ventaja en mesa o en entrada para esa noche. Y si hace tiempo que no venís, os avisamos cuando haya algo que merezca la vuelta.',
            'Join the list. In your birthday week you get a link made just for you, with a perk on a table or entry for that night. And if it has been a while, we will let you know when there is something worth coming back for.',
          )}</p>
          <ul className="lista__points">
            <li>{tr('Un enlace por persona, válido solo esa noche.', 'One link per person, valid that night only.')}</li>
            <li>{tr('Como mucho un mensaje al mes.', 'One message a month at most.')}</li>
            <li>{tr('Te das de baja con un toque.', 'Unsubscribe with one tap.')}</li>
          </ul>
          <p className="note">{tr('Función propuesta, pendiente de aprobación del club.', 'Proposed feature, pending the club’s approval.')}</p>
        </div>
        <form className="form" ref={ref} onSubmit={submit} noValidate>
          <Field id="ls-name" label={tr('Nombre', 'Name')} error={e('name')}>
            <input id="ls-name" name="name" autoComplete="given-name" value={form.name} onChange={set('name')} {...aria('ls-name', e('name'))} />
          </Field>
          <Field id="ls-email" label={tr('Correo electrónico', 'Email')} error={e('email')}>
            <input id="ls-email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} {...aria('ls-email', e('email'))} />
          </Field>
          <Field id="ls-birth" label={tr('Cumpleaños', 'Birthday')} error={e('birth')}>
            <input id="ls-birth" name="birth" type="date" autoComplete="bday" value={form.birth} onChange={set('birth')} {...aria('ls-birth', e('birth'))} />
          </Field>
          <fieldset className={`field${errors.room ? ' field--bad' : ''}`}>
            <legend>{tr('¿Qué sala es más tuya?', 'Which room is more you?')}</legend>
            <div className="radios">
              <label><input type="radio" name="room" value="first" checked={form.room === 'first'} onChange={set('room')} /> <span>First Floor · {tr('reguetón y comercial', 'reggaeton and commercial')}</span></label>
              <label><input type="radio" name="room" value="petit" checked={form.room === 'petit'} onChange={set('room')} /> <span>Petit · hip-hop {tr('y', 'and')} R&amp;B</span></label>
            </div>
            {errors.room ? <p className="field__err" role="alert">{tr('Elige una sala.', 'Pick a room.')}</p> : null}
          </fieldset>
          <div className={`check${errors.consent ? ' field--bad' : ''}`}>
            <input id="ls-consent" name="consent" type="checkbox" checked={form.consent} onChange={set('consent')} {...aria('ls-consent', e('consent'))} />
            <label htmlFor="ls-consent">{tr('Quiero recibir mensajes del club y acepto el uso de mis datos para ello.', 'I want to receive messages from the club and agree to my data being used for that.')}</label>
            {errors.consent ? <p className="field__err" id="ls-consent-err" role="alert">{e('consent')}</p> : null}
          </div>
          <button className="btn btn--acc btn--big" type="submit"><span>{tr('Entrar en la lista', 'Join the list')}</span></button>
          {done ? <div className="form__done" role="status"><b>{tr('Todo correcto. Esto es una maqueta: no se ha guardado ningún dato.', 'All good. This is a mock-up: no data was saved.')}</b></div> : null}
        </form>
      </div>
    </section>
  );
}
