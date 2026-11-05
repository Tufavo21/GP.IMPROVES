// Genera los recursos de la demo de Hercas a partir de los originales descargados de hercaspeluqueria.com.
// Uso: node scripts/hercas-assets.mjs <carpeta-con-originales>
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.argv[2];
if (!SRC) { console.error('Falta la carpeta de originales'); process.exit(1); }
const OUT = 'hercas/img';
mkdirSync(OUT, { recursive: true });

const f = {
  logo: 'cropped-peluquerostribel202603_logo_web-scaled-1.png',
  icon: 'cropped-peluquerostribel202603_icon_web-scaled-1-270x270.png',
  cut: 'hairdresser-combing-woman-hair-in-beauty-salon-2026-01-09-07-05-18-utc-2048x1365.jpg',
  curls: 'at-the-hairdresser-s-2026-03-10-03-07-58-utc-2048x1367.jpg',
  dye: 'woman-dye-her-hair-at-beauty-salon-2026-03-24-23-29-26-utc-2048x1080.jpg',
  curly: 'Captura-desde-2026-03-26-10-09-23.png',
  pink: 'Captura-desde-2026-03-26-10-39-33.png',
  tools: 'Captura-desde-2026-03-26-09-14-43.png',
  barber: 'Captura-desde-2026-03-26-10-40-45.png',
};
const p = (k) => join(SRC, f[k]);

// --- Logo: original (rojo + etiqueta negra) y versión clara (blanco con texto calado) ---
const logo = sharp(p('logo')).trim();
await logo.clone().resize({ width: 640 }).webp({ quality: 90 }).toFile(join(OUT, 'logo.webp'));
await logo.clone().resize({ width: 1280 }).webp({ quality: 90 }).toFile(join(OUT, 'logo@2x.webp'));
{
  const { data, info } = await logo.clone().resize({ width: 1280 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const red = r - Math.max(g, b) > 90;               // trazo del script "hercas"
    const light = Math.min(r, g, b) / 255;              // texto blanco dentro de la etiqueta
    const alpha = red ? a : Math.round(a * (1 - light)); // calar el texto claro
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = alpha;
  }
  const light = sharp(data, { raw: info });
  await light.clone().webp({ quality: 90 }).toFile(join(OUT, 'logo-light@2x.webp'));
  await light.clone().resize({ width: 640 }).webp({ quality: 90 }).toFile(join(OUT, 'logo-light.webp'));
}

// --- Duotono rojo/negro sutil (sombras casi negras, medios rojo profundo, luces rosadas apagadas) ---
const stops = [
  [0.0, [12, 9, 9]],
  [0.55, [74, 16, 20]],
  [0.85, [168, 58, 60]],
  [1.0, [228, 200, 194]],
];
function lut(t) {
  for (let s = 1; s < stops.length; s++) {
    if (t <= stops[s][0]) {
      const [t0, c0] = stops[s - 1], [t1, c1] = stops[s];
      const k = (t - t0) / (t1 - t0);
      return c0.map((c, j) => Math.round(c + (c1[j] - c) * k));
    }
  }
  return stops.at(-1)[1];
}
async function duotone(src, name, widths, { extract } = {}) {
  let img = sharp(src);
  if (extract) img = img.extract(extract);
  const { data, info } = await img.grayscale().normalise().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < data.length; i++) out.set(lut(data[i] / 255), i * 3);
  const base = sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } });
  for (const w of widths) await base.clone().resize({ width: w }).webp({ quality: 78 }).toFile(join(OUT, `${name}-${w}.webp`));
}
async function natural(src, name, widths, mod = {}) {
  const base = sharp(src).modulate({ saturation: mod.saturation ?? 0.88, brightness: mod.brightness ?? 1 });
  for (const w of widths) await base.clone().resize({ width: w }).webp({ quality: 80 }).toFile(join(OUT, `${name}-${w}.webp`));
}

await duotone(p('cut'), 'hero', [960, 1600, 2048]);
await duotone(p('tools'), 'oficio', [960, 1600]);
await duotone(p('pink'), 'cierre', [960, 1600]);
await natural(p('curly'), 'corte', [720, 1200]);
await natural(p('pink'), 'color', [720, 1200], { saturation: 0.8 });
await natural(p('dye'), 'tratamiento', [720, 1200]);
await natural(p('curls'), 'recogido', [720, 1200]);
await natural(p('barber'), 'caballeros', [720, 1200]);

// --- Favicons desde el icono real (tijeras rojas sobre círculo negro) ---
for (const s of [16, 32, 48, 180, 192]) {
  const name = s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`;
  await sharp(p('icon')).resize(s, s).png().toFile(join(OUT, '..', name));
}

// --- Imagen OG 1200x630: duotono + logo sobre plaqueta clara ---
{
  const bg = await sharp(join(OUT, 'hero-1600.webp')).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer();
  const logoBuf = await sharp(join(OUT, 'logo@2x.webp')).resize({ width: 520 }).toBuffer();
  const meta = await sharp(logoBuf).metadata();
  const plate = await sharp({ create: { width: meta.width + 96, height: meta.height + 72, channels: 4, background: '#f7f1ef' } }).png().toBuffer();
  await sharp(bg)
    .composite([
      { input: plate, left: 72, top: 630 - (meta.height + 72) - 72 },
      { input: logoBuf, left: 72 + 48, top: 630 - (meta.height + 72) - 72 + 36 },
    ])
    .jpeg({ quality: 84 })
    .toFile(join(OUT, '..', 'og-image.jpg'));
}
console.log('ok');
