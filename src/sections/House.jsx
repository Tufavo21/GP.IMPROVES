import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { createSpring, clamp } from '../lib/spring.js';
import { createDepthRenderer } from '../lib/depthgl.js';
import { HOUSE, DEMO_PHOTOS } from '../content/demo-content.js';
import Picture, { imgSrc, depthSrc } from '../components/Picture.jsx';
import Reveal from '../components/Reveal.jsx';

// ESCENA DE LA CASA — M17 (sección fijada por tramos de scroll) + M21 (cambio de estancia con
// fundido direccional y re-disparo del reveal) + M16 (progreso lateral tipo «stories»).
// [DEMO-IMG] Cuatro fotos de demostración con su mapa de profundidad (Depth Anything v2), pintadas en
// un <canvas> WebGL: el cursor mueve la cámara (±3–4° aparentes, con lerp); en táctil, deriva lenta.
// El WebGL solo dibuja cuando la sección está a la vista y algo cambia (window.__cfHouse.renders).
// Sin WebGL: las mismas imágenes estáticas con fundido CSS. prefers-reduced-motion: estancias apiladas.
const n = HOUSE.length;

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export default function House() {
  const { t, pick } = useI18n();
  const root = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const fills = useRef([]);
  const pics = useRef([]);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const [gl, setGl] = useState(false);
  const st = useRef({
    p: 0, local: 0, inView: false, near: false, loading: false, r: null,
    from: 0, to: 0, dir: 1, trans: createSpring(1, { tension: 70, friction: 17 }),
    cam: [0, 0], target: [0, 0], coarse: false, pointerAt: 0, dirty: true, w: 0, h: 0,
  });

  useLayoutEffect(() => {
    if (reducedMotion) return;
    setPinned(true);
    st.current.coarse = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__cfHouse = window.__cfHouse || { renders: 0 };
  }, []);

  // Carga diferida de texturas cuando la sección se acerca
  const startGl = async () => {
    const s = st.current;
    if (s.loading || !canvas.current) return;
    s.loading = true;
    const r = createDepthRenderer(canvas.current);
    if (!r) { window.__cfHouse.gl = false; return; }
    const want = window.innerWidth < 768 ? 1280 : 1920;
    try {
      // Primero la estancia activa, después el resto
      const order = [s.to, ...HOUSE.map((_, i) => i).filter((i) => i !== s.to)];
      for (const i of order) {
        const [img, dep] = await Promise.all([loadImage(imgSrc(HOUSE[i].id, want, 'webp')), loadImage(depthSrc(HOUSE[i].id))]);
        r.addRoom(i, img, dep);
        if (i === order[0]) { s.r = r; s.dirty = true; setGl(true); window.__cfHouse.gl = true; }
      }
    } catch {
      if (!s.r) window.__cfHouse.gl = false; // sin texturas: se quedan las imágenes estáticas
    }
  };

  useViewport(root, ({ rect, vh, inView }) => {
    const s = st.current;
    const pin = root.current?.querySelector('.house__pin');
    const scrollable = rect.height - (pin?.offsetHeight || vh);
    s.p = scrollable > 0 ? clamp(-rect.top / scrollable) : 0;
    // «Tapada»: el pin solo está a la vista mientras la sección cubre el viewport
    s.inView = inView && rect.bottom > vh * 0.02;
    if (!s.near && rect.top < vh * 2.5 && rect.bottom > -vh) { s.near = true; startGl(); }
  }, pinned);

  const onPointer = (e) => {
    const s = st.current;
    if (e.pointerType === 'touch') return;
    const r = stage.current.getBoundingClientRect();
    s.target = [((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2];
    s.pointerAt = performance.now();
  };
  const onLeave = () => { st.current.target = [0, 0]; };

  useTick((ts) => {
    const s = st.current;
    if (!pinned) return;
    const pos = s.p * n;
    const idx = Math.min(n - 1, Math.floor(pos));
    s.local = clamp(pos - idx);
    if (idx !== s.to) {
      // si hay un cambio a medias, parte de lo que más se ve
      s.from = s.trans.value > 0.5 ? s.to : s.from;
      s.dir = idx > s.to ? 1 : -1;
      s.to = idx;
      s.trans.jump(0); s.trans.set(1);
      setActive(idx);
      if (s.r && !s.r.has(idx)) s.dirty = true;
    }
    // M16: barras de progreso por estancia
    for (let i = 0; i < n; i += 1) {
      const f = fills.current[i];
      if (f) { const v = i < idx ? 1 : i > idx ? 0 : s.local; const k = v.toFixed(3); if (f.dataset.v !== k) { f.dataset.v = k; f.style.setProperty('--v', k); } }
    }
    if (!s.inView) return; // tapada o fuera: no se dibuja nada
    const moving = s.trans.step(ts.dt);
    const m = s.trans.value;
    // Respaldo sin WebGL: fundido CSS de las imágenes
    if (!s.r) {
      pics.current.forEach((el, i) => { if (el) el.style.opacity = i === s.to ? '1' : '0'; });
      return;
    }
    // Cámara: cursor con lerp, o deriva lenta en táctil / sin movimiento reciente
    if (s.coarse || ts.time - s.pointerAt > 4000) {
      const tt = ts.time / 1000;
      s.target = [Math.sin(tt * 0.23) * 0.7, Math.cos(tt * 0.17) * 0.45];
    }
    const dx = s.target[0] - s.cam[0]; const dy = s.target[1] - s.cam[1];
    s.cam[0] += dx * 0.06; s.cam[1] += dy * 0.06;
    const camMoving = Math.abs(dx) + Math.abs(dy) > 0.0015;
    if (!(moving || camMoving || s.dirty || ts.scrolled || ts.resized)) return;
    const c = canvas.current;
    const r = stage.current.getBoundingClientRect();
    const dpr = Math.min(ts.tier === 'mobile' ? 1.5 : 2, window.devicePixelRatio || 1);
    const W = Math.round(r.width * dpr); const H = Math.round(r.height * dpr);
    if (c.width !== W || c.height !== H) s.r.resize(W, H);
    const zoom = (i) => 1.08 - 0.05 * (i === s.to ? s.local : 1);
    const from = s.r.has(s.from) ? s.from : s.to;
    const to = s.r.has(s.to) ? s.to : from;
    s.r.render({ a: from, b: to, mix: m, dir: s.dir, cam: s.cam, zoomA: zoom(from), zoomB: zoom(to), strength: ts.tier === 'mobile' ? 0.016 : 0.022 });
    s.dirty = false;
    window.__cfHouse.renders += 1;
    window.__cfHouse.active = s.to;
  }, 'write', pinned);

  const room = HOUSE[active];
  const [name, line] = pick(room);
  const label = `${t('house.room')} ${String(active + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;

  if (!pinned) {
    // prefers-reduced-motion / sin JS: estancias apiladas, estáticas
    return (
      <section id="casa" className="section house house--static" data-logo="light" aria-label={t('house.aria')}>
        <ol className="house__list">
          {HOUSE.map((h, i) => {
            const [nm, ln] = pick(h);
            return (
              <li key={h.id} className="house__item">
                <Picture id={h.id} alt={pick(DEMO_PHOTOS[h.id])} sizes="100vw" className="house__img" />
                <div className="house__text grid">
                  <p className="label">{t('house.room')} {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {t('house.note')}</p>
                  <h2 className="display house__name">{nm}</h2>
                  <p className="house__line">{ln}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section id="casa" ref={root} className={`house is-pinned ${gl ? 'is-gl' : ''}`} data-logo="plate" aria-label={t('house.aria')}
      style={{ height: `${n * 95 + 100}vh` }}>
      <div className="house__pin">
        <div className="house__stage" ref={stage} onPointerMove={onPointer} onPointerLeave={onLeave}>
          {HOUSE.map((h, i) => (
            <div key={h.id} className="house__pic" ref={(el) => { pics.current[i] = el; }} style={{ opacity: i === 0 ? 1 : 0 }}>
              <Picture id={h.id} alt={i === active ? pick(DEMO_PHOTOS[h.id]) : ''} aria-hidden={i !== active} sizes="100vw" className="house__img" />
            </div>
          ))}
          <canvas ref={canvas} className="house__gl" aria-hidden="true" />
        </div>
        <ol className="house__rail" aria-hidden="true">
          {HOUSE.map((h, i) => (
            <li key={h.id} className={`house__seg ${i === active ? 'is-active' : ''}`}>
              <span className="house__fill" ref={(el) => { fills.current[i] = el; }} />
            </li>
          ))}
        </ol>
        <div className="house__text" aria-live="polite">
          <p className="label">{label} · {t('house.note')}</p>
          <Reveal key={`n-${active}-${name}`} as="h2" text={name} mode="char" stagger={28} className="display house__name" />
          <Reveal key={`l-${active}-${line}`} as="p" text={line} stagger={18} className="house__line" />
        </div>
      </div>
    </section>
  );
}
