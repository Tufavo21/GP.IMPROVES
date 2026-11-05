import { useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { createSpring, range, easeOut } from '../lib/spring.js';
import { CLIENT_PHOTOS } from '../content/business.js';
import Picture from '../components/Picture.jsx';
import { Button } from '../components/ui.jsx';

// ANIMACIÓN DE FIRMA — «Del diseño a la obra», con el eslogan real del cliente.
//  · Al cargar, «DISEÑO DE INTERIORES» entra letra a letra con desenfoque (M15).
//  · Con el scroll (sección fijada), «EJECUCIÓN DE OBRA» pasa de contorno a relleno letra a letra,
//    mientras la foto pasa de blanco y negro a color y se abre hasta quedar a sangre.
//  · prefers-reduced-motion / sin JS: fotograma final estático (titular relleno, foto a color).
const PHOTO = 'cocina-roble-grafito';

function chars(lines, cls) {
  let k = 0;
  return lines.map((line, li) => (
    <span className={`hero__line ${cls}`} key={li}>
      {Array.from(line).map((c) => {
        k += 1;
        return <span className="hero__ch" data-i={k} key={k}>{c === ' ' ? ' ' : c}</span>;
      })}
    </span>
  ));
}

export default function Hero() {
  const { t, lang, pick } = useI18n();
  const root = useRef(null);
  const head = useRef(null);
  const stage = useRef(null);
  const color = useRef(null);
  const pic = useRef(null);
  const [live, setLive] = useState(false);
  const anim = useRef({ a: [], b: [], springs: [], start: 0, p: -1, top: 0 });
  const a = t('hero.a'); const b = t('hero.b');
  const full = `${a.join(' ')} · ${b.join(' ')}`;

  useLayoutEffect(() => {
    if (reducedMotion) return;
    setLive(true);
    const st = anim.current;
    st.a = Array.from(root.current.querySelectorAll('.hero__line--a .hero__ch'));
    st.b = Array.from(root.current.querySelectorAll('.hero__line--b .hero__ch'));
    const all = [...st.a, ...st.b];
    st.springs = all.map(() => createSpring(0, { tension: 110, friction: 19 }));
    st.all = all;
    st.start = performance.now() + 120;
    st.entered = false;
    st.p = -1;
    all.forEach((n) => { n.style.opacity = '0'; n.style.transform = 'translate3d(0,50px,0)'; n.style.filter = 'blur(12px)'; });
  }, [lang]);

  // Mide dónde termina el titular para que la foto arranque justo debajo.
  useViewport(root, ({ rect, vh }) => {
    const st = anim.current;
    const h = head.current?.getBoundingClientRect();
    if (h && stage.current) st.top = Math.max(0, h.bottom - stage.current.getBoundingClientRect().top + 16);
    const scrollable = rect.height - vh;
    st.p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
  }, !reducedMotion);

  useTick((s) => {
    const st = anim.current;
    if (!live || !st.all) return;
    // M15: entrada letra a letra (35 ms de stagger) con desenfoque, por muelles
    if (!st.entered) {
      const el = s.time - st.start;
      let moving = false;
      st.springs.forEach((sp, i) => {
        if (el >= i * 35) sp.set(1);
        if (sp.step(s.dt) || !sp.settled) moving = true;
        const v = sp.value; const n = st.all[i];
        n.style.opacity = Math.min(1, v * 1.4).toFixed(3);
        n.style.transform = v > 0.999 ? '' : `translate3d(0,${((1 - v) * 50).toFixed(2)}px,0)`;
        n.style.filter = v > 0.995 ? '' : `blur(${((1 - v) * 12).toFixed(2)}px)`;
      });
      if (!moving && el > st.springs.length * 35) st.entered = true;
    }
    const p = Math.max(0, st.p);
    // Relleno de «EJECUCIÓN DE OBRA»: cada letra se rellena en su tramo, de 0.02 a 0.44
    const nb = st.b.length;
    st.b.forEach((n, i) => {
      const f = easeOut(range(p, 0.02 + (i / nb) * 0.32, 0.02 + (i / nb) * 0.32 + 0.1));
      const v = f.toFixed(2);
      if (n.dataset.f !== v) { n.dataset.f = v; n.style.color = `rgb(11 11 11 / ${v})`; }
    });
    // Foto: B/N → color (0.06 → 0.46) y, con el titular ya relleno, apertura a sangre (0.48 → 1)
    const c = range(p, 0.06, 0.46);
    const o = easeOut(range(p, 0.48, 0.98));
    const side = (1 - o) * (s.vw * 0.05);
    const top = (1 - o) * st.top;
    if (stage.current) stage.current.style.clipPath = `inset(${top.toFixed(1)}px ${side.toFixed(1)}px 0px ${side.toFixed(1)}px)`;
    if (color.current) color.current.style.opacity = c.toFixed(3);
    // la foto se centra en la franja visible y se desplaza hasta su sitio al abrirse (parallax)
    if (pic.current) pic.current.style.transform = `translate3d(0,${(top * 0.5).toFixed(1)}px,0) scale(${(1.12 - 0.12 * o).toFixed(4)})`;
  }, 'write', !reducedMotion);

  return (
    <section id="top" ref={root} className={`hero ${live ? 'is-live' : ''}`} data-logo="light" aria-labelledby="hero-title">
      <div className="hero__pin">
        <div className="hero__head grid" ref={head}>
          <h1 className="hero__title display" id="hero-title">
            <span className="sr-only">{full}</span>
            <span className="hero__a" aria-hidden="true">{chars(a, 'hero__line--a')}</span>
            <span className="hero__b" aria-hidden="true">{chars(b, 'hero__line--b')}</span>
          </h1>
          <div className="hero__aside">
            <p className="lede">{t('hero.lede')}</p>
            <p className="hero__body">{t('hero.body')}</p>
            <div className="hero__ctas">
              <Button href="#presupuesto" variant="solid">{t('hero.cta')}</Button>
              <Button href="#proyectos" variant="line">{t('hero.secondary')}</Button>
            </div>
          </div>
        </div>
        <div className="hero__stage" ref={stage} data-logo="plate">
          <div className="hero__pic" ref={pic}>
            <Picture id={PHOTO} variant="bn" alt="" priority sizes="100vw" className="hero__img hero__img--bn" aria-hidden="true" />
            <div className="hero__color" ref={color}>
              <Picture id={PHOTO} alt={pick(CLIENT_PHOTOS[PHOTO])} priority sizes="100vw" className="hero__img" />
            </div>
          </div>
          <p className="hero__caption label">{t('hero.caption')}</p>
        </div>
      </div>
    </section>
  );
}
