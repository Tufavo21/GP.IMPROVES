/* Hercas · efecto «corte de pelo»: fotos recortadas sin fondo; el canvas pinta el «después»
   donde ya se ha cortado y el «antes» en el resto. */
(() => {
  'use strict';

  const box = document.querySelector('[data-cut]');
  if (!box) return;
  const section = box.closest('section') || box;
  const frame = box.querySelector('.cut-frame');
  const canvas = box.querySelector('.cut-canvas');
  const before = box.querySelector('.cut-before');
  const after = box.querySelector('.cut-after');
  const restoreBtn = box.querySelector('[data-cut-restore]');
  const revealBtn = box.querySelector('[data-cut-reveal]');
  const ctx = canvas.getContext('2d');
  const coarse = window.matchMedia('(pointer: coarse)');

  const IMG_W = 1135;
  const IMG_H = 1388;
  const DONE_AT = 0.85;

  // Lo cortado se guarda en una máscara con el tamaño de la foto (no del canvas):
  // así se puede volver a pintar a cualquier tamaño o densidad sin perder el corte.
  // Opaco en la máscara = zona ya cortada.
  const mask = document.createElement('canvas');
  mask.width = Math.round(IMG_W / 2);
  mask.height = Math.round(IMG_H / 2);
  const mctx = mask.getContext('2d');

  // Capa auxiliar: el «después» recortado a la zona cortada (las fotos no tienen fondo,
  // así que el «después» no puede ir visible debajo: asomaría por fuera del pelo largo).
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d');

  // Para el porcentaje se reduce el canvas de la máscara de corte a 142 × 174 y se mira su alfa
  // solo en los píxeles que marca img/corte-mascara.png (la zona del pelo).
  const PROBE_W = 142;
  const PROBE_H = 174;
  const probe = document.createElement('canvas');
  probe.width = PROBE_W;
  probe.height = PROBE_H;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  let hairPixels = null;

  let ready = false;
  let started = false;
  let done = false;
  let drawing = false;
  let last = null;
  let raf = 0;
  let timer = 0;

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  function fit() {
    const r = frame.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr);
    const h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = layer.width = w;
      canvas.height = layer.height = h;
    }
    render();
  }

  function render() {
    raf = 0;
    if (!ready) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    // «antes» con agujeros: destination-out borra donde la máscara de corte es opaca
    ctx.drawImage(before, 0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(mask, 0, 0, w, h);
    // «después» solo dentro de lo cortado (destination-in) y sumado encima con 'lighter':
    // antes·(1−m) + después·m es un fundido exacto, sin halo oscuro en el borde suave del pincel
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, w, h);
    lctx.drawImage(after, 0, 0, w, h);
    lctx.globalCompositeOperation = 'destination-in';
    lctx.drawImage(mask, 0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(layer, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };

  function brushRadius() {
    const cssRadius = coarse.matches ? 45 : 35; // 90 px / 70 px de diámetro
    return cssRadius * (mask.width / frame.getBoundingClientRect().width);
  }

  function stamp(x, y, r) {
    // pincel con el borde suavizado: núcleo opaco y caída a transparente en el último 40 %
    const g = mctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.6, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g;
    mctx.beginPath();
    mctx.arc(x, y, r, 0, Math.PI * 2);
    mctx.fill();
  }

  function cutAt(clientX, clientY) {
    const rect = frame.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * mask.width;
    const y = ((clientY - rect.top) / rect.height) * mask.height;
    const r = brushRadius();
    if (last) {
      // se rellena el hueco entre dos eventos para que el trazo sea continuo
      const dx = x - last.x;
      const dy = y - last.y;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (r * 0.25)));
      for (let i = 1; i <= steps; i++) stamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps, r);
    } else {
      stamp(x, y, r);
    }
    last = { x, y };
    if (!started) {
      started = true;
      box.classList.add('is-started');
      startMeasuring();
    }
    schedule();
  }

  function handle(e) {
    if (!ready || done) return;
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    (events.length ? events : [e]).forEach((ev) => cutAt(ev.clientX, ev.clientY));
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!ready || done) return;
    drawing = true;
    last = null;
    if (e.pointerType !== 'mouse') canvas.setPointerCapture(e.pointerId);
    handle(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    // el ratón corta al pasar por encima; el dedo y el lápiz, al apoyarse
    if (e.pointerType === 'mouse' || drawing) handle(e);
  });
  const lift = (e) => {
    drawing = false;
    if (e.pointerType !== 'mouse') last = null;
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);
  canvas.addEventListener('pointerleave', () => { last = null; });

  function measure() {
    if (!hairPixels || !hairPixels.length) return 0;
    pctx.clearRect(0, 0, PROBE_W, PROBE_H);
    pctx.drawImage(mask, 0, 0, PROBE_W, PROBE_H);
    const alpha = pctx.getImageData(0, 0, PROBE_W, PROBE_H).data;
    let open = 0;
    for (let i = 0; i < hairPixels.length; i++) if (alpha[hairPixels[i] * 4 + 3] >= 128) open++;
    return open / hairPixels.length;
  }

  function startMeasuring() {
    stopMeasuring();
    timer = window.setInterval(() => {
      const share = measure();
      box.dataset.cutPercent = String(Math.round(share * 100));
      if (share >= DONE_AT) finish();
    }, 300);
  }
  function stopMeasuring() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  function finish() {
    if (done) return;
    done = true;
    drawing = false;
    stopMeasuring();
    box.classList.add('is-started', 'is-done');
    box.dataset.cutPercent = '100';
  }

  function restore() {
    stopMeasuring();
    done = false;
    started = false;
    drawing = false;
    last = null;
    mctx.clearRect(0, 0, mask.width, mask.height);
    box.classList.remove('is-started', 'is-done');
    box.dataset.cutPercent = '0';
    render();
  }

  restoreBtn.addEventListener('click', restore);
  revealBtn.addEventListener('click', finish);

  // al salir la sección por completo de la pantalla, el pelo vuelve a estar largo
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (!entry.isIntersecting && (started || done)) restore(); });
  }, { threshold: 0 }).observe(section);

  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(frame);
  window.addEventListener('resize', fit, { passive: true });

  const decoded = (img) => (img.complete && img.naturalWidth ? Promise.resolve(img) : new Promise((res, rej) => { img.addEventListener('load', () => res(img), { once: true }); img.addEventListener('error', rej, { once: true }); }));
  Promise.all([
    decoded(before),
    decoded(after),
    loadImage('img/corte-mascara.png'),
  ]).then(([, , hairMask]) => {
    pctx.drawImage(hairMask, 0, 0, PROBE_W, PROBE_H);
    const px = pctx.getImageData(0, 0, PROBE_W, PROBE_H).data;
    const list = [];
    for (let i = 0; i < PROBE_W * PROBE_H; i++) if (px[i * 4] > 127) list.push(i);
    hairPixels = Uint32Array.from(list);
    pctx.clearRect(0, 0, PROBE_W, PROBE_H);
    ready = true;
    box.dataset.cutPercent = '0';
    fit();
    box.classList.add('is-ready');
  }).catch(() => {
    // sin canvas listo se queda la foto «antes» y el botón para ver el resultado
    revealBtn.style.display = 'inline-flex';
    revealBtn.addEventListener('click', () => { before.style.opacity = '0'; });
  });
})();
