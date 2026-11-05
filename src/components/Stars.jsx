import { useId } from 'react';

// Valoración en estrellas, monocroma (tinta sobre papel): contorno de 1 px para las vacías y relleno
// recortado al valor (admite medias). Un solo <svg> con role="img" y etiqueta legible.
const STAR = 'M7 0.9l1.8 3.9 4.2.5-3.1 2.9.8 4.2L7 10.3 3.3 12.4l.8-4.2L1 5.3l4.2-.5z';

export default function Stars({ value, label, size = 14 }) {
  const id = useId().replace(/:/g, '');
  const n = 5; const gap = 3; const w = n * 14 + (n - 1) * gap;
  const stars = Array.from({ length: n }, (_, i) => <path key={i} d={STAR} transform={`translate(${i * (14 + gap)} 0)`} />);
  // ancho relleno: estrellas completas + fracción de la siguiente
  const full = Math.floor(value); const frac = value - full;
  const fillW = full * (14 + gap) + frac * 14;
  return (
    <svg className="stars" role="img" aria-label={label} width={(w * size) / 14} height={size} viewBox={`0 0 ${w} 14`}>
      <defs><clipPath id={`st${id}`}><rect x="0" y="0" width={fillW} height="14" /></clipPath></defs>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke">{stars}</g>
      <g fill="currentColor" clipPath={`url(#st${id})`}>{stars}</g>
    </svg>
  );
}
