/* Hercas Peluqueros · interacción y movimiento en JS puro
   - Ticker rAF único + muelles: parallax (M19), contador (M22), marquesina
   - Reveal de titulares letra a letra con blur (M15)
   - Trayectoria con rail que se rellena + plates escalonadas (M6)
   - Mira que traza la visita 1 → 4 sobre halftone (M5)
   - Transiciones de píxeles entre bloques de color (M4)
   - Cabecera fija con logo siempre visible y barra con muelle
   - Mapa interactivo (Leaflet + OSM) que abre la ruta en Google Maps
   - Selector ES/EN, horario de hoy, validación del formulario */
(() => {
  'use strict';

  const DICT = window.HERCAS_I18N;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wideQuery = window.matchMedia('(min-width: 901px)');
  let reduced = motionQuery.matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const COLORS = { light: '#f7f1ef', dark: '#171314', red: '#c40f1d' };
  document.documentElement.classList.toggle('motion-ok', !reduced);
  let running = false; // estado del ticker (antes de cualquier wake())
  let lastT = 0;

  /* ---------------------------------------------------------------
     Idioma
     --------------------------------------------------------------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento: no pasa nada */ } },
  };
  const textNodes = $$('[data-i18n]');
  const attrNodes = $$('[data-i18n-attr]');
  const es = {};
  textNodes.forEach((el) => { es[el.dataset.i18n] = el.innerHTML; });
  const esAttr = new Map();
  attrNodes.forEach((el) => {
    const pairs = el.dataset.i18nAttr.split(',').map((p) => p.trim().split(':'));
    esAttr.set(el, pairs.map(([attr, key]) => [attr, key, el.getAttribute(attr)]));
  });
  let lang = 'es';
  const ui = () => DICT.ui[lang];

  function applyLang(next, { initial = false } = {}) {
    lang = next === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    textNodes.forEach((el) => {
      const key = el.dataset.i18n;
      const html = lang === 'es' ? es[key] : DICT.en[key];
      if (html != null) el.innerHTML = html;
    });
    esAttr.forEach((pairs, el) => {
      pairs.forEach(([attr, key, esVal]) => {
        const v = lang === 'es' ? esVal : DICT.en[key];
        if (v != null) el.setAttribute(attr, v);
      });
    });
    document.title = DICT.meta[lang].title;
    $('meta[name="description"]').setAttribute('content', DICT.meta[lang].description);
    $$('.lang-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const track = $('[data-ticker]');
    if (track && track._clone) track._clone.innerHTML = track.innerHTML; // la copia del bucle también cambia de idioma
    if (!initial) {
      store.set('hercas-lang', lang);
      prepareHeadings({ revealAll: true });
      updateToday();
      updateMenuLabel();
      route.relabel();
      wake();
    }
  }

  /* ---------------------------------------------------------------
     Reveal letra a letra + blur (M15)
     El texto completo queda en un span accesible; las letras son decorativas.
     La visibilidad se comprueba midiendo en el ticker (no IntersectionObserver):
     así los saltos instantáneos de scroll (anclas, restauración) nunca dejan
     un titular oculto.
     --------------------------------------------------------------- */
  const headings = $$('.reveal-type');
  const pendingHeadings = new Set();

  function splitHeading(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    const chars = [];
    const build = (node, parent) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            for (const ch of part) {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              chars.push(c);
              w.appendChild(c);
            }
            parent.appendChild(w);
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const clone = child.cloneNode(false);
          build(child, clone);
          parent.appendChild(clone);
        }
      });
    };
    build(el, visual);
    const step = clamp(900 / Math.max(chars.length, 1), 12, 30);
    chars.forEach((c, n) => c.style.setProperty('--d', `${Math.round(Math.min(n * step, 1000))}ms`));
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.replaceChildren(sr, visual);
  }

  function reveal(el) {
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  }

  function prepareHeadings({ revealAll = false } = {}) {
    pendingHeadings.clear();
    headings.forEach((el) => {
      el.classList.remove('is-armed', 'is-in');
      splitHeading(el);
    });
    if (reduced || revealAll) return; // visible y quieto
    const vh = window.innerHeight;
    headings.forEach((el) => {
      if (el.id === 'hero-title') {
        el.classList.add('is-armed');
        reveal(el);
        setTimeout(() => el.classList.add('is-in'), 2500); // red de seguridad
      } else if (el.getBoundingClientRect().top > vh * 0.9) {
        el.classList.add('is-armed'); // solo los que aún no se ven: nada visible desaparece
        pendingHeadings.add(el);
      }
    });
  }

  function checkHeadings(vh) {
    pendingHeadings.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) { reveal(el); pendingHeadings.delete(el); }
    });
  }

  /* ---------------------------------------------------------------
     Muelle (unidades por segundo: k = rigidez, c = amortiguación)
     --------------------------------------------------------------- */
  class Spring {
    constructor(value = 0, { k = 170, c = 26 } = {}) { this.x = value; this.v = 0; this.target = value; this.k = k; this.c = c; }
    step(dt) {
      const a = this.k * (this.target - this.x) - this.c * this.v;
      this.v += a * dt;
      this.x += this.v * dt;
      if (Math.abs(this.target - this.x) < 0.0008 && Math.abs(this.v) < 0.0008) { this.x = this.target; this.v = 0; }
      return this.x;
    }
    get moving() { return this.v !== 0 || this.x !== this.target; }
    snap(v) { this.x = this.target = v; this.v = 0; }
  }

  /* ---------------------------------------------------------------
     Cabecera: logo siempre visible; la barra aparece con muelle
     --------------------------------------------------------------- */
  const header = $('.site-header');
  const headerSpring = new Spring(window.scrollY > 12 ? 1 : 0, { k: 170, c: 24 });
  const surfaces = $$('[data-surface]').filter((el) => el !== header);
  const navLinks = $$('.nav-list a');
  const navTargets = navLinks.map((a) => $(a.getAttribute('href')));

  function updateHeader(dt) {
    headerSpring.target = window.scrollY > 12 ? 1 : 0;
    if (reduced) headerSpring.snap(headerSpring.target); else headerSpring.step(dt);
    header.style.setProperty('--hdr-o', headerSpring.x.toFixed(3));

    const y = (header.offsetHeight || 80) / 2;
    let surface = 'light';
    for (const s of surfaces) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { surface = s.dataset.surface; break; }
    }
    if (header.dataset.surface !== surface) header.dataset.surface = surface;

    const mid = window.innerHeight * 0.4;
    navTargets.forEach((t, i) => {
      if (!t) return;
      const r = t.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) navLinks[i].setAttribute('aria-current', 'true');
      else navLinks[i].removeAttribute('aria-current');
    });
    return headerSpring.moving;
  }

  /* ---------------------------------------------------------------
     Parallax de 2 capas (hero) y panel de cierre (M19 / M9)
     --------------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]').map((el) => ({
    el,
    f: parseFloat(el.dataset.parallax),
    host: el.closest('section') || el.parentElement,
    fade: el.hasAttribute('data-fade'),
    spring: new Spring(0, { k: 120, c: 22 }),
  }));
  function updateParallax(dt, vh) {
    let busy = false;
    parallaxEls.forEach((p) => {
      const r = p.host.getBoundingClientRect();
      if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) return;
      const offset = r.top + r.height / 2 - vh / 2;
      p.spring.target = -offset * p.f;
      const y = p.spring.step(dt);
      if (p.spring.moving) busy = true;
      p.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      if (p.fade) p.el.style.opacity = clamp(1 - Math.max(0, -r.top) / (vh * 0.75)).toFixed(3);
    });
    return busy;
  }

  /* ---------------------------------------------------------------
     Marquesina de servicios (sin cambios de comportamiento)
     --------------------------------------------------------------- */
  const tickerTrack = $('[data-ticker]');
  const tickerBox = tickerTrack ? tickerTrack.parentElement : null;
  let tickerX = 0;
  let tickerVisible = false;
  let lastScrollY = window.scrollY;
  const scrollVel = new Spring(0, { k: 60, c: 16 });
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    clone.removeAttribute('data-ticker');
    clone.setAttribute('aria-hidden', 'true');
    tickerBox.appendChild(clone);
    tickerBox.style.display = 'flex';
    tickerTrack._clone = clone;
  }
  function updateTicker(dt, vh) {
    if (!tickerTrack) return false;
    const r = tickerBox.getBoundingClientRect();
    tickerVisible = r.bottom > 0 && r.top < vh;
    if (!tickerVisible) return false;
    const sy = window.scrollY;
    scrollVel.target = clamp(Math.abs(sy - lastScrollY) / Math.max(dt, 0.001), 0, 3000);
    lastScrollY = sy;
    scrollVel.step(dt);
    const speed = 48 + scrollVel.x * 0.08;
    const w = tickerTrack.offsetWidth;
    tickerX = (tickerX - speed * dt) % w;
    const tf = `translate3d(${tickerX.toFixed(2)}px, 0, 0)`;
    tickerTrack.style.transform = tf;
    tickerTrack._clone.style.transform = tf;
    return true;
  }

  /* ---------------------------------------------------------------
     M6 · Trayectoria: rail que se rellena con el scroll + plates en stagger.
     El contador "+35" avanza con el rail (desktop) o con su propia posición (móvil).
     --------------------------------------------------------------- */
  const timeline = {
    el: $('[data-timeline]'),
    fill: $('[data-rail]'),
    plates: $$('.plate'),
    spring: new Spring(0, { k: 200, c: 30 }),
    countEl: $('[data-counter]'),
    countBox: $('.oficio-count'),
    countSpring: new Spring(0, { k: 90, c: 19 }),
    last: null,
    arm() {
      if (reduced) return;
      const vh = window.innerHeight;
      this.plates.forEach((p) => { if (p.getBoundingClientRect().top > vh * 0.88) p.classList.add('is-armed'); });
    },
    raw(vh) {
      const r = this.el.getBoundingClientRect();
      return clamp((vh * 0.55 - r.top) / r.height);
    },
    countTarget(vh) {
      if (wideQuery.matches) return clamp(this.raw(vh) / 0.85);
      const r = this.countBox.getBoundingClientRect();
      return clamp((vh - r.top) / (vh * 0.8));
    },
    update(dt, vh) {
      if (!this.el) return false;
      const r = this.el.getBoundingClientRect();
      let busy = false;
      if (r.bottom > -vh && r.top < vh * 2) {
        this.spring.target = this.raw(vh);
        if (reduced) this.spring.snap(this.spring.target); else this.spring.step(dt);
        busy = this.spring.moving;
        const p = this.spring.x;
        this.fill.style.transform = `scaleY(${p.toFixed(4)})`;
        const cut = r.top + p * r.height;
        this.plates.forEach((plate) => {
          const pr = plate.getBoundingClientRect();
          if (plate.classList.contains('is-armed') && !plate.classList.contains('is-in') && pr.top < vh * 0.88) plate.classList.add('is-in');
          const on = pr.top + 30 < cut;
          if (on !== plate.classList.contains('is-reached')) plate.classList.toggle('is-reached', on);
        });
      }
      // contador
      this.countSpring.target = this.countTarget(vh);
      if (reduced) this.countSpring.snap(1); else this.countSpring.step(dt);
      if (this.countSpring.moving) busy = true;
      const n = Math.round(easeOutCubic(this.countSpring.x) * parseInt(this.countEl.dataset.to, 10));
      if (n !== this.last) { this.countEl.textContent = String(n); this.last = n; }
      return busy;
    },
  };

  /* ---------------------------------------------------------------
     M4 · Transiciones de píxeles entre bloques de color.
     Cuadrícula con ruido determinista: las celdas del color siguiente
     entran desde abajo en diagonal según avanza el scroll.
     --------------------------------------------------------------- */
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const dissolves = $$('[data-dissolve]').map((el) => {
    const d = { el, canvas: $('canvas', el), from: el.dataset.from, to: el.dataset.to, w: 0, h: 0, dpr: 1, last: -1, spring: new Spring(0, { k: 240, c: 32 }) };
    const fit = () => {
      d.w = el.offsetWidth; d.h = el.offsetHeight;
      d.dpr = Math.min(window.devicePixelRatio || 1, 2);
      d.canvas.width = Math.round(d.w * d.dpr); d.canvas.height = Math.round(d.h * d.dpr);
      d.last = -1;
      wake();
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(el);
    return d;
  });
  function drawDissolve(d, v) {
    const ctx = d.canvas.getContext('2d');
    ctx.setTransform(d.dpr, 0, 0, d.dpr, 0, 0);
    ctx.clearRect(0, 0, d.w, d.h);
    ctx.fillStyle = COLORS[d.to];
    const cell = d.w < 640 ? 18 : 26;
    const cols = Math.ceil(d.w / cell);
    const rows = Math.ceil(d.h / cell);
    for (let j = 0; j < rows; j++) {
      const toEdge = (rows - 1 - j) / Math.max(rows - 1, 1); // las filas de abajo cambian primero
      for (let i = 0; i < cols; i++) {
        const th = toEdge * 0.6 + (i / cols) * 0.3 + hash(i, j) * 0.25;
        if (v * 1.2 > th) ctx.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
      }
    }
  }
  function updateDissolves(dt, vh) {
    let busy = false;
    dissolves.forEach((d) => {
      const r = d.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) {
        // fuera de pantalla: dejarla en su estado final según el lado
        const end = r.bottom < 0 ? 1 : 0;
        if (d.last !== end) { d.spring.snap(end); drawDissolve(d, end); d.last = end; d.el.dataset.surface = end ? d.to : d.from; }
        return;
      }
      const raw = clamp((vh - r.top) / (vh * 0.85 + r.height * 0.3));
      d.spring.target = raw;
      if (reduced) d.spring.snap(raw); else d.spring.step(dt);
      if (d.spring.moving) busy = true;
      const v = d.spring.x;
      if (Math.abs(v - d.last) < 0.002) return;
      d.last = v;
      drawDissolve(d, v);
      const surf = v > 0.5 ? d.to : d.from;
      if (d.el.dataset.surface !== surf) d.el.dataset.surface = surf;
    });
    return busy;
  }

  /* ---------------------------------------------------------------
     M5 · Visita paso a paso: halftone + trazo animado + mira (reticle)
     que va apuntando y trazando del punto 1 al 4 al ritmo del scroll.
     --------------------------------------------------------------- */
  const NODES_WIDE = [[0.08, 0.7], [0.36, 0.26], [0.64, 0.66], [0.92, 0.28]];
  const NODES_TALL = [[0.24, 0.1], [0.76, 0.36], [0.24, 0.62], [0.76, 0.86]];
  function buildPath(nodes, w, h) {
    const p = nodes.map(([x, y]) => [x * w, y * h]);
    const pts = [];
    const seg = 80;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      for (let s = 0; s < seg; s++) {
        const t = s / seg, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    pts.push(p[p.length - 1]);
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1];
    const nodeAt = p.map((_, i) => len[Math.min(i * seg, pts.length - 1)] / total);
    return { pts, len, total, nodeAt, nodes: p };
  }

  const route = {
    map: $('[data-route]'),
    pin: $('[data-route-pin]'),
    stage: $('.route-stage'),
    canvas: $('.route-canvas'),
    reticle: $('.reticle'),
    nodeEls: $$('.route-node'),
    cardsBox: $('[data-route-cards]'),
    cards: $$('.route-card'),
    pips: $$('.route-pips li'),
    hint: $('.route-hint'),
    w: 0, h: 0, dpr: 1, path: null, reached: -1, active: -1, shown: null, dirty: true,
    // planeo lento hacia cada parada (antes iba demasiado rápido)
    progress: new Spring(0, { k: 120, c: 22 }),
    rx: new Spring(0, { k: 260, c: 30 }),
    ry: new Spring(0, { k: 260, c: 30 }),
    lock: new Spring(1, { k: 260, c: 22 }),
    fit() {
      if (!this.map) return;
      this.w = this.map.offsetWidth; this.h = this.map.offsetHeight;
      if (!this.w || !this.h) return;
      const tall = this.h > this.w * 1.1;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      // en desktop la ruta ocupa la parte izquierda y el recuadro vive a la derecha (no tapa pasos)
      this.wide = this.w >= 900;
      const nodes = (tall ? NODES_TALL : NODES_WIDE).map(([x, y]) => (this.wide ? [0.05 + x * 0.55, y] : [0.1 + x * 0.72, y]));
      this.path = buildPath(nodes, this.w, this.h);
      this.path.nodes.forEach(([x, y], i) => {
        this.nodeEls[i].style.left = `${(x / this.w) * 100}%`;
        this.nodeEls[i].style.top = `${(y / this.h) * 100}%`;
      });
      const head = this.headAt(this.progress.x);
      this.rx.snap(head[0]); this.ry.snap(head[1]);
      this.dirty = true;
      wake();
    },
    relabel() { this.dirty = true; },
    headAt(p) {
      const { pts, len, total } = this.path;
      const target = total * p;
      let i = 0;
      while (i < pts.length - 1 && len[i + 1] <= target) i++;
      return pts[i];
    },
    // Scroll de la escena fijada → progreso del trazo con PARADAS en cada paso:
    // [parada 1 | viaje | parada 2 | viaje | parada 3 | viaje | parada 4]
    target() {
      const r = this.pin.getBoundingClientRect();
      const headerH = header.offsetHeight || 0;
      const span = Math.max(1, r.height - this.stage.offsetHeight);
      const f = clamp((headerH - r.top) / span);
      const HOLD = 1.7, TRAVEL = 1;
      const n = this.path.nodeAt.length;
      let u = f * (n * HOLD + (n - 1) * TRAVEL);
      for (let i = 0; i < n; i++) {
        if (u <= HOLD || i === n - 1) return this.path.nodeAt[i];
        u -= HOLD;
        if (u <= TRAVEL) {
          const s = u / TRAVEL;
          const e = s * s * (3 - 2 * s);
          return this.path.nodeAt[i] + (this.path.nodeAt[i + 1] - this.path.nodeAt[i]) * e;
        }
        u -= TRAVEL;
      }
      return 1;
    },
    setCards(active, shown) {
      if (active === this.active && shown === this.shown) return;
      this.active = active; this.shown = shown;
      const [nx] = this.path.nodes[active];
      this.cardsBox.dataset.side = this.wide || nx / this.w < 0.5 ? 'right' : 'left';
      this.cards.forEach((c, i) => {
        c.classList.toggle('is-active', i === active);
        c.classList.toggle('is-shown', i === active && shown);
      });
      this.pips.forEach((p, i) => p.classList.toggle('is-current', i === active));
      if (this.hint) this.hint.classList.toggle('is-done', active === this.cards.length - 1 && shown);
    },
    update(dt, vh, time) {
      if (!this.map || !this.path) return false;
      const r = this.stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return false;
      this.progress.target = this.target();
      if (reduced) this.progress.snap(this.progress.target); else this.progress.step(dt);
      const p = this.progress.x;

      const reached = this.path.nodeAt.filter((a) => p >= a - 0.002).length;
      if (reached !== this.reached) {
        this.reached = reached;
        this.nodeEls.forEach((n, i) => n.classList.toggle('is-on', i < reached));
        this.pips.forEach((s, i) => s.classList.toggle('is-on', i < reached));
      }
      // el recuadro sale cuando la mira está detenida sobre la parada
      const active = Math.max(0, reached - 1);
      const parked = Math.abs(p - this.path.nodeAt[active]) < 0.02 && Math.abs(this.progress.target - this.path.nodeAt[active]) < 0.02;
      this.setCards(active, parked);

      const head = this.headAt(p);
      this.rx.target = head[0]; this.ry.target = head[1];
      const x = reduced ? this.rx.target : this.rx.step(dt);
      const y = reduced ? this.ry.target : this.ry.step(dt);
      const near = this.path.nodes.some(([nx, ny]) => Math.hypot(nx - x, ny - y) < 18);
      this.lock.target = near ? 1.18 : 1;
      const s = reduced ? 1 : this.lock.step(dt);
      this.reticle.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      this.reticle.classList.toggle('is-locked', near);

      const travelling = !reduced && !parked;
      const moving = this.progress.moving || this.rx.moving || this.ry.moving || this.lock.moving;
      if (!travelling && !moving && !this.dirty) return false;
      this.dirty = false;
      this.draw(p, x, y, time, travelling);
      return travelling || moving;
    },
    draw(p, rx, ry, time, rings) {
      const ctx = this.canvas.getContext('2d');
      const { w, h, dpr, path } = this;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const drawnLen = path.total * p;
      const sample = [];
      for (let i = 0; i < path.pts.length; i += 6) if (path.len[i] <= drawnLen) sample.push(path.pts[i]);
      const gap = w < 640 ? 16 : 14;
      const t = time * 0.001;
      ctx.fillStyle = COLORS.dark;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const f = 0.5 + 0.25 * Math.sin(x * 0.011 + y * 0.004) + 0.25 * Math.sin(y * 0.013 - x * 0.006 + 1.7);
          let rad = 0.5 + f * 1.1;
          let near = 0;
          for (let k = 0; k < sample.length; k++) {
            const dx = sample[k][0] - x, dy = sample[k][1] - y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 1600) near = Math.max(near, 1 - Math.sqrt(d2) / 40);
          }
          rad += near * 1.6;
          if (rings) {
            const d = Math.hypot(x - rx, y - ry);
            if (d < 170) rad += Math.max(0, Math.cos(d * 0.11 - t * 4.2)) * 2.2 * (1 - d / 170);
          }
          ctx.globalAlpha = 0.15 + near * 0.32;
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(23,19,20,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
      ctx.beginPath();
      path.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = COLORS.dark; ctx.lineWidth = 2.5;
      ctx.beginPath();
      let head = path.pts[0];
      for (let i = 0; i < path.pts.length && path.len[i] <= drawnLen; i++) {
        const [x, y] = path.pts[i];
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        head = path.pts[i];
      }
      ctx.stroke();
      if (rings) {
        ctx.fillStyle = 'rgba(253,24,39,0.22)';
        ctx.beginPath(); ctx.arc(head[0], head[1], 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.red;
        ctx.beginPath(); ctx.arc(head[0], head[1], 5, 0, Math.PI * 2); ctx.fill();
      }
    },
  };
  window.__route = route; // inspección en pruebas
  if (route.map) {
    route.fit();
    if ('ResizeObserver' in window) {
      let last = '';
      new ResizeObserver(() => {
        const key = route.map.offsetWidth + 'x' + route.map.offsetHeight;
        if (key !== last) { last = key; route.fit(); }
      }).observe(route.map);
    }
  }

  // avatares de reseñas: si una foto de perfil no carga, queda la inicial
  $$('.gcard-avatar img').forEach((img) => {
    const fail = () => img.parentElement.classList.add('is-fallback');
    if (img.complete && !img.naturalWidth) fail();
    img.addEventListener('error', fail);
  });

  /* ---------------------------------------------------------------
     Ticker rAF único
     --------------------------------------------------------------- */
  function frame(t) {
    const dt = Math.min((t - (lastT || t)) / 1000, 1 / 30) || 1 / 60;
    lastT = t;
    const vh = window.innerHeight;
    let busy = false;
    if (!reduced) {
      busy = updateParallax(dt, vh) || busy;
      busy = updateTicker(dt, vh) || busy;
    }
    checkHeadings(vh);
    busy = timeline.update(dt, vh) || busy;
    busy = updateDissolves(dt, vh) || busy;
    busy = route.update(dt, vh, t) || busy;
    busy = updateHeader(dt) || busy;
    if (busy) requestAnimationFrame(frame);
    else { running = false; lastT = 0; }
  }
  function wake() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake, { passive: true });
  motionQuery.addEventListener?.('change', (e) => {
    reduced = e.matches;
    document.documentElement.classList.toggle('motion-ok', !reduced);
    if (reduced) {
      parallaxEls.forEach((p) => { p.el.style.transform = ''; p.el.style.opacity = ''; });
      if (tickerTrack) { tickerTrack.style.transform = ''; tickerTrack._clone.style.transform = ''; }
      headings.forEach((h) => h.classList.remove('is-armed'));
      timeline.plates.forEach((p) => p.classList.remove('is-armed'));
      pendingHeadings.clear();
    }
    route.dirty = true;
    wake();
  });

  /* ---------------------------------------------------------------
     Mapa interactivo: Leaflet + OpenStreetMap (sin cookies ni clave).
     Pulsar el mapa o la chincheta abre la ruta en Google Maps.
     --------------------------------------------------------------- */
  const mapBox = $('[data-map]');
  function openRoute() {
    window.open(mapBox.dataset.routeUrl, '_blank', 'noopener');
  }
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      if (window.L) { resolve(window.L); return; }
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      js.onload = () => resolve(window.L);
      js.onerror = reject;
      document.head.appendChild(js);
    });
  }
  function initMap() {
    const el = $('#map');
    const lat = parseFloat(mapBox.dataset.lat);
    const lng = parseFloat(mapBox.dataset.lng);
    loadLeaflet().then((L) => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const map = L.map(el, {
        center: [lat, lng],
        zoom: 17,
        scrollWheelZoom: false,   // la rueda sigue desplazando la página
        dragging: !coarse,         // en móvil un dedo sigue haciendo scroll
        tap: false,
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.divIcon({
        className: '',
        html: '<span class="map-pin"><b>Hercas</b><svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 1.5C9.8 1.5 1.5 9.6 1.5 19.7 1.5 33.2 20 50.5 20 50.5S38.5 33.2 38.5 19.7C38.5 9.6 30.2 1.5 20 1.5z" fill="#c40f1d" stroke="#fff" stroke-width="2"/><circle cx="20" cy="19.5" r="6.5" fill="#fff"/></svg></span>',
        iconSize: [40, 52],
        iconAnchor: [20, 52],
      });
      const marker = L.marker([lat, lng], { icon, keyboard: true, title: 'Hercas Peluqueros', alt: 'Hercas Peluqueros' }).addTo(map);
      marker.on('click', openRoute);
      map.on('click', openRoute);       // Leaflet no dispara click al arrastrar
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openRoute(); });
      mapBox.classList.add('is-ready');
    }).catch(() => {
      // sin la librería el recuadro sigue llevando a la ruta
      el.addEventListener('click', openRoute);
      mapBox.classList.add('is-static');
    });
  }
  if (mapBox) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); initMap(); }
      }, { rootMargin: '600px 0px' });
      io.observe(mapBox);
    } else initMap();
  }

  /* ---------------------------------------------------------------
     Menú móvil
     --------------------------------------------------------------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#mobile-menu');
  function updateMenuLabel() {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    $('.menu-btn-label', menuBtn).textContent = open ? ui().menuClose : ui().menuOpen;
    menuBtn.setAttribute('aria-label', open ? ui().menuClose : ui().menuOpen);
  }
  function setMenu(open, { focus = true } = {}) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    $('#main').inert = open;
    $('.site-footer').inert = open;
    updateMenuLabel();
    if (open && focus) $('a', menu).focus();
    if (!open && focus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false, { focus: false }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  window.matchMedia('(min-width: 1101px)').addEventListener?.('change', (e) => { if (e.matches && !menu.hidden) setMenu(false, { focus: false }); });

  /* ---------------------------------------------------------------
     Horario: marcar el día de hoy (hora de Madrid)
     --------------------------------------------------------------- */
  const HOURS = { 0: null, 1: ['10:00', '19:00'], 2: ['9:30', '13:30'], 3: ['10:00', '19:00'], 4: ['10:00', '19:00'], 5: ['10:00', '19:00'], 6: ['9:30', '13:30'] };
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  function madridNow() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, min: Number(get('hour')) * 60 + Number(get('minute')) };
  }
  function updateToday() {
    const out = $('[data-today]');
    if (!out) return;
    const { day, min } = madridNow();
    $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
    const h = HOURS[day];
    if (!h) out.textContent = ui().closedToday;
    else if (min < toMin(h[0])) out.textContent = ui().opensAt(h[0]);
    else if (min < toMin(h[1])) out.textContent = ui().openNow(h[1]);
    else out.textContent = ui().closedNow;
  }

  /* ---------------------------------------------------------------
     Arranque
     --------------------------------------------------------------- */
  $$('.lang-btn').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  const urlLang = new URLSearchParams(location.search).get('lang');
  const initialLang = urlLang === 'en' || urlLang === 'es' ? urlLang : store.get('hercas-lang') || 'es';
  applyLang(initialLang, { initial: true });
  prepareHeadings();
  timeline.arm();
  timeline.countSpring.snap(timeline.countTarget(window.innerHeight));
  updateToday();
  updateMenuLabel();
  header.style.setProperty('--hdr-o', String(headerSpring.x));
  wake();
  setInterval(updateToday, 60 * 1000);
})();
