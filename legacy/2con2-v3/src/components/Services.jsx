import { useI18n } from '../i18n/index.jsx';
import Ph from './Ph.jsx';
import House from './House.jsx';
import { Reveal, SplitText } from './ui.jsx';

// «Todo tipo de reformas»: una casa en corte donde cada estancia abre el texto de su tipo de reforma.
export default function Services() {
  const { t } = useI18n();
  return (
    <section className="section on-paper" id="reformas" aria-labelledby="svc-t" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="studio-grid" style={{ marginBottom: 'clamp(28px, 4vw, 48px)' }}>
          <SplitText as="h2" id="svc-t" className="d-lg" text={t('services.title')} />
          <div className="studio-copy">
            <Reveal><p className="lead">{t('services.intro')}</p></Reveal>
            <Reveal delay={0.08}><Ph k="services" /></Reveal>
          </div>
        </div>
        <House />
      </div>
    </section>
  );
}
