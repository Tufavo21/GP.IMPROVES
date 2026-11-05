import { IMAGES } from '../content/images.js';
import { DEMO_IMAGES } from '../content/demo-images.js';

// <picture> con dimensiones explícitas (sin CLS). Carga diferida salvo `priority`.
//  · Fotos del cliente (public/img-cliente/): WebP + JPG.
//  · [DEMO-IMG] Fotos de demostración (public/img-demo/, ver CREDITS.md): AVIF + WebP + JPG, 640/1280/1920/2400.
// variant: '' | 'bn' | 'plano' (versiones derivadas generadas por los scripts de assets)
export function imageMeta(id) {
  if (DEMO_IMAGES[id]) return { ...DEMO_IMAGES[id], dir: 'img-demo', formats: ['avif', 'webp'], demo: true };
  if (IMAGES[id]) return { ...IMAGES[id], dir: 'img-cliente', formats: ['webp'], demo: false };
  return null;
}

export default function Picture({ id, variant = '', alt, sizes = '100vw', priority = false, className, imgClassName, style, ...rest }) {
  const m = imageMeta(id);
  if (!m) return null;
  const name = variant ? `${id}-${variant}` : id;
  const set = (ext) => m.widths.map((w) => `/${m.dir}/${name}-${w}.${ext} ${w}w`).join(', ');
  const mid = m.widths[Math.min(1, m.widths.length - 1)];
  return (
    <picture className={className} style={style} data-demo-img={m.demo ? '' : undefined} {...rest}>
      {m.formats.map((f) => <source key={f} type={`image/${f}`} srcSet={set(f)} sizes={sizes} />)}
      <img
        src={`/${m.dir}/${name}-${mid}.jpg`}
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

// URL de un archivo concreto (canvas / WebGL). Elige el ancho más cercano por encima de `want`.
export function imgSrc(id, want, ext = 'webp', variant = '') {
  const m = imageMeta(id);
  if (!m) return '';
  const w = m.widths.find((x) => x >= want) || m.widths.at(-1);
  return `/${m.dir}/${variant ? `${id}-${variant}` : id}-${w}.${ext}`;
}
export const depthSrc = (id) => `/img-demo/${id}-depth.webp`;
