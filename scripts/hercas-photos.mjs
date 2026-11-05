// Iteración 3: fotos de Unsplash (licencia Unsplash) y avatares públicos de las reseñas de Google.
// Uso: node scripts/hercas-photos.mjs <carpeta-temporal-de-descargas>
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TMP = process.argv[2];
if (!TMP) { console.error('Falta la carpeta temporal'); process.exit(1); }
mkdirSync(TMP, { recursive: true });
const OUT = 'hercas/img';
mkdirSync(join(OUT, 'avatars'), { recursive: true });

// nombre → [id de Unsplash, autoría, tratamiento, anchos]
const PHOTOS = {
  salon: ['1493775379751-a6c3940f3cbc', 'Brendan Church', 'bw', [720, 1200]],
  oficio: ['1546664278-c0a27e0cdc88', 'Andre Hunter', 'bw-lift', [960, 1600]],
  caballeros: ['1520338661084-680395057c93', 'John Karlo Mendoza', 'color', [720, 1200]],
  color: ['1785456411888-c2e842552820', 'Yovanka Loria Salon', 'color', [720, 1200]],
  tratamiento: ['1596911647169-7085321c81b8', 'Thalia Ruiz', 'color', [720, 1200]],
  novia: ['1782787229897-2208730e6f01', 'Alexander Mass', 'color', [720, 1200]],
  cierre: ['1606251706444-d069cd266189', 'Lydia Turner', 'color', [960, 1600]],
  paso1: ['1726555147209-78e56a920874', 'kimia kazemi', 'bw', [720, 1200]],
  paso2: ['1717160675643-53a7a2ebaa9f', 'QUENTIN Mahe', 'color', [720, 1200]],
  paso3: ['1647462741351-4e7a5e7317c7', 'Gabriela', 'bw', [720, 1200]],
  paso4: ['1580618672591-eb180b1a973f', 'Adam Winger', 'color', [720, 1200]],
};

async function fetchTo(url, file) {
  if (existsSync(file)) return;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

for (const [name, [id, , mode, widths]] of Object.entries(PHOTOS)) {
  const src = join(TMP, `${id}.jpg`);
  await fetchTo(`https://images.unsplash.com/photo-${id}?w=2200&q=85&fm=jpg`, src);
  let img = sharp(src).rotate();
  // B/N editorial con un punto cálido; color sobrio (sin tintes rosas)
  img = mode === 'bw-lift'
    ? img.grayscale().gamma(1.6).linear(1.25, 6).tint({ r: 238, g: 232, b: 226 })
    : mode === 'bw'
    ? img.grayscale().linear(1.08, -8).tint({ r: 238, g: 232, b: 226 })
    : img.modulate({ saturation: 0.82, brightness: 0.98 }).linear(1.05, -5);
  for (const w of widths) {
    await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(OUT, `${name}-${w}.webp`));
  }
}

// Avatares públicos de Google de cada reseña (los mismos que muestra hoy su widget)
const AVATARS = {
  'lucas-feliu': 'https://lh3.googleusercontent.com/a-/ALV-UjUX07XNetj7EV14Dq1GSWulO58ViSYah8CECrk0MzjV-5fVTi7VRA=w128-h128-c-rp-mo-br100',
  'laura-cotano': 'https://lh3.googleusercontent.com/a-/ALV-UjV6XsqetULUTEdLkmY-PgduReE-dlw8Nsd2MvaaHUtbD8xsoT45=w128-h128-c-rp-mo-br100',
  'maria-olvido': 'https://lh3.googleusercontent.com/a-/ALV-UjWZFy4_xoAScqSQb1gJsuS0g07IMWsRlhAbklKGoZD7v2ArwfKs=w128-h128-c-rp-mo-br100',
  'ana-feliu': 'https://lh3.googleusercontent.com/a-/ALV-UjUlWfuCBBbUZ7xWA5XwiG4UYaqZSM-TwtHCqwEgIsT0zRWzWZGiyg=w128-h128-c-rp-mo-br100',
  fermin: 'https://lh3.googleusercontent.com/a-/ALV-UjVlty2_gsTj_SAM2cF1QFeFURQkXnXVXC3LxU6emErO9JtDWVYZ=w128-h128-c-rp-mo-br100',
  'miguel-sanchez': 'https://lh3.googleusercontent.com/a/ACg8ocL3EW-rm0pUMJYHaEwP_CYgl-dQe0Wb_SWSVyLcjzMVdHMW6g=w128-h128-c-rp-mo-br100',
};
for (const [name, url] of Object.entries(AVATARS)) {
  const src = join(TMP, `av-${name}.img`);
  await fetchTo(url, src);
  await sharp(src).resize(96, 96).webp({ quality: 82 }).toFile(join(OUT, 'avatars', `${name}.webp`));
}

// Imagen OG con la nueva foto del hero
{
  const bg = await sharp(join(OUT, 'salon-1200.webp')).resize(1200, 630, { fit: 'cover', position: 'centre' }).modulate({ brightness: 0.8 }).toBuffer();
  const logoBuf = await sharp(join(OUT, 'logo@2x.webp')).resize({ width: 500 }).toBuffer();
  const meta = await sharp(logoBuf).metadata();
  const pw = meta.width + 96, ph = meta.height + 72;
  const plate = await sharp({ create: { width: pw, height: ph, channels: 4, background: '#f7f1ef' } }).png().toBuffer();
  await sharp(bg).composite([
    { input: plate, left: 72, top: 630 - ph - 72 },
    { input: logoBuf, left: 72 + 48, top: 630 - ph - 72 + 36 },
  ]).jpeg({ quality: 84 }).toFile('hercas/og-image.jpg');
}

writeFileSync('hercas/CREDITS.md', `# Créditos de imágenes

Fotografías de [Unsplash](https://unsplash.com) bajo la [licencia Unsplash](https://unsplash.com/license) (uso libre, también comercial). Son provisionales hasta contar con fotos del propio salón.

| Archivo | Autoría | Foto |
|---|---|---|
${Object.entries(PHOTOS).map(([n, [id, a]]) => `| ${n}-*.webp | ${a} | https://images.unsplash.com/photo-${id} |`).join('\n')}

Avatares de reseñas (\`img/avatars/\`): fotos de perfil públicas de Google de cada autor/a, las mismas que muestra hoy el widget de reseñas de hercaspeluqueria.com.

`);
console.log('ok');
