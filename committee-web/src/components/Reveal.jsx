import { Fragment, createElement, useLayoutEffect, useRef } from 'react';
import { useTick, useViewport, reducedMotion } from '../lib/hooks.js';
import { createSpring, SPRINGS } from '../lib/spring.js';

// Titular que entra palabra a palabra por muelles en el ticker único. El texto es visible por
// defecto: el estado oculto solo lo aplica JS y solo si el titular aún no se ha visto.
export default function Reveal({ as = 'h2', text, stagger = 55, className = '', id }) {
  const ref = useRef(null);
  const anim = useRef(null);
  const units = text.split(' ');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return undefined;
    if (el.getBoundingClientRect().top < 0) { anim.current = null; return undefined; }
    const nodes = Array.from(el.querySelectorAll('.rv__i'));
    const springs = nodes.map(() => createSpring(0, SPRINGS.reveal));
    nodes.forEach((n) => { n.style.transform = 'translate3d(0,110%,0)'; });
    anim.current = { nodes, springs, started: 0, done: false };
    return () => { nodes.forEach((n) => { n.style.transform = ''; }); anim.current = null; };
  }, [text]);

  useViewport(ref, ({ rect, vh }) => {
    const a = anim.current;
    if (a && !a.started && rect.top < vh * 0.9 && rect.bottom > 0) a.started = performance.now();
  }, !reducedMotion);

  useTick((s) => {
    const a = anim.current;
    if (!a || !a.started || a.done) return;
    const elapsed = s.time - a.started;
    let moving = false;
    a.springs.forEach((sp, i) => {
      if (elapsed >= i * stagger) sp.set(1);
      if (sp.step(s.dt) || !sp.settled) moving = true;
      const y = (1 - sp.value) * 110;
      a.nodes[i].style.transform = y < 0.05 ? '' : `translate3d(0,${y.toFixed(2)}%,0)`;
    });
    if (!moving && elapsed > a.springs.length * stagger) a.done = true;
  }, 'write', !reducedMotion);

  return createElement(as, { ref, className: `rv ${className}`, id },
    units.map((u, i) => (
      <Fragment key={`${u}-${i}`}>
        <span className="rv__w"><span className="rv__i">{u}</span></span>
        {i < units.length - 1 ? ' ' : null}
      </Fragment>
    )));
}
