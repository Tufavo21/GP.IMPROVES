import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { FAQ } from '../content/demo-content.js';
import { SectionHead, Icon } from '../components/ui.jsx';

// Acordeón nativo (<details>): accesible por teclado y legible sin JS.
// Con ratón (hover + puntero fino), la respuesta se despliega al pasar por encima de la pregunta:
//  · intención de 140 ms para no abrir al cruzar la lista; solo una abierta a la vez (sin saltos en cadena);
//  · al salir de la lista se cierra, salvo la que se haya fijado con clic (el clic la fija o la suelta);
//  · teclado y táctil: comportamiento nativo (clic / Enter abre y cierra).
const INTENT = 140;

export default function Faq({ index, total }) {
  const { t, pick } = useI18n();
  const items = useRef([]);
  const st = useRef({ hover: false, pinned: -1, timer: 0 });

  useEffect(() => {
    st.current.hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    return () => clearTimeout(st.current.timer);
  }, []);

  const openOnly = (i) => items.current.forEach((d, j) => { if (d) d.open = j === i || j === st.current.pinned; });

  const enter = (i) => (e) => {
    const s = st.current;
    if (!s.hover || e.pointerType !== 'mouse') return;
    clearTimeout(s.timer);
    s.timer = setTimeout(() => openOnly(i), INTENT);
  };
  const leaveList = (e) => {
    const s = st.current;
    if (!s.hover || e.pointerType !== 'mouse') return;
    clearTimeout(s.timer);
    s.timer = setTimeout(() => openOnly(s.pinned), INTENT);
  };
  const click = (i) => (e) => {
    const s = st.current;
    if (!s.hover || e.detail === 0) return; // teclado: toggle nativo
    e.preventDefault();
    clearTimeout(s.timer);
    s.pinned = s.pinned === i ? -1 : i;
    openOnly(i); // sigue abierta mientras el ratón esté encima
  };

  return (
    <section id="preguntas" className="section faq" data-logo="light" aria-labelledby="preguntas-t">
      <SectionHead index={index} total={total} title={t('faq.title')} id="preguntas-t" />
      <div className="grid">
        <div className="faq__list" onPointerLeave={leaveList}>
          {FAQ.map((f, i) => {
            const [q, a] = pick(f);
            return (
              <details className="faq__item" key={q} ref={(d) => { items.current[i] = d; }} onPointerEnter={enter(i)}>
                <summary className="faq__q" onClick={click(i)}><span>{q}</span><Icon.plus className="faq__icon" /></summary>
                <div className="faq__a"><p>{a}</p></div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
