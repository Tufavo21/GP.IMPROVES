import { useI18n } from '../i18n/index.jsx';
import { BUSINESS, FALTA, SHOW_PLACEHOLDERS } from '../content/business.js';
import { DEMO_ENABLED, SLOGAN_EN } from '../content/demo-content.js';
import { LOGO } from '../content/images.js';
import { scrollToId } from '../lib/hooks.js';
import { Falta, Icon } from '../components/ui.jsx';

// Única sección oscura (cierre): logo blanco grande, lema, contacto e Instagram.
export default function Footer() {
  const { t, lang } = useI18n();
  const slogan = lang === 'es' ? BUSINESS.slogan.es : SLOGAN_EN;
  return (
    <footer className="footer" data-logo="dark">
      <div className="grid footer__top">
        <img className="footer__logo" src="/img-cliente/logo/logo-2con2estudio-blanco.png" width={LOGO.width} height={LOGO.height}
          alt="2con2estudio" loading="lazy" decoding="async" />
        <div className="footer__cols">
          <p className="footer__slogan display">{slogan.split(" · ").map((s) => <span key={s} className="footer__slogan-l">{s}</span>)}</p>
          <div className="footer__col">
            <p className="label">{t('footer.contact')}</p>
            <a href={BUSINESS.phone.href}>{BUSINESS.phone.intl}</a>
            <a href={`mailto:${BUSINESS.email}`} className="break">{BUSINESS.email}</a>
            <span>{BUSINESS.founders.join(' · ')} · {BUSINESS.city}</span>
          </div>
          <div className="footer__col">
            <p className="label">{t('footer.follow')}</p>
            <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" className="footer__ig"><Icon.instagram /> {BUSINESS.instagram.handle}</a>
          </div>
        </div>
      </div>
      <div className="grid footer__bottom">
        <p>© {new Date().getFullYear()} {BUSINESS.name}. {t('footer.rights')}</p>
        {DEMO_ENABLED ? <p className="footer__demo">{t('footer.demo')}</p> : null}
        {SHOW_PLACEHOLDERS ? <p><Falta>{FALTA.privacy}</Falta></p> : null}
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollToId('top'); }} className="footer__top-link">{t('footer.top')}</a>
      </div>
    </footer>
  );
}
