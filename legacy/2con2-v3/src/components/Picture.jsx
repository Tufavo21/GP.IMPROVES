import { IMAGES } from '../data/images.js';
import { asset } from '../lib/asset.js';

// <picture> AVIF + WebP con dimensiones explícitas (sin CLS). `priority` desactiva la carga diferida.
export default function Picture({ id, alt, sizes, priority = false, className, style }) {
  const m = IMAGES[id];
  const set = (ext) => m.widths.map((w) => `${asset(`img/${id}-${w}.${ext}`)} ${w}w`).join(', ');
  const fallbackW = m.widths[Math.min(1, m.widths.length - 1)];
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={asset(`img/${id}-${fallbackW}.webp`)}
        width={m.width}
        height={m.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={style}
      />
    </picture>
  );
}
