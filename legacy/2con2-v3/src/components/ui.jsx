import { useEffect, useRef, useState } from 'react';
import {
  motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity,
} from 'motion/react';

export const EASE = [0.16, 1, 0.3, 1];

// Titular que sube palabra a palabra desde una ventana recortada cuando entra en pantalla.
export function SplitText({ text, as: Tag = 'span', id, className, delay = 0, stagger = 0.06 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const words = String(text).split(' ');
  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {words.flatMap((w, i) => [
        i ? ' ' : null,
        <span key={`${w}-${i}`} className="mask" aria-hidden="true">
          <motion.span
            initial={reduce ? false : { y: '112%' }}
            animate={reduce || inView ? { y: 0 } : { y: '112%' }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >{w}</motion.span>
        </span>,
      ])}
    </Tag>
  );
}

// Bloque que aparece desplazándose suavemente hacia arriba.
export function Reveal({ children, delay = 0, y = 28, as = 'div', className, style }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className} style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >{children}</Tag>
  );
}

// Filete que se dibuja de izquierda a derecha.
export function Rule({ delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`rule ${className}`} aria-hidden="true"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    />
  );
}

// Botón o enlace con el texto que rueda al pasar el cursor.
export function Btn({ href, onClick, children, variant = '', className = '', ...rest }) {
  const cls = `btn ${variant ? `btn-${variant}` : ''} ${className}`;
  const inner = <span className="roll"><span>{children}</span><span aria-hidden="true">{children}</span></span>;
  return href
    ? <a className={cls} href={href} onClick={onClick} {...rest}>{inner}</a>
    : <button type="button" className={cls} onClick={onClick} {...rest}>{inner}</button>;
}

// Atrae suavemente su contenido hacia el puntero (solo con ratón y sin movimiento reducido).
export function Magnetic({ children, strength = 0.3 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 });
  const fine = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;
  if (reduce || !fine) return <span className="magnet">{children}</span>;
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };
  return <motion.span ref={ref} className="magnet" style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={leave}>{children}</motion.span>;
}

// Barra de progreso de lectura en la parte superior.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const s = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return <motion.div className="progress-bar" style={{ scaleX: s }} aria-hidden="true" />;
}

// Cinta de texto infinita: acelera con el scroll y cambia de sentido al subir.
export function Marquee({ items }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const dir = useRef(1);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const smooth = useSpring(vel, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 2], { clamp: false });
  const x = useTransform(base, (v) => `${-(((v % 25) + 25) % 25)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < -0.01) dir.current = -1; else if (f > 0.01) dir.current = 1;
    let move = dir.current * 0.9 * (delta / 1000);
    move += dir.current * Math.abs(move) * Math.abs(f);
    base.set(base.get() + move);
  });

  const copy = (k) => items.map((it) => <span key={`${k}-${it}`}>{it}<i aria-hidden="true" /></span>);
  if (reduce) {
    return <div className="marquee static" aria-hidden="true"><div className="marquee-track">{copy(0)}</div></div>;
  }
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee-track" style={{ x }}>{copy(0)}{copy(1)}{copy(2)}{copy(3)}</motion.div>
    </div>
  );
}

// ¿Se puede fijar la sección y moverla en horizontal con el scroll?
export function usePinned() {
  const reduce = useReducedMotion();
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const f = () => setWide(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return wide && !reduce;
}
