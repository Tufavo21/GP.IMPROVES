import { useI18n } from '../i18n/index.jsx';
import { TESTIMONIALS } from '../content/demo-content.js';
import { SectionHead } from '../components/ui.jsx';

// [DEMO] Testimonios ficticios: cada uno lleva su etiqueta visible. Solo existen con DEMO_ENABLED.
export default function Testimonials({ index, total }) {
  const { t, pick } = useI18n();
  return (
    <section id="opiniones" className="section quotes" data-logo="light" aria-labelledby="opiniones-t">
      <SectionHead index={index} total={total} title={t('testimonials.title')} id="opiniones-t" />
      <ul className="quotes__list">
        {TESTIMONIALS.map((q, i) => (
          <li className={`quote grid quote--${i % 2 ? 'r' : 'l'}`} key={q.name}>
            <blockquote className="quote__text"><p>{pick(q)}</p></blockquote>
            <p className="quote__by"><span className="quote__name">{q.name}</span> · {q.place}</p>
            <p className="quote__tag label">{t('testimonials.tag')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
