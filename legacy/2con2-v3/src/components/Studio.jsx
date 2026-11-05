import { useI18n } from '../i18n/index.jsx';
import Ph from './Ph.jsx';
import { Reveal, Rule, SplitText } from './ui.jsx';

export default function Studio() {
  const { t, dict } = useI18n();
  return (
    <section className="section studio on-paper" id="estudio" aria-labelledby="studio-t">
      <div className="wrap">
        <Rule />
        <div className="studio-grid" style={{ marginTop: 'clamp(28px, 4vw, 48px)' }}>
          <SplitText as="h2" id="studio-t" className="d-lg" text={t('studio.title')} />
          <div className="studio-copy">
            <Reveal><p className="lead" style={{ color: 'var(--ink)' }}>{t('studio.p1')}</p></Reveal>
            <Reveal delay={0.08}><p className="body">{t('studio.p2')}</p></Reveal>
            <Reveal delay={0.12}><Ph k="team" /></Reveal>
            <div className="people">
              {dict.studio.people.map((name, i) => (
                <Reveal key={name} delay={0.1 + i * 0.12} className="card">
                  <div className="ph-photo"><Ph>{t('studio.photoPh')}</Ph></div>
                  <p className="name">{name}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
