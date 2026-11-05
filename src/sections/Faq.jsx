import { useI18n } from '../i18n/index.jsx';
import { FAQ } from '../content/demo-content.js';
import { SectionHead, Icon } from '../components/ui.jsx';

// Acordeón nativo (<details>): accesible por teclado y legible sin JS.
export default function Faq({ index, total }) {
  const { t, pick } = useI18n();
  return (
    <section id="preguntas" className="section faq" data-logo="light" aria-labelledby="preguntas-t">
      <SectionHead index={index} total={total} title={t('faq.title')} id="preguntas-t" />
      <div className="grid">
        <div className="faq__list">
          {FAQ.map((f) => {
            const [q, a] = pick(f);
            return (
              <details className="faq__item" key={q}>
                <summary className="faq__q"><span>{q}</span><Icon.plus className="faq__icon" /></summary>
                <div className="faq__a"><p>{a}</p></div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
