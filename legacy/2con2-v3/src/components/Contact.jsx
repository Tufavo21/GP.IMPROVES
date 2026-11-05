import { useI18n } from '../i18n/index.jsx';
import { BUSINESS } from '../data/business.js';
import Ph from './Ph.jsx';
import { Reveal, SplitText } from './ui.jsx';

export default function Contact() {
  const { t } = useI18n();
  return (
    <section className="section" id="contacto" aria-labelledby="con-t">
      <div className="wrap contact-grid">
        <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
          <SplitText as="h2" id="con-t" className="d-lg" text={t('contact.title')} />
          <Reveal><p className="lead">{t('contact.intro')}</p></Reveal>
        </div>
        <div>
          <div className="contact-list">
            <Reveal className="contact-row">
              <span className="k">{t('contact.phone')}</span>
              <a href={`tel:${BUSINESS.phone.tel}`} aria-label={t('contact.callAria')}>{BUSINESS.phone.intl}</a>
            </Reveal>
            <Reveal className="contact-row" delay={0.06}>
              <span className="k">{t('contact.email')}</span>
              <a className="small" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            </Reveal>
            <Reveal className="contact-row" delay={0.09}>
              <span className="k">{t('contact.instagram')}</span>
              <a className="small" href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer">{BUSINESS.instagram.handle}</a>
            </Reveal>
            <Reveal className="contact-row" delay={0.12}>
              <span className="k">{t('contact.city')}</span>
              <span className="v small">{t('contact.cityValue')}</span>
            </Reveal>
            <Reveal className="contact-row" delay={0.18}>
              <span className="k">{t('contact.addressLabel')}</span>
              <span><Ph k="address" /></span>
            </Reveal>
          </div>
          <p className="follow">
            {t('contact.followPre')} <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer">{BUSINESS.instagram.handle}</a> {t('contact.followPost')}
          </p>
        </div>
      </div>
    </section>
  );
}
