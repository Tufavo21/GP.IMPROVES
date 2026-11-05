import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import Picture from './Picture.jsx';

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2);

// Animación de firma «Nivel láser»: con el scroll, un láser amarillo sube por un plano de obra
// (rejilla y cotas) y, a su paso, el plano se convierte en la estancia ya construida (la foto).
// El título se rellena a la vez, de izquierda a derecha.
export default function Vano() {
  const { t, dict } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useTransform(scrollYProgress, [0.06, 0.86], [0, 1], { clamp: true });
  const e = useTransform(p, ease);

  const photoClip = useTransform(e, (v) => `inset(${(1 - v) * 100}% 0 0 0)`);
  const laserTop = useTransform(e, (v) => `${(1 - v) * 100}%`);
  const laserOpacity = useTransform(p, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);
  const scale = useTransform(e, [0, 1], [1.16, 1]);
  const fill = useTransform(p, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const pct = useTransform(e, (v) => `${Math.round(v * 100)} %`);
  const planFade = useTransform(p, [0.9, 1], [1, 0.25]);

  const d = dict.form.rooms.diagram;
  const photo = <Picture id="cocina-marmol-negra" alt={t('vano.alt')} sizes="(min-width: 1248px) 1200px, 92vw" />;

  if (reduce) {
    return (
      <section className="vano static" aria-labelledby="vano-t">
        <div className="wrap">
          <h2 id="vano-t" className="vano-title">{t('vano.title')}</h2>
          <div className="vano-box">
            <div className="vano-photo" style={{ clipPath: 'none' }}>{photo}</div>
            <span className="tag vano-cap">{t('vano.caption')}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="vano" aria-labelledby="vano-t">
      <div className="vano-stage">
        <div className="vano-title-wrap">
          <h2 id="vano-t" className="vano-title">
            <span className="vt-outline" aria-hidden="true">{t('vano.title')}</span>
            <motion.span className="vt-fill" style={{ clipPath: fill }}>{t('vano.title')}</motion.span>
          </h2>
        </div>

        <div className="vano-box">
          {/* plano: rejilla, muros y cotas */}
          <motion.div className="vano-plan" aria-hidden="true" style={{ opacity: planFade }}>
            <span className="cota cota-h"><i />{d.largo}<i /></span>
            <span className="cota cota-v"><i />{d.alto}<i /></span>
            <span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" />
          </motion.div>

          {/* estancia construida: aparece de abajo arriba al paso del láser */}
          <motion.div className="vano-photo" style={{ clipPath: photoClip }}>
            <motion.div className="vano-img" style={{ scale }}>{photo}</motion.div>
          </motion.div>

          {/* láser de nivel */}
          <motion.div className="vano-laser" aria-hidden="true" style={{ top: laserTop, opacity: laserOpacity }}>
            <span className="laser-tab"><b>{t('vano.progress')}</b> <motion.span>{pct}</motion.span></span>
          </motion.div>

          <span className="tag vano-cap">{t('vano.caption')}</span>
        </div>
      </div>
    </section>
  );
}
