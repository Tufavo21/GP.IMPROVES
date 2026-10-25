import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const ease = [0.22, 1, 0.36, 1];

/* Iconos monocromos, trazo ~1.5px */
const I = (p) => ({ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false, ...p });
export const IconSparkle = (p) => (<svg {...I(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>);
export const IconArrow = (p) => (<svg {...I(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconCheck = (p) => (<svg {...I(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const IconPlus = (p) => (<svg {...I(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconAlert = (p) => (<svg {...I(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>);
export const IconMenu = (p) => (<svg {...I(p)}><path d="M4 8h16M4 16h16" /></svg>);
export const IconClose = (p) => (<svg {...I(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);

/* Logo: marca (sol sobre horizonte) + nombre. SVG transparente, hereda color.
   tone: 'dark' (blanco, sobre oscuro) | 'light' (#161616, sobre blanco) | 'gradient' (placa de color base) */
export function Logo({ tone = 'dark', name = 'Marjal', label }) {
  const cls = tone === 'light' ? 'logo logo--light' : tone === 'gradient' ? 'logo logo--plate' : 'logo';
  return (
    <span className={cls} role={label ? 'img' : undefined} aria-label={label}>
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" focusable="false">
        <path d="M6 16a8 8 0 0 1 16 0" />
        <path d="M3 16h22" />
        <path d="M8 20h12" />
        <path d="M11 24h6" />
      </svg>
      <span aria-hidden={label ? 'true' : undefined}>{name}</span>
    </span>
  );
}

/* Texto enmascarado por línea: cada línea sube desde su máscara (clip + translate). */
export function MaskLines({ lines, as: Tag = 'span', className = '', delay = 0, stagger = 0.09, inView = false, inherit = false }) {
  const reduce = useReducedMotion();
  const wrap = { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } }, exit: { transition: { staggerChildren: 0.04 } } };
  const child = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.6, ease } },
    exit: { y: '-110%', transition: { duration: 0.4, ease } },
  };
  if (reduce) return <Tag className={className}>{lines.map((l, i) => <span key={i} className="mask"><span>{l}</span></span>)}</Tag>;
  const trigger = inherit
    ? {}
    : { initial: 'hidden', exit: 'exit', ...(inView ? { whileInView: 'show', viewport: { once: true, margin: '-10% 0px' } } : { animate: 'show' }) };
  const MTag = motion[Tag] || motion.span;
  return (
    <MTag variants={wrap} {...trigger} style={{ display: 'block' }} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="mask"><motion.span variants={child}>{l}</motion.span></span>
      ))}
    </MTag>
  );
}

/* Imagen con parallax interno suave (transform) dentro de un marco con overflow oculto. */
export function ParallaxImg({ src, alt, w, h, amount = 24, eager = false, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  return (
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0 }}>
      <motion.img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={reduce ? undefined : { y, scale: 1.12 }}
      />
    </div>
  );
}

/* Revelado suave al entrar en viewport (opacity + translate) */
export function Reveal({ children, delay = 0, as = 'div', className = '', ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) { const P = as; return <P className={className} {...rest}>{children}</P>; }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export { ease };
