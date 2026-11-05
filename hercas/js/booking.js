/* Hercas · reserva de citas en pasos, conectada a n8n. */
(() => {
  'use strict';

  const API_BASE = 'https://suligon.app.n8n.cloud/webhook';

  const root = document.querySelector('[data-booker]');
  if (!root) return;
  const panel = root.querySelector('[data-booker-panel]');
  const stepsNav = root.querySelector('[data-booker-steps]');
  const live = root.querySelector('[data-booker-live]');
  const STEPS = ['servicio', 'peluquero', 'dia', 'hora', 'datos', 'resumen'];
  const FALLBACK_PHONE = '963 52 41 05';

  const T = {
    es: {
      steps: ['Servicio', 'Peluquero', 'Día', 'Hora', 'Datos', 'Confirmar'],
      stepOf: (n, total) => `Paso ${n} de ${total}`,
      goStep: (name) => `Volver al paso ${name}`,
      back: 'Atrás',
      next: 'Continuar',
      loading: 'Cargando…',
      chooseService: 'Elige el servicio',
      chooseBarber: '¿Con quién quieres la cita?',
      any: 'Me da igual',
      anyHint: 'Te asignamos el primero libre',
      chooseDay: 'Elige el día',
      closed: 'Cerrado',
      prevDays: 'Días anteriores',
      nextDays: 'Días siguientes',
      chooseHour: 'Elige la hora',
      morning: 'Mañana',
      afternoon: 'Tarde',
      noSlots: 'Ese día no quedan horas libres, prueba con otro día',
      otherDay: 'Elegir otro día',
      yourData: 'Tus datos',
      name: 'Nombre y apellidos',
      phone: 'Teléfono',
      phoneHint: '9 cifras, por ejemplo 612 345 678',
      email: 'Email',
      privacy: 'He leído y acepto la política de privacidad',
      errName: 'Escribe tu nombre (al menos 2 letras).',
      errPhone: 'Escribe un teléfono de 9 cifras, por ejemplo 612 345 678.',
      errEmail: 'Revisa el email: debe tener la forma nombre@correo.com.',
      errPrivacy: 'Tienes que aceptar la política de privacidad para reservar.',
      errSummary: (n) => (n === 1 ? 'Revisa el campo marcado.' : `Revisa los ${n} campos marcados.`),
      summary: 'Revisa y confirma',
      service: 'Servicio',
      barber: 'Peluquero',
      day: 'Día',
      hour: 'Hora',
      contact: 'Contacto',
      firstFree: 'El primero libre',
      edit: 'Cambiar',
      confirm: 'Confirmar cita',
      sending: 'Confirmando…',
      done: '¡Cita confirmada!',
      doneMail: 'Te hemos enviado un email con los detalles.',
      again: 'Hacer otra reserva',
      taken: 'Esa hora se acaba de ocupar. Te mostramos las horas libres de ese día: elige otra.',
      netError: 'No hemos podido conectar con el sistema de reservas.',
      orCall: 'También puedes llamarnos al',
      retry: 'Reintentar',
      min: (n) => `${n} min`,
      price: (p) => `${p} €`,
      selected: 'seleccionado',
      slotsFor: (d) => `Horas libres el ${d}`,
      announceStep: (n, name) => `Paso ${n}: ${name}`,
      locale: 'es-ES',
    },
    en: {
      steps: ['Service', 'Stylist', 'Day', 'Time', 'Details', 'Confirm'],
      stepOf: (n, total) => `Step ${n} of ${total}`,
      goStep: (name) => `Back to step ${name}`,
      back: 'Back',
      next: 'Continue',
      loading: 'Loading…',
      chooseService: 'Choose the service',
      chooseBarber: 'Who would you like to see?',
      any: 'No preference',
      anyHint: 'We assign the first one available',
      chooseDay: 'Choose the day',
      closed: 'Closed',
      prevDays: 'Previous days',
      nextDays: 'Next days',
      chooseHour: 'Choose the time',
      morning: 'Morning',
      afternoon: 'Afternoon',
      noSlots: 'There are no free times left that day, try another day',
      otherDay: 'Choose another day',
      yourData: 'Your details',
      name: 'Full name',
      phone: 'Phone',
      phoneHint: '9 digits, for example 612 345 678',
      email: 'Email',
      privacy: 'I have read and accept the privacy policy',
      errName: 'Enter your name (at least 2 letters).',
      errPhone: 'Enter a 9-digit phone number, for example 612 345 678.',
      errEmail: 'Check the email: it should look like name@mail.com.',
      errPrivacy: 'You need to accept the privacy policy to book.',
      errSummary: (n) => (n === 1 ? 'Please check the highlighted field.' : `Please check the ${n} highlighted fields.`),
      summary: 'Review and confirm',
      service: 'Service',
      barber: 'Stylist',
      day: 'Day',
      hour: 'Time',
      contact: 'Contact',
      firstFree: 'First one available',
      edit: 'Change',
      confirm: 'Confirm appointment',
      sending: 'Confirming…',
      done: 'Appointment confirmed!',
      doneMail: 'We have sent you an email with the details.',
      again: 'Make another booking',
      taken: 'That time has just been taken. Here are the free times for that day: please choose another.',
      netError: 'We could not connect to the booking system.',
      orCall: 'You can also call us on',
      retry: 'Retry',
      min: (n) => `${n} min`,
      price: (p) => `€${p}`,
      selected: 'selected',
      slotsFor: (d) => `Free times on ${d}`,
      announceStep: (n, name) => `Step ${n}: ${name}`,
      locale: 'en-GB',
    },
  };
  const t = () => T[document.documentElement.lang === 'en' ? 'en' : 'es'];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    step: 0,
    reached: 0,
    config: null,
    servicio: null,
    peluquero: '',
    fecha: null,
    hora: null,
    datos: { nombre: '', telefono: '', email: '', acepta: false },
    slots: null,
    slotsKey: '',
    loading: false,
    error: null,
    notice: '',
    sending: false,
    result: null,
    dayScroll: 0,
  };

  /* ---------- API ---------- */
  async function getJSON(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
    let body = null;
    try { body = await res.json(); } catch { /* respuesta sin JSON */ }
    if (!res.ok) { const err = new Error((body && body.error) || `HTTP ${res.status}`); err.status = res.status; err.body = body; throw err; }
    return body;
  }
  async function postBooking(payload) {
    // text/plain evita el preflight CORS; n8n parsea el JSON igualmente
    const res = await fetch(`${API_BASE}/hercas-reservar`, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) });
    let body = null;
    try { body = await res.json(); } catch { /* respuesta sin JSON */ }
    return { status: res.status, body };
  }

  /* ---------- Fechas (siempre en hora de Madrid) ---------- */
  function madridToday() {
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return p; // YYYY-MM-DD
  }
  const toUTC = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
  const isoOf = (date) => date.toISOString().slice(0, 10);
  const weekdayKey = (iso) => { const d = toUTC(iso).getUTCDay(); return String(d === 0 ? 7 : d); };
  const fmt = (iso, opts) => new Intl.DateTimeFormat(t().locale, { timeZone: 'UTC', ...opts }).format(toUTC(iso));
  const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
  const longDate = (iso) => (isISO(iso) ? fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' }) : String(iso || ''));

  function days() {
    const start = toUTC(madridToday());
    const out = [];
    for (let i = 0; i < (state.config.diasMax || 30); i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const iso = isoOf(d);
      out.push({ iso, open: Boolean(state.config.horario && state.config.horario[weekdayKey(iso)]) });
    }
    return out;
  }

  const service = () => state.config.servicios.find((s) => s.id === state.servicio);
  // la API puede devolver el id o el nombre ya resuelto
  const barberName = (value) => {
    const b = state.config.peluqueros.find((p) => p.id === value || p.nombre === value);
    return b ? b.nombre : value || t().firstFree;
  };
  const serviceName = (value) => {
    const s = state.config.servicios.find((x) => x.id === value || x.nombre === value);
    return s ? s.nombre : value || (service() || {}).nombre || '';
  };

  /* ---------- Render ---------- */
  function renderSteps() {
    const L = t();
    stepsNav.innerHTML = STEPS.map((_, i) => {
      const status = i === state.step ? 'current' : i < state.reached || i < state.step ? 'done' : 'todo';
      const clickable = i < state.step && !state.result && !state.sending;
      const inner = `<span class="booker-step-n" aria-hidden="true">${i + 1}</span><span class="booker-step-label">${L.steps[i]}</span>`;
      return `<li class="booker-step is-${status}"${i === state.step ? ' aria-current="step"' : ''}>${clickable
        ? `<button type="button" data-goto="${i}" aria-label="${esc(L.goStep(L.steps[i]))}">${inner}</button>`
        : `<span>${inner}</span>`}</li>`;
    }).join('');
    stepsNav.setAttribute('aria-label', L.stepOf(Math.min(state.step + 1, STEPS.length), STEPS.length));
    root.querySelector('[data-booker-progress]').textContent = state.result ? '' : L.stepOf(state.step + 1, STEPS.length);
  }

  function errorBox(retryAction) {
    const L = t();
    const phone = (state.config && state.config.telefono) || FALLBACK_PHONE;
    return `<div class="booker-error" role="alert">
      <p>${esc(state.error || L.netError)}</p>
      <p>${L.orCall} <a href="tel:+34${phone.replace(/\s/g, '')}">${esc(phone)}</a>.</p>
      <button type="button" class="btn btn--small" data-action="${retryAction}" aria-label="${L.retry}"><span>${L.retry}</span></button>
    </div>`;
  }

  const heading = (text) => `<h3 class="booker-title" tabindex="-1">${esc(text)}</h3>`;

  function viewServicio() {
    const L = t();
    return heading(L.chooseService) + `<div class="booker-grid booker-grid--services" role="list">${state.config.servicios.map((s) => {
      const on = s.id === state.servicio;
      return `<div role="listitem"><button type="button" class="booker-card${on ? ' is-on' : ''}" data-servicio="${esc(s.id)}" aria-pressed="${on}"
        aria-label="${esc(`${s.nombre}, ${L.min(s.min)}, ${L.price(s.precio)}`)}">
        <span class="booker-card-name">${esc(s.nombre)}</span>
        <span class="booker-card-meta"><span>${L.min(s.min)}</span><strong>${L.price(s.precio)}</strong></span>
      </button></div>`;
    }).join('')}</div>`;
  }

  function viewPeluquero() {
    const L = t();
    const opts = [{ id: '', nombre: L.any, hint: L.anyHint }, ...state.config.peluqueros];
    return heading(L.chooseBarber) + `<div class="booker-grid booker-grid--barbers" role="list">${opts.map((p) => {
      const on = p.id === state.peluquero;
      const initial = p.id ? esc(p.nombre.trim()[0]) : '✂';
      return `<div role="listitem"><button type="button" class="booker-card booker-card--barber${on ? ' is-on' : ''}" data-peluquero="${esc(p.id)}" aria-pressed="${on}" aria-label="${esc(p.nombre)}">
        <span class="booker-avatar" aria-hidden="true">${initial}</span>
        <span class="booker-card-name">${esc(p.nombre)}</span>
        ${p.hint ? `<span class="booker-card-hint">${esc(p.hint)}</span>` : ''}
      </button></div>`;
    }).join('')}</div>`;
  }

  function viewDia() {
    const L = t();
    const list = days();
    return heading(L.chooseDay) + `<div class="booker-days">
      <button type="button" class="booker-days-arrow" data-scroll="-1" aria-label="${L.prevDays}">‹</button>
      <div class="booker-days-track" data-days-track>
        ${list.map((d) => {
          const on = d.iso === state.fecha;
          const label = `${longDate(d.iso)}${d.open ? '' : `, ${L.closed}`}`;
          return `<button type="button" class="booker-day${on ? ' is-on' : ''}" data-fecha="${d.iso}" ${d.open ? '' : 'disabled'} aria-pressed="${on}" aria-label="${esc(label)}">
            <span class="booker-day-wd">${esc(fmt(d.iso, { weekday: 'short' }).replace('.', ''))}</span>
            <span class="booker-day-n">${esc(fmt(d.iso, { day: 'numeric' }))}</span>
            <span class="booker-day-m">${d.open ? esc(fmt(d.iso, { month: 'short' }).replace('.', '')) : L.closed}</span>
          </button>`;
        }).join('')}
      </div>
      <button type="button" class="booker-days-arrow" data-scroll="1" aria-label="${L.nextDays}">›</button>
    </div>`;
  }

  function viewHora() {
    const L = t();
    let body;
    if (state.loading) {
      body = `<div class="booker-slots" aria-hidden="true">${'<span class="booker-skel"></span>'.repeat(12)}</div>`;
    } else if (state.error) {
      body = errorBox('reload-slots');
    } else if (!state.slots || !state.slots.length) {
      body = `<div class="booker-empty"><p>${L.noSlots}</p><button type="button" class="btn btn--small" data-goto="2" aria-label="${L.otherDay}"><span>${L.otherDay}</span></button></div>`;
    } else {
      const groups = [[L.morning, state.slots.filter((s) => s.hora < '14:00')], [L.afternoon, state.slots.filter((s) => s.hora >= '14:00')]];
      body = groups.filter(([, g]) => g.length).map(([name, g]) => `<p class="booker-slot-group">${name}</p>
        <div class="booker-slots" role="list" aria-label="${esc(name)}">${g.map((s) => {
          const on = s.hora === state.hora;
          return `<div role="listitem"><button type="button" class="booker-slot${on ? ' is-on' : ''}" data-hora="${esc(s.hora)}" aria-pressed="${on}" aria-label="${esc(`${s.hora}, ${longDate(state.fecha)}`)}">${esc(s.hora)}</button></div>`;
        }).join('')}</div>`).join('');
    }
    const notice = state.notice ? `<p class="booker-notice" role="alert">${esc(state.notice)}</p>` : '';
    return heading(L.chooseHour) + `<p class="booker-sub">${esc(L.slotsFor(longDate(state.fecha)))} · ${esc(service().nombre)} · ${esc(barberName(state.peluquero))}</p>${notice}<div aria-busy="${state.loading}">${body}</div>`;
  }

  function viewDatos() {
    const L = t();
    const d = state.datos;
    return heading(L.yourData) + `<form class="booker-form form" data-datos novalidate>
      <div class="field">
        <label for="b-nombre">${L.name}</label>
        <input id="b-nombre" name="nombre" type="text" autocomplete="name" required minlength="2" maxlength="80" value="${esc(d.nombre)}" aria-describedby="b-nombre-err" />
        <p class="field-error" id="b-nombre-err" aria-live="polite"></p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="b-telefono">${L.phone}</label>
          <input id="b-telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required value="${esc(d.telefono)}" aria-describedby="b-telefono-hint b-telefono-err" />
          <p class="field-hint" id="b-telefono-hint">${L.phoneHint}</p>
          <p class="field-error" id="b-telefono-err" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="b-email">${L.email}</label>
          <input id="b-email" name="email" type="email" inputmode="email" autocomplete="email" required value="${esc(d.email)}" aria-describedby="b-email-err" />
          <p class="field-error" id="b-email-err" aria-live="polite"></p>
        </div>
      </div>
      <div class="field field--check">
        <input id="b-acepta" name="acepta" type="checkbox" required ${d.acepta ? 'checked' : ''} aria-describedby="b-acepta-err" />
        <label for="b-acepta">${L.privacy}</label>
        <p class="field-error" id="b-acepta-err" aria-live="polite"></p>
      </div>
      <p class="booker-form-status" data-form-status role="status" aria-live="polite"></p>
      <button type="submit" hidden></button>
    </form>`;
  }

  function viewResumen() {
    const L = t();
    const s = service();
    const d = state.datos;
    const row = (label, value, goto) => `<div class="booker-sum-row"><dt>${label}</dt><dd>${value}</dd>
      <dd class="booker-sum-edit"><button type="button" class="link-arrow booker-edit" data-goto="${goto}" aria-label="${esc(`${L.edit}: ${label}`)}">${L.edit}</button></dd></div>`;
    const err = state.error ? (state.errorKind === 'net' ? errorBox('confirm') : `<p class="booker-notice" role="alert">${esc(state.error)}</p>`) : '';
    return heading(L.summary) + `<dl class="booker-sum">
        ${row(L.service, `${esc(s.nombre)} <span class="booker-sum-meta">${L.min(s.min)} · ${L.price(s.precio)}</span>`, 0)}
        ${row(L.barber, esc(barberName(state.peluquero)), 1)}
        ${row(L.day, esc(longDate(state.fecha)), 2)}
        ${row(L.hour, esc(state.hora), 3)}
        ${row(L.contact, `${esc(d.nombre)}<br><span class="booker-sum-meta">${esc(d.telefono)} · ${esc(d.email)}</span>`, 4)}
      </dl>${err}`;
  }

  function viewFinal() {
    const L = t();
    const r = state.result;
    // el día que se envió (ISO) se formatea en el idioma de la página; la API lo devuelve ya en texto
    const fecha = isISO(r.fecha) ? r.fecha : state.fecha;
    return `<div class="booker-done">
      <span class="booker-done-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      ${heading(L.done)}
      <dl class="booker-sum booker-sum--done">
        <div class="booker-sum-row"><dt>${L.service}</dt><dd>${esc(serviceName(r.servicio || state.servicio))}</dd></div>
        <div class="booker-sum-row"><dt>${L.barber}</dt><dd>${esc(barberName(r.peluquero || state.peluquero))}</dd></div>
        <div class="booker-sum-row"><dt>${L.day}</dt><dd>${esc(longDate(fecha))}</dd></div>
        <div class="booker-sum-row"><dt>${L.hour}</dt><dd>${esc(r.hora || state.hora)}</dd></div>
      </dl>
      <p class="booker-done-mail">${L.doneMail}</p>
      <button type="button" class="btn btn--red" data-action="again" aria-label="${L.again}"><span>${L.again}</span></button>
    </div>`;
  }

  function renderNav() {
    const L = t();
    const nav = root.querySelector('[data-booker-nav]');
    if (state.result || !state.config) { nav.innerHTML = ''; return; }
    const canNext = canContinue();
    const isLast = state.step === STEPS.length - 1;
    const back = state.step > 0 ? `<button type="button" class="btn btn--small booker-back" data-action="back" aria-label="${L.back}" ${state.sending ? 'disabled' : ''}><span>← ${L.back}</span></button>` : '<span></span>';
    const next = isLast
      ? `<button type="button" class="btn btn--red booker-confirm${state.sending ? ' is-busy' : ''}" data-action="confirm" ${state.sending ? 'disabled aria-busy="true"' : ''} aria-label="${state.sending ? L.sending : L.confirm}"><span>${state.sending ? `<span class="booker-spinner" aria-hidden="true"></span>${L.sending}` : L.confirm}</span></button>`
      : `<button type="button" class="btn btn--red" data-action="next" aria-label="${L.next}" ${canNext ? '' : 'disabled'}><span>${L.next} →</span></button>`;
    nav.innerHTML = back + next;
  }

  function canContinue() {
    switch (STEPS[state.step]) {
      case 'servicio': return Boolean(state.servicio);
      case 'peluquero': return true;
      case 'dia': return Boolean(state.fecha);
      case 'hora': return Boolean(state.hora);
      case 'datos': return true;
      default: return true;
    }
  }

  function render({ focus = false } = {}) {
    if (!state.config) {
      panel.innerHTML = state.error ? errorBox('reload-config') : `<div class="booker-grid booker-grid--services" aria-hidden="true">${'<span class="booker-skel booker-skel--card"></span>'.repeat(5)}</div>`;
      stepsNav.innerHTML = '';
      renderNav();
      return;
    }
    renderSteps();
    const views = { servicio: viewServicio, peluquero: viewPeluquero, dia: viewDia, hora: viewHora, datos: viewDatos, resumen: viewResumen };
    panel.innerHTML = state.result ? viewFinal() : views[STEPS[state.step]]();
    renderNav();
    root.classList.toggle('is-done', Boolean(state.result));
    if (STEPS[state.step] === 'dia' && !state.result) restoreDayScroll();
    if (focus) {
      const h = panel.querySelector('.booker-title');
      if (h) h.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) root.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function announce(msg) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); }

  function go(step) {
    state.step = Math.max(0, Math.min(STEPS.length - 1, step));
    state.reached = Math.max(state.reached, state.step);
    state.error = null;
    render({ focus: true });
    announce(t().announceStep(state.step + 1, t().steps[state.step]));
    if (STEPS[state.step] === 'hora') loadSlots();
  }

  /* ---------- Día: fila deslizable ---------- */
  function restoreDayScroll() {
    const track = panel.querySelector('[data-days-track]');
    if (!track) return;
    const on = track.querySelector('.is-on');
    if (state.dayScroll) track.scrollLeft = state.dayScroll;
    else if (on) track.scrollLeft = on.offsetLeft - track.clientWidth / 2 + on.offsetWidth / 2;
    track.addEventListener('scroll', () => { state.dayScroll = track.scrollLeft; }, { passive: true });
  }

  /* ---------- Huecos ---------- */
  async function loadSlots(force = false) {
    const key = `${state.fecha}|${state.servicio}|${state.peluquero}`;
    if (!force && state.slots && state.slotsKey === key) { render(); return; }
    state.loading = true;
    state.error = null;
    state.slots = null;
    render();
    try {
      const qs = new URLSearchParams({ fecha: state.fecha, servicio: state.servicio });
      if (state.peluquero) qs.set('peluquero', state.peluquero);
      const data = await getJSON(`/hercas-disponibilidad?${qs}`);
      if (key !== `${state.fecha}|${state.servicio}|${state.peluquero}`) return; // el usuario cambió de día mientras cargaba
      state.slots = Array.isArray(data.huecos) ? data.huecos : [];
      state.slotsKey = key;
      if (state.hora && !state.slots.some((s) => s.hora === state.hora)) state.hora = null;
    } catch (err) {
      state.error = err.status === 400 && err.body && err.body.error ? err.body.error : t().netError;
    } finally {
      state.loading = false;
      if (STEPS[state.step] === 'hora') render();
      if (!state.error && state.slots && !state.slots.length) announce(t().noSlots);
    }
  }

  /* ---------- Datos ---------- */
  const RULES = {
    nombre: (v) => (v.trim().length >= 2 && /\p{L}/u.test(v) ? null : 'errName'),
    telefono: (v) => (/^[6789]\d{8}$/.test(v.replace(/[\s.\-()]/g, '').replace(/^(\+34|0034)/, '')) ? null : 'errPhone'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'errEmail'),
    acepta: (_, el) => (el.checked ? null : 'errPrivacy'),
  };
  function readDatos(form) {
    state.datos = {
      nombre: form.nombre.value,
      telefono: form.telefono.value,
      email: form.email.value,
      acepta: form.acepta.checked,
    };
  }
  function validateField(form, name) {
    const el = form.elements[name];
    const code = RULES[name](el.value, el);
    el.setAttribute('aria-invalid', code ? 'true' : 'false');
    form.querySelector(`#b-${name}-err`).textContent = code ? t()[code] : '';
    const status = form.querySelector('[data-form-status]');
    if (status.textContent) {
      const left = form.querySelectorAll('[aria-invalid="true"]').length;
      status.textContent = left ? t().errSummary(left) : '';
    }
    return !code;
  }
  function submitDatos() {
    const form = panel.querySelector('[data-datos]');
    readDatos(form);
    const bad = Object.keys(RULES).filter((n) => !validateField(form, n));
    const status = form.querySelector('[data-form-status]');
    if (bad.length) {
      status.textContent = t().errSummary(bad.length);
      status.classList.add('is-error');
      form.elements[bad[0]].focus();
      return;
    }
    go(5);
  }

  /* ---------- Confirmar ---------- */
  async function confirm() {
    if (state.sending) return;
    state.sending = true;
    state.error = null;
    render();
    const d = state.datos;
    const payload = {
      nombre: d.nombre.trim(),
      email: d.email.trim(),
      telefono: d.telefono.replace(/[\s.\-()]/g, ''),
      servicio: state.servicio,
      peluquero: state.peluquero || '',
      inicio: `${state.fecha}T${state.hora}`,
      acepta: true,
    };
    try {
      const { status, body } = await postBooking(payload);
      state.sending = false;
      if (status === 200 && body && body.ok) {
        state.result = body;
        try { render({ focus: true }); } catch { state.result = { ...body, fecha: state.fecha, hora: state.hora }; render({ focus: true }); }
        announce(`${t().done} ${t().doneMail}`);
        return;
      }
      if (status === 409) {
        state.hora = null;
        state.notice = t().taken;
        state.step = 3;
        render({ focus: true });
        announce(t().taken);
        await loadSlots(true);
        return;
      }
      state.errorKind = 'data';
      state.error = (body && body.error) || t().netError;
      if (status >= 500) state.errorKind = 'net';
      render();
      announce(state.error);
    } catch {
      state.sending = false;
      state.errorKind = 'net';
      state.error = t().netError;
      render();
      announce(state.error);
    }
  }

  /* ---------- Eventos ---------- */
  root.addEventListener('click', (e) => {
    const el = e.target.closest('button');
    if (!el || el.disabled || !root.contains(el)) return;
    if (el.dataset.goto != null) { state.notice = ''; go(Number(el.dataset.goto)); return; }
    if (el.dataset.servicio != null) {
      if (state.servicio !== el.dataset.servicio) { state.servicio = el.dataset.servicio; state.hora = null; state.slots = null; }
      go(1); return;
    }
    if (el.dataset.peluquero != null) {
      if (state.peluquero !== el.dataset.peluquero) { state.peluquero = el.dataset.peluquero; state.hora = null; state.slots = null; }
      go(2); return;
    }
    if (el.dataset.fecha != null) {
      if (state.fecha !== el.dataset.fecha) { state.fecha = el.dataset.fecha; state.hora = null; state.slots = null; }
      state.notice = '';
      go(3); return;
    }
    if (el.dataset.hora != null) { state.hora = el.dataset.hora; state.notice = ''; go(4); return; }
    if (el.dataset.scroll != null) {
      const track = panel.querySelector('[data-days-track]');
      track.scrollBy({ left: Number(el.dataset.scroll) * track.clientWidth * 0.8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    switch (el.dataset.action) {
      case 'back':
        if (STEPS[state.step] === 'datos') readDatos(panel.querySelector('[data-datos]'));
        state.notice = '';
        go(state.step - 1); break;
      case 'next':
        if (STEPS[state.step] === 'datos') submitDatos();
        else go(state.step + 1);
        break;
      case 'confirm': confirm(); break;
      case 'reload-slots': loadSlots(true); break;
      case 'reload-config': loadConfig(); break;
      case 'again':
        Object.assign(state, { step: 0, reached: 0, servicio: null, peluquero: '', fecha: null, hora: null, slots: null, slotsKey: '', result: null, error: null, notice: '', dayScroll: 0 });
        render({ focus: true }); break;
      default: break;
    }
  });
  root.addEventListener('submit', (e) => { e.preventDefault(); submitDatos(); });
  // los errores se corrigen mientras se escribe (no al salir del campo: el aviso que desaparece
  // movería la casilla de privacidad justo cuando se va a pulsar)
  root.addEventListener('input', (e) => {
    const form = e.target.form;
    if (form && form.matches('[data-datos]') && RULES[e.target.name] && e.target.getAttribute('aria-invalid') === 'true') validateField(form, e.target.name);
  });
  root.addEventListener('change', (e) => {
    const form = e.target.form;
    if (form && form.matches('[data-datos]') && e.target.name === 'acepta') validateField(form, 'acepta');
  });

  // al cambiar de idioma se vuelven a pintar los textos del asistente
  new MutationObserver(() => {
    if (STEPS[state.step] === 'datos' && panel.querySelector('[data-datos]')) readDatos(panel.querySelector('[data-datos]'));
    render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  async function loadConfig() {
    state.error = null;
    render();
    try {
      const cfg = await getJSON('/hercas-servicios');
      if (!cfg || !Array.isArray(cfg.servicios) || !Array.isArray(cfg.peluqueros)) throw new Error('config');
      state.config = cfg;
    } catch {
      state.error = t().netError;
    }
    render();
  }

  loadConfig();
})();
