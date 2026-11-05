import { useI18n } from '../i18n/index.jsx';
import { CLIENT_PHOTOS } from '../content/business.js';
import { DEMO_ENABLED, PROJECTS } from '../content/demo-content.js';
import Picture from '../components/Picture.jsx';
import { SectionHead } from '../components/ui.jsx';
import PlanReveal from './PlanReveal.jsx';

// Fotos a sangre alternadas con columnas asimétricas 7/5 y 5/7. La referencia roble/grafito
// (posible foto de exposición) no se lista como proyecto: aparece en el hero como referencia.
const LAYOUT = ['l75', 'l57', 'full', 'l75'];

export default function Projects({ index, total }) {
  const { t, pick } = useI18n();
  return (
    <section id="proyectos" className="section projects" data-logo="light" aria-labelledby="proyectos-t">
      <SectionHead index={index} total={total} title={t('projects.title')} lede={t('projects.lede')} id="proyectos-t" />
      <ol className="projects__list">
        {PROJECTS.filter((p) => !p.reference).map((p, i) => {
          const layout = LAYOUT[i] || 'l75';
          const n = String(i + 1).padStart(2, '0');
          return (
            <li key={p.id} className={`proj proj--${layout}`}>
              <figure className="proj__fig">
                <div className="proj__media" data-logo="plate">
                  <Picture id={p.id} alt={pick(CLIENT_PHOTOS[p.id])}
                    sizes={layout === 'full' ? '100vw' : '(max-width: 767px) 100vw, 58vw'} className="proj__pic" />
                  <span className="proj__num display" aria-hidden="true">{n}</span>
                </div>
                <figcaption className="proj__cap">
                  <h3 className="proj__name">{DEMO_ENABLED ? pick(p.name) : pick(CLIENT_PHOTOS[p.id])}</h3>
                  {DEMO_ENABLED ? (
                    <>
                      <dl className="proj__meta">
                        {p.m2 ? (<div><dt className="label">{t('projects.m2')}</dt><dd>{p.m2}</dd></div>) : null}
                        {p.year ? (<div><dt className="label">{t('projects.year')}</dt><dd>{p.year}</dd></div>) : null}
                        <div><dt className="label">{t('projects.type')}</dt><dd>{pick(p.type)}</dd></div>
                      </dl>
                      <p className="proj__note">{pick(p.note)}</p>
                    </>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
      <PlanReveal />
    </section>
  );
}
