// Genera imágenes optimizadas (AVIF/WebP), manifest de dimensiones, favicons, iconos PWA y OG
// a partir de public/img-cliente. Uso: npm run assets
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'assets-cliente', f);
const pub = (f) => path.join(root, 'public', f);
mkdirSync(pub('img'), { recursive: true });

// Fotos del cliente: ampliaciones de baja resolución, se limita el ancho máximo servido.
const photos = {
  'cocina-marmol-negra': [640, 1200, 1800],
  'cocina-roble-grafito': [640, 1200],
  'bano-gres-piedra': [480, 800],
  'cocina-obra-molduras': [480, 800],
  'cocina-blanca-compacta': [480, 800],
};
const manifest = {};
for (const [name, widths] of Object.entries(photos)) {
  const meta = await sharp(src(`${name}.jpg`)).metadata();
  const ratio = meta.height / meta.width;
  manifest[name] = { ratio, width: widths.at(-1), height: Math.round(widths.at(-1) * ratio), widths };
  for (const w of widths) {
    const base = sharp(src(`${name}.jpg`)).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(pub(`img/${name}-${w}.avif`));
    await base.clone().webp({ quality: 74 }).toFile(pub(`img/${name}-${w}.webp`));
  }
}
writeFileSync(path.join(root, 'src/data/images.js'),
  `// Generado por scripts/make-assets.mjs. No editar a mano.\nexport const IMAGES = ${JSON.stringify(manifest, null, 2)};\n`);

// Logo: versiones transparentes originales; se sirven tal cual (WebP sin pérdida) además del PNG.
for (const v of ['blanco', 'negro']) {
  await sharp(src(`logo/logo-2con2estudio-${v}.png`)).resize({ width: 480 }).png({ compressionLevel: 9 }).toFile(pub(`logo-2con2estudio-${v}.png`));
}

// Favicons derivados del logo blanco sobre placa negra (misma identidad monocroma).
const logoWhite = await sharp(src('logo/logo-2con2estudio-blanco.png')).trim().toBuffer();
async function tile(size, pad) {
  const inner = Math.round(size * (1 - pad * 2));
  const l = await sharp(logoWhite).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#000000' } })
    .composite([{ input: l, gravity: 'center' }]).png().toBuffer();
}
const out = [[16, 'favicon-16x16.png', 0.06], [32, 'favicon-32x32.png', 0.08], [48, 'favicon-48x48.png', 0.08],
  [180, 'apple-touch-icon.png', 0.14], [192, 'icon-192.png', 0.12], [512, 'icon-512.png', 0.12], [512, 'icon-512-maskable.png', 0.24]];
const bufs = {};
for (const [s, f, p] of out) { bufs[f] = await tile(s, p); writeFileSync(pub(f), bufs[f]); }

const ico = [[16, 'favicon-16x16.png'], [32, 'favicon-32x32.png'], [48, 'favicon-48x48.png']];
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(ico.length, 4);
let off = 6 + 16 * ico.length; const dirs = [];
for (const [s, f] of ico) {
  const d = Buffer.alloc(16); d[0] = s; d[1] = s; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
  d.writeUInt32LE(bufs[f].length, 8); d.writeUInt32LE(off, 12); off += bufs[f].length; dirs.push(d);
}
writeFileSync(pub('favicon.ico'), Buffer.concat([head, ...dirs, ...ico.map(([, f]) => bufs[f])]));

// favicon.svg: placa negra con el logo embebido
const b64 = (await sharp(logoWhite).resize({ width: 256 }).png().toBuffer()).toString('base64');
writeFileSync(pub('favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><image href="data:image/png;base64,${b64}" x="6" y="6" width="52" height="52"/></svg>`);

// OG 1200x630: lienzo gris cálido + logo negro + foto del cliente
const logoBlack = await sharp(src('logo/logo-2con2estudio-negro.png')).trim().resize({ height: 430 }).toBuffer();
const ph = await sharp(src('cocina-marmol-negra.jpg')).resize({ width: 600, height: 630, fit: 'cover', position: 'left' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#e5e5e5' } })
  .composite([{ input: logoBlack, left: 130, top: 100 }, { input: ph, left: 600, top: 0 }]).png().toFile(pub('og-image.png'));

writeFileSync(pub('site.webmanifest'), JSON.stringify({
  name: '2con2estudio', short_name: '2con2estudio', start_url: '/', display: 'standalone',
  background_color: '#cac7b4', theme_color: '#cac7b4',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2));
console.log('assets listos', Object.keys(manifest).length, 'fotos');
