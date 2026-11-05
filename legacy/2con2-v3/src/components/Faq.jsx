import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { Reveal, SplitText } from './ui.jsx';

export default function Faq() {
  const { t, dict } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq on-paper" id="preguntas" aria-labelledby="faq-t">
      <div className="wrap">
        <SplitText as="h2" id="faq-t" className="d-lg" text={t('faq.title')} />
        <div className="rows" style={{ borderBottom: '1px solid var(--ink)' }}>
          {dict.faq.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={it.q} delay={i * 0.05} y={18}>
                <div className="row" style={{ borderTop: '1px solid var(--ink)' }}>
                  <h3>
                    <button type="button" className="row-btn" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                      <span className="nm">{it.q}</span>
                      <span className="pm" aria-hidden="true" />
                    </button>
                  </h3>
                  <div className="row-body" data-open={isOpen} id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} inert={!isOpen}>
                    <div><div className="row-inner"><p className="body">{it.a}</p></div></div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
