import { useI18n } from '../i18n/index.jsx';
import { SHOW_PLACEHOLDERS } from '../data/business.js';
import { GOOGLE_PROFILE, REVIEWS } from '../data/reviews.js';
import { Btn, Reveal, SplitText } from './ui.jsx';

function Stars({ value, label }) {
  return (
    <span className="stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" aria-hidden="true" data-on={n <= value}>
          <path d="M10 1.8l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 14.2l-5 2.8 1.2-5.6L2 7.6l5.6-.6z" />
        </svg>
      ))}
    </span>
  );
}

// Reseñas de Google. Solo muestra reseñas reales cargadas en src/data/reviews.js; no hay ninguna de ejemplo.
export default function Reviews() {
  const { t, lang } = useI18n();
  const real = REVIEWS.length > 0;
  if (!real && !SHOW_PLACEHOLDERS) return null;
  const { rating, count, url } = GOOGLE_PROFILE;
  return (
    <section className="section on-paper reviews" id="resenas" aria-labelledby="rev-t">
      <div className="wrap">
        <div className="rev-head">
          <SplitText as="h2" id="rev-t" className="d-lg" text={t('reviews.title')} />
          {real && rating && count && (
            <Reveal className="rev-agg">
              <Stars value={Math.round(rating)} label={t('reviews.ratingLabel', { rating })} />
              <p><strong>{String(rating).replace('.', lang === 'es' ? ',' : '.')}</strong> · {t('reviews.count', { n: count })} · Google</p>
            </Reveal>
          )}
        </div>

        {real ? (
          <ul className="rev-grid">
            {REVIEWS.map((r, i) => (
              <Reveal as="li" key={r.id} delay={i * 0.08} className="rev-card">
                <Stars value={r.rating} label={t('reviews.starsLabel', { n: r.rating })} />
                <blockquote>{r.text}</blockquote>
                <footer>
                  <strong>{r.name}</strong>
                  <span>{t('reviews.via')}{r.date ? ` · ${r.date}` : ''}</span>
                  {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer">{t('reviews.see')}</a>}
                </footer>
              </Reveal>
            ))}
          </ul>
        ) : (
          <>
            <ul className="rev-grid">
              {[0, 1, 2].map((i) => (
                <Reveal as="li" key={i} delay={i * 0.08} className="rev-card empty">
                  <span className="falta">{t('reviews.pendingStars')}</span>
                  <p>{t('reviews.pendingText')}</p>
                  <span className="falta">{t('reviews.pendingName')}</span>
                </Reveal>
              ))}
            </ul>
            <p className="body rev-note">{t('reviews.pendingNote')}</p>
          </>
        )}

        {url && <div className="rev-cta"><Btn variant="white" href={url} target="_blank" rel="noopener noreferrer">{t('reviews.cta')}</Btn></div>}
      </div>
    </section>
  );
}
