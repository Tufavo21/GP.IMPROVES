import { IMAGES } from '../content/images.js';

// <picture> WebP + JPG con dimensiones explícitas (sin CLS). Carga diferida salvo `priority`.
// variant: '' | 'bn' | 'plano' (versiones derivadas generadas por scripts/make-assets.mjs)
export default function Picture({ id, variant = '', alt, sizes = '100vw', priority = false, className, imgClassName, style, ...rest }) {
  const m = IMAGES[id];
  if (!m) return null;
  const name = variant ? `${id}-${variant}` : id;
  const set = (ext) => m.widths.map((w) => `/img-cliente/${name}-${w}.${ext} ${w}w`).join(', ');
  const mid = m.widths[Math.min(1, m.widths.length - 1)];
  return (
    <picture className={className} style={style} {...rest}>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/img-cliente/${name}-${mid}.jpg`}
        srcSet={set('jpg')}
        sizes={sizes}
        width={m.width}
        height={m.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        className={imgClassName}
        draggable="false"
      />
    </picture>
  );
}

export const imgSrc = (name, w, ext = 'webp') => `/img-cliente/${name}-${w}.${ext}`;
