import { useI18n } from '../i18n/index.jsx';
import { SERVICES } from '../content/demo-content.js';
import { SectionHead } from '../components/ui.jsx';

export default function Services({ index, total }) {
  const { t, pick } = useI18n();
  return (
    <section id="servicios" className="section services" data-logo="light" aria-labelledby="servicios-t">
      <SectionHead index={index} total={total} title={t('services.title')} lede={t('services.lede')} id="servicios-t" />
      <ul className="services__list">
        {SERVICES.map((s) => {
          const [name, text] = pick(s);
          return (
            <li className="svc grid" key={name}>
              <h3 className="svc__name">{name}</h3>
              <p className="svc__text">{text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
