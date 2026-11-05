// Genera, a partir de assets-cliente/ (originales del cliente, no se publican):
//  - public/img-cliente/{foto}-{ancho}.{webp,jpg}   fotos responsive
//  - public/img-cliente/{foto}-bn-{ancho}.*          versión en blanco y negro (firma del hero)
//  - public/img-cliente/{foto}-plano-{ancho}.*       dibujo de líneas derivado de la foto (M10 y proceso)
//  - public/img-cliente/logo/                         logos tal cual los aportó el cliente
//  - favicons, iconos PWA, og-image.png y site.webmanifest
//  - src/content/images.js                            manifiesto de dimensiones
// Uso: npm run assets
import sharp from 'sharp';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'assets-cliente', f);
const pub = (f) => path.join(root, 'public', f);
mkdirSync(pub('img-cliente/logo'), { recursive: true });

const PAPER = { r: 246, g: 245, b: 242 };
const INK = { r: 11, g: 11, b: 11 };

// Las fotos aportadas son ampliaciones de capturas: se limita el ancho servido a lo que aguantan.
const PHOTOS = {
  'cocina-marmol-negra': { widths: [800, 1400, 2200], variants: ['plano'] },
  'cocina-roble-grafito': { widths: [800, 1400, 2048], variants: ['bn'] },
  'bano-gres-piedra': { widths: [640, 1100], variants: ['plano'] },
  'cocina-obra-molduras': { widths: [640, 1100], variants: ['plano'] },
  'cocina-blanca-compacta': { widths: [640, 1100], variants: [] },
};

// Dibujo de líneas: Sobel sobre la luminancia, trazo tinta sobre papel. Es una derivación de la
// propia foto (no un "antes" real) y la web lo presenta como ilustración.
async function plano(file, width) {
  const { data, info } = await sharp(file).resize({ width }).greyscale().blur(1.1)
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 3);
  const at = (x, y) => data[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const gx = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      const mag = Math.sqrt(gx * gx + gy * gy);
      const a = Math.min(1, Math.max(0, (mag - 38) / 90)) * 0.92;
      const i = (y * w + x) * 3;
      out[i] = PAPER.r + (INK.r - PAPER.r) * a;
      out[i + 1] = PAPER.g + (INK.g - PAPER.g) * a;
      out[i + 2] = PAPER.b + (INK.b - PAPER.b) * a;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } });
}

const manifest = {};
for (const [name, { widths, variants }] of Object.entries(PHOTOS)) {
  const file = src(`${name}.jpg`);
  const meta = await sharp(file).metadata();
  const ratio = meta.height / meta.width;
  const max = widths.at(-1);
  manifest[name] = { width: max, height: Math.round(max * ratio), widths, variants };
  for (const w of widths) {
    const base = sharp(file).resize({ width: w, withoutEnlargement: true });
    await base.clone().webp({ quality: 76 }).toFile(pub(`img-cliente/${name}-${w}.webp`));
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(pub(`img-cliente/${name}-${w}.jpg`));
    if (variants.includes('bn')) {
      const bn = sharp(file).resize({ width: w, withoutEnlargement: true }).greyscale().linear(1.06, -6);
      await bn.clone().webp({ quality: 74 }).toFile(pub(`img-cliente/${name}-bn-${w}.webp`));
      await bn.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(pub(`img-cliente/${name}-bn-${w}.jpg`));
    }
    if (variants.includes('plano')) {
      const p = await plano(file, w);
      await p.clone().webp({ quality: 80 }).toFile(pub(`img-cliente/${name}-plano-${w}.webp`));
      await p.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(pub(`img-cliente/${name}-plano-${w}.jpg`));
    }
  }
}
writeFileSync(path.join(root, 'src/content/images.js'),
  `// Generado por scripts/make-assets.mjs. No editar a mano.\nexport const IMAGES = ${JSON.stringify(manifest, null, 2)};\n`);

// Logos: se publican tal cual (sin redibujar ni "arreglar"), más una versión reducida para la cabecera.
for (const v of ['blanco', 'negro']) {
  copyFileSync(src(`logo/logo-2con2estudio-${v}.png`), pub(`img-cliente/logo/logo-2con2estudio-${v}.png`));
  await sharp(src(`logo/logo-2con2estudio-${v}.png`)).resize({ width: 360 }).png({ compressionLevel: 9 })
    .toFile(pub(`img-cliente/logo/logo-2con2estudio-${v}-360.png`));
}
const logoMeta = await sharp(src('logo/logo-2con2estudio-negro.png')).metadata();
writeFileSync(path.join(root, 'src/content/images.js'),
  `// Generado por scripts/make-assets.mjs. No editar a mano.\nexport const IMAGES = ${JSON.stringify(manifest, null, 2)};\n` +
  `export const LOGO = ${JSON.stringify({ width: logoMeta.width, height: logoMeta.height })};\n`);

// Favicons: logo blanco sobre placa de tinta (misma identidad monocroma). Esquinas rectas como el marco.
const logoWhite = await sharp(src('logo/logo-2con2estudio-blanco.png')).trim().toBuffer();
async function tile(size, pad) {
  const inner = Math.round(size * (1 - pad * 2));
  const l = await sharp(logoWhite).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#0B0B0B' } })
    .composite([{ input: l, gravity: 'center' }]).png().toBuffer();
}
const icons = [[16, 'favicon-16x16.png', 0.04], [32, 'favicon-32x32.png', 0.06], [48, 'favicon-48x48.png', 0.08],
  [180, 'apple-touch-icon.png', 0.14], [192, 'icon-192.png', 0.12], [512, 'icon-512.png', 0.12], [512, 'icon-512-maskable.png', 0.24]];
const bufs = {};
for (const [s, f, p] of icons) { bufs[f] = await tile(s, p); writeFileSync(pub(f), bufs[f]); }

const ico = [[16, 'favicon-16x16.png'], [32, 'favicon-32x32.png'], [48, 'favicon-48x48.png']];
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(ico.length, 4);
let off = 6 + 16 * ico.length; const dirs = [];
for (const [s, f] of ico) {
  const d = Buffer.alloc(16); d[0] = s; d[1] = s; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
  d.writeUInt32LE(bufs[f].length, 8); d.writeUInt32LE(off, 12); off += bufs[f].length; dirs.push(d);
}
writeFileSync(pub('favicon.ico'), Buffer.concat([head, ...dirs, ...ico.map(([, f]) => bufs[f])]));

const b64 = (await sharp(logoWhite).resize({ width: 256 }).png().toBuffer()).toString('base64');
writeFileSync(pub('favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0B0B0B"/><image href="data:image/png;base64,${b64}" x="5" y="5" width="54" height="54"/></svg>`);

// OG 1200x630: papel + logo negro + foto del cliente a sangre.
const logoBlack = await sharp(src('logo/logo-2con2estudio-negro.png')).trim().resize({ height: 380 }).toBuffer();
const ph = await sharp(src('cocina-marmol-negra.jpg')).resize({ width: 640, height: 630, fit: 'cover', position: 'centre' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#F6F5F2' } })
  .composite([{ input: logoBlack, left: 90, top: 125 }, { input: ph, left: 560, top: 0 }]).png().toFile(pub('og-image.png'));

writeFileSync(pub('site.webmanifest'), JSON.stringify({
  name: '2con2estudio', short_name: '2con2estudio', start_url: '/', display: 'standalone',
  background_color: '#F6F5F2', theme_color: '#F6F5F2',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2));
console.log('assets listos:', Object.keys(manifest).join(', '));
