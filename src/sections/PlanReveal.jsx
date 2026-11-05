import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, useViewport, reducedMotion, tickerState } from '../lib/hooks.js';
import { CLIENT_PHOTOS } from '../content/business.js';
import Picture, { imgSrc } from '../components/Picture.jsx';
import Reveal from '../components/Reveal.jsx';
import { Button } from '../components/ui.jsx';

// M10 — revelado líquido por cursor. Base visible: el dibujo de líneas derivado de la foto.
// Un canvas superpuesto «pinta» la foto real a lo largo del rastro del puntero (pincel radial de
// radio fijo, desvanecimiento por fotograma, limpieza tras inactividad). En táctil, un cursor
// fantasma recorre el dibujo cuando nadie lo toca. Botón para ver la obra entera (teclado / a11y).
const ID = 'bano-gres-piedra';
const FADE = 0.016; // opacidad que pierde la máscara por fotograma
const IDLE_FRAMES = 140;

export default function PlanReveal() {
  const { t, pick } = useI18n();
  const box = useRef(null);
  const canvas = useRef(null);
  const st = useRef({ img: null, mask: null, pts: [], last: null, idle: 0, inView: false, touched: 0, ghostT: 0, w: 0, h: 0, dpr: 1, dirty: false });
  const [full, setFull] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
    if (reducedMotion) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = imgSrc(ID, 1100);
    img.onload = () => { st.current.img = img; };
  }, []);

  // Ajuste de tamaño del canvas y de la máscara (a media resolución)
  const fit = () => {
    const c = canvas.current; const b = box.current; const s = st.current;
    if (!c || !b) return;
    const r = b.getBoundingClientRect();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    if (Math.round(r.width * dpr) === c.width && Math.round(r.height * dpr) === c.height) return;
    s.w = r.width; s.h = r.height; s.dpr = dpr;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    s.mask = document.createElement('canvas');
    s.mask.width = Math.round(r.width / 2); s.mask.height = Math.round(r.height / 2);
  };

  useViewport(box, ({ inView }) => { st.current.inView = inView; if (inView) fit(); }, !reducedMotion);

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect();
    st.current.pts.push([e.clientX - r.left, e.clientY - r.top]);
    st.current.touched = tickerState.frame;
  };
  const onLeave = () => { st.current.last = null; };

  useTick((ts) => {
    const s = st.current; const c = canvas.current;
    if (!s.inView || !s.img || !s.mask || !c) return;
    const brush = Math.max(60, Math.min(s.w, s.h) * (ts.tier === 'mobile' ? 0.22 : 0.16));
    // Cursor fantasma en táctil (o si no hay puntero fino) cuando no hay interacción reciente
    if (coarse && ts.frame - s.touched > 90) {
      s.ghostT += ts.dt / 1000;
      const g = s.ghostT;
      s.pts.push([s.w * (0.5 + 0.36 * Math.sin(g * 0.9)), s.h * (0.5 + 0.34 * Math.sin(g * 0.63 + 1.2))]);
    }
    const m = s.mask.getContext('2d');
    const k = s.mask.width / s.w;
    if (s.pts.length) {
      s.idle = 0; s.dirty = true;
      m.globalCompositeOperation = 'source-over';
      for (const p of s.pts) {
        const from = s.last || p;
        const dist = Math.hypot(p[0] - from[0], p[1] - from[1]);
        const n = Math.max(1, Math.ceil(dist / (brush * 0.25)));
        for (let i = 1; i <= n; i += 1) {
          const x = (from[0] + ((p[0] - from[0]) * i) / n) * k;
          const y = (from[1] + ((p[1] - from[1]) * i) / n) * k;
          const rr = brush * k;
          const g = m.createRadialGradient(x, y, 0, x, y, rr);
          g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          m.fillStyle = g; m.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
        s.last = p;
      }
      s.pts.length = 0;
    } else {
      s.idle += 1;
    }
    if (!s.dirty) return;
    // Desvanecimiento por fotograma
    m.globalCompositeOperation = 'destination-out';
    m.fillStyle = `rgba(0,0,0,${FADE})`;
    m.fillRect(0, 0, s.mask.width, s.mask.height);
    // Composición: foto (cover) recortada por la máscara
    const ctx = c.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, c.width, c.height);
    if (s.idle > IDLE_FRAMES) { m.clearRect(0, 0, s.mask.width, s.mask.height); s.dirty = false; s.last = null; return; }
    const iw = s.img.naturalWidth; const ih = s.img.naturalHeight;
    const scale = Math.max(c.width / iw, c.height / ih);
    const dw = iw * scale; const dh = ih * scale;
    ctx.drawImage(s.img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(s.mask, 0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
  }, 'write', !reducedMotion);

  return (
    <div className="plan grid" aria-labelledby="plan-t">
      <div className="plan__text">
        <Reveal as="h3" text={t('plan.title')} className="display plan__title" id="plan-t" />
        <p className="lede">{t('plan.lede')}</p>
        {!reducedMotion ? <p className="plan__hint">{coarse ? t('plan.hintTouch') : t('plan.hintPointer')}</p> : null}
        <Button variant="line" onClick={() => setFull((f) => !f)} aria-pressed={full}>{full ? t('plan.hide') : t('plan.show')}</Button>
        <p className="plan__note label">{t('plan.note')}</p>
      </div>
      <div className={`plan__box ${full ? 'is-full' : ''}`} ref={box} data-logo="plate"
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={onLeave}>
        <Picture id={ID} variant="plano" alt={t('plan.alt')} sizes="(max-width: 767px) 100vw, 50vw" className="plan__pic" />
        <Picture id={ID} alt={pick(CLIENT_PHOTOS[ID])} sizes="(max-width: 767px) 100vw, 50vw" className="plan__pic plan__pic--photo" aria-hidden={!full} />
        {!reducedMotion ? <canvas ref={canvas} className="plan__canvas" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
