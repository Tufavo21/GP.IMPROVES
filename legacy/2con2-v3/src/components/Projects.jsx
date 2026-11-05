import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { IMAGES } from '../data/images.js';
import { PROJECTS, SHOW_PLACEHOLDERS } from '../data/business.js';
import Picture from './Picture.jsx';
import Ph from './Ph.jsx';
import { Btn, SplitText, usePinned } from './ui.jsx';

// Pasillo de proyectos: la sección se fija y el scroll vertical desplaza las fotos en horizontal,
// con las imágenes moviéndose en sentido contrario (paralaje). En móvil o con movimiento reducido
// es un carrusel normal con encaje (scroll-snap).
export default function Projects() {
  const { t, lang } = useI18n();
  const pinned = usePinned();
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [dist, setDist] = useState(0);
  const [vh, setVh] = useState(typeof window === 'undefined' ? 800 : window.innerHeight);
  const [idx, setIdx] = useState(0);

  const measure = useCallback(() => {
    const tr = trackRef.current;
    if (!tr) return;
    setDist(Math.max(0, tr.scrollWidth - window.innerWidth));
    setVh(window.innerHeight);
  }, []);

  useLayoutEffect(() => {
    if (!pinned) return undefined;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    const id = setTimeout(measure, 600); // tras cargar las imágenes
    return () => { ro.disconnect(); clearTimeout(id); window.removeEventListener('resize', measure); };
  }, [pinned, measure]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * dist);
  const px = useTransform(scrollYProgress, [0, 1], ['7%', '-7%']);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(PROJECTS.length - 1, Math.max(0, Math.floor(v * PROJECTS.length)))));

  const slides = PROJECTS.map((p, i) => {
    const m = IMAGES[p.id];
    return (
      <figure key={p.id} className="slide" aria-label={`${i + 1} / ${PROJECTS.length}`}>
        <div className="ph" style={{ '--ar': m.width / m.height }}>
          {pinned
            ? <motion.div className="ph-in" style={{ x: px }}><Picture id={p.id} alt={p.alt[lang]} sizes="(min-width: 900px) 640px, 86vw" /></motion.div>
            : <div className="ph-in"><Picture id={p.id} alt={p.alt[lang]} sizes="(min-width: 900px) 640px, 86vw" /></div>}
        </div>
        <figcaption>
          <span className="cp">{p.cap[lang]}</span>
          {SHOW_PLACEHOLDERS && (
            <span className="flags">
              {!p.own && <span className="tag">{t('projects.unconfirmed')}</span>}
              <span className="tag">{t('projects.lowres')}</span>
            </span>
          )}
        </figcaption>
      </figure>
    );
  });

  return (
    <section
      ref={ref} className={`projects on-dark ${pinned ? 'pinned' : ''}`} id="proyectos" aria-labelledby="proj-t"
      style={pinned ? { '--pin-h': `${dist + vh}px` } : undefined}
    >
      <div className="pin-stage">
        <div className="pin-head">
          <SplitText as="h2" id="proj-t" className="d-md" text={t('projects.title')} />
        </div>
        {pinned ? (
          <motion.div ref={trackRef} className="track" style={{ x }}>{slides}</motion.div>
        ) : (
          <div ref={trackRef} className="track" role="region" aria-roledescription="carousel" aria-label={t('projects.title')} tabIndex={0}>{slides}</div>
        )}
        <div className="pin-foot">
          {pinned && <span className="count" aria-hidden="true">{String(idx + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}</span>}
          {pinned && <div className="pin-prog" aria-hidden="true"><motion.i style={{ scaleX: scrollYProgress }} /></div>}
          <div className="pin-actions">
            <Ph k="projects" />
            <div className="actions">
              <Btn variant="white" href="#presupuesto">{t('hero.cta')}</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
