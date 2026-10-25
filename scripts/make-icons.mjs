// Genera favicons, iconos PWA, logo y OG a partir del mismo símbolo (sol sobre horizonte).
// Uso: npm run icons
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const pub = new URL('../public/', import.meta.url);
const out = (f) => new URL(f, pub);

const mark = (stroke, sw = 1.6) => `
  <path d="M6 16a8 8 0 0 1 16 0" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M3 16h22" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M8 20h12" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M11 24h6" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;

// Favicon: placa Graphite con símbolo blanco (legible en pestañas claras y oscuras)
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#161616"/><g transform="translate(2 2)">${mark('#ffffff', 1.9)}</g></svg>`;
writeFileSync(out('favicon.svg'), favicon);

// Logo completo (marca + nombre), fondo transparente, blanco. Para fondo claro usar logo-dark.svg
const logo = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 28" role="img" aria-label="Marjal"><title>Marjal</title><g>${mark(c)}</g><text x="38" y="20" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif" font-size="19" font-weight="500" letter-spacing="-0.2" fill="${c}">Marjal</text></svg>`;
writeFileSync(out('logo.svg'), logo('#ffffff'));
writeFileSync(out('logo-dark.svg'), logo('#161616'));

const png = (svg, size, file) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toFile(new URL(file, pub).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#161616"/><g transform="translate(6 6) scale(0.8333)">${mark('#ffffff', 1.9)}</g></svg>`;

const sizes = [[16, 'favicon-16x16.png'], [32, 'favicon-32x32.png'], [48, 'favicon-48x48.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']];
const bufs = {};
for (const [s, f] of sizes) {
  const svg = f.startsWith('apple') ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#161616"/><g transform="translate(2 2)">${mark('#ffffff', 1.9)}</g></svg>` : favicon;
  bufs[s] = await sharp(Buffer.from(svg), { density: 800 }).resize(s, s).png().toBuffer();
  writeFileSync(out(f), bufs[s]);
}
writeFileSync(out('icon-512-maskable.png'), await sharp(Buffer.from(maskableSvg), { density: 800 }).resize(512, 512).png().toBuffer());

// favicon.ico multi-tamaño (PNG embebido): 16, 32, 48
const icoSizes = [16, 32, 48];
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const dirs = icoSizes.map((s) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(s, 0); d.writeUInt8(s, 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3);
  d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
  d.writeUInt32LE(bufs[s].length, 8); d.writeUInt32LE(offset, 12);
  offset += bufs[s].length;
  return d;
});
writeFileSync(out('favicon.ico'), Buffer.concat([header, ...dirs, ...icoSizes.map((s) => bufs[s])]));

// Open Graph 1200×630 (degradado Hero Horizon + logo + frase)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.15"><stop offset="0" stop-color="#a3470a"/><stop offset="0.34" stop-color="#a83a2e"/><stop offset="0.78" stop-color="#1f46c4"/></linearGradient></defs>
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect x="40" y="40" width="1120" height="550" rx="42" fill="url(#g)"/>
  <g transform="translate(96 96) scale(2.4)">${mark('#ffffff', 1.5)}</g>
  <text x="180" y="150" font-family="Arial, sans-serif" font-size="46" font-weight="500" fill="#ffffff" letter-spacing="-1">Marjal</text>
  <text x="96" y="380" font-family="Arial, sans-serif" font-size="84" font-weight="500" fill="#ffffff" letter-spacing="-3">Estética médica,</text>
  <text x="96" y="470" font-family="Arial, sans-serif" font-size="84" font-weight="500" fill="#ffffff" letter-spacing="-3">sin prisa.</text>
  <text x="96" y="540" font-family="Arial, sans-serif" font-size="26" fill="#ffffff">València · Versión beta con contenido de demostración</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(new URL('og-image.png', pub).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

writeFileSync(out('site.webmanifest'), JSON.stringify({
  name: 'Marjal (DEMO)', short_name: 'Marjal', lang: 'es', start_url: '/', display: 'standalone',
  background_color: '#0a0a0a', theme_color: '#0a0a0a',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
console.log('icons ok');
