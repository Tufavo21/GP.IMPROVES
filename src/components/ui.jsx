import Reveal from './Reveal.jsx';
import { scrollToId } from '../lib/hooks.js';

// Botón/enlace rectangular con relleno que entra desde la izquierda (flood, interrumpible por CSS).
export function Button({ href, onClick, variant = 'line', children, type = 'button', className = '', ...rest }) {
  const cls = `btn btn--${variant} ${className}`;
  const inner = (<><span className="btn__flood" aria-hidden="true" /><span className="btn__label">{children}</span></>);
  if (href) {
    const internal = href.startsWith('#');
    const handle = internal ? (e) => { e.preventDefault(); scrollToId(href.slice(1)); onClick?.(e); } : onClick;
    return <a className={cls} href={href} onClick={handle} {...rest}>{inner}</a>;
  }
  return <button className={cls} type={type} onClick={onClick} {...rest}>{inner}</button>;
}

// Cabecera de sección: índice «01 / 07» en el margen + titular con reveal + entradilla en cursiva.
export function SectionHead({ index, total, title, lede, id }) {
  return (
    <header className="shead grid">
      <p className="shead__index label" aria-hidden="true">
        {String(index).padStart(2, '0')} <span className="shead__sep">/</span> {String(total).padStart(2, '0')}
      </p>
      <Reveal as="h2" text={title} className="display shead__title" id={id} />
      {lede ? <p className="lede shead__lede">{lede}</p> : null}
    </header>
  );
}

export function Falta({ children }) {
  return <span className="falta">{children}</span>;
}

// Iconos de trazo (SVG propio, trazo 1.5px, sin relleno)
export const Icon = {
  arrow: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>),
  close: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>),
  menu: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}><path d="M3 8h18M3 16h18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>),
  alert: (p) => (<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" {...p}><rect x="1.5" y="1.5" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.5v4.5M8 10.6v1.2" stroke="currentColor" strokeWidth="1.6" /></svg>),
  instagram: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><rect x="3.5" y="3.5" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M17 6.6v.8" stroke="currentColor" strokeWidth="1.8" /></svg>),
  upload: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}><path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>),
};
