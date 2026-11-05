// [DEMO-IMG] Genera las imágenes de demostración a partir de assets-demo/ (originales de Unsplash, ver
// public/img-demo/CREDITS.md). No toca public/img-cliente/ (material real del cliente).
//  - public/img-demo/{id}-{640|1280|1920|2400}.{avif,webp,jpg}
//  - public/img-demo/{id}-bn-*        blanco y negro (firma del hero)
//  - public/img-demo/{id}-plano-*     dibujo de líneas derivado (M10), mismo encuadre píxel a píxel
//  - public/img-demo/{id}-depth.webp  mapa de profundidad (Depth Anything v2, assets-demo/depth/)
//  - src/content/demo-images.js       manifiesto de dimensiones
// Fases (antes / durante / después): si existen assets-demo/{id}-antes.jpg y {id}-despues.jpg (mismo
// encuadre que la foto base), se generan {id}-antes-* y {id}-despues-* y el manifiesto marca `phases`.
// Si existe assets-demo/{id}-obra.jpg (par generado del mismo encuadre), se usa como capa «plano».
// Tratamiento unificado: sin filtros, solo un ligero ajuste de saturación común a toda la serie.
// Uso: npm run assets:demo   (y antes, si hace falta, los mapas: ver docs/skills-log.md)
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'assets-demo', f);
const pub = (f) => path.join(root, 'public/img-demo', f);
mkdirSync(pub(''), { recursive: true });

const WIDTHS = [640, 1280, 1920, 2400];
const MAX_1280 = 250 * 1024; // presupuesto de peso por imagen a 1280 px
const PAPER = { r: 246, g: 245, b: 242 };
const INK = { r: 11, g: 11, b: 11 };

const PHOTOS = {
  'casa-salon': ['bn', 'depth'],
  'casa-cocina': ['depth'],
  'casa-dormitorio': ['depth'],
  'casa-bano': ['depth'],
  'bano-plano': ['plano'],
  'proj-bano': [],
  'proj-obra': ['fases'], // «durante» del Piso Eixample; antes/después: assets-demo/proj-obra-{antes,despues}.jpg (IA, mismo encuadre)
  'proj-piso': [],
  'proj-cocina-roble': [],
  'proj-cocina-compacta': [],
  'proc-visita': [],
  'proc-proyecto': [],
  'proc-calendario': [],
  'proc-obra': [],
  'proc-entrega': [],
};

const grade = (img) => img.modulate({ saturation: 0.92 });

// Dibujo de líneas (Sobel), igual que en make-assets.mjs
async function plano(file, width) {
  const { data, info } = await sharp(file).resize({ width }).greyscale().blur(1.1).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 3);
  const at = (x, y) => data[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  const k = width / 1100; // umbral estable entre anchos
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const gx = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      const a = Math.min(1, Math.max(0, (Math.sqrt(gx * gx + gy * gy) - 52 / Math.sqrt(k)) / 90)) * 0.92;
      const i = (y * w + x) * 3;
      out[i] = PAPER.r + (INK.r - PAPER.r) * a; out[i + 1] = PAPER.g + (INK.g - PAPER.g) * a; out[i + 2] = PAPER.b + (INK.b - PAPER.b) * a;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } });
}

async function writeSet(pipe, name, w) {
  // WebP/JPG ajustan calidad hasta caber en el presupuesto a 1280 px
  let q = 78;
  for (;;) {
    const webp = await pipe.clone().webp({ quality: q, effort: 5 }).toBuffer();
    if (w !== 1280 || webp.length <= MAX_1280 || q <= 52) { writeFileSync(pub(`${name}-${w}.webp`), webp); break; }
    q -= 4;
  }
  const jq = Math.max(60, q);
  await pipe.clone().jpeg({ quality: jq, mozjpeg: true, progressive: true }).toFile(pub(`${name}-${w}.jpg`));
  await pipe.clone().avif({ quality: Math.max(40, q - 26), effort: 4 }).toFile(pub(`${name}-${w}.avif`));
}

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const manifest = {};
for (const [id, variants] of Object.entries(PHOTOS)) {
  const file = src(`${id}.jpg`);
  const meta = await sharp(file).metadata();
  let widths = WIDTHS.filter((w) => w <= meta.width);
  // Fases: no se amplía nada; si las versiones de IA son más pequeñas, la serie se limita a su ancho
  const phaseFiles = variants.includes('fases') ? ['antes', 'despues'].filter((f) => existsSync(src(`${id}-${f}.jpg`))) : [];
  if (phaseFiles.length) {
    const minW = Math.min(...(await Promise.all(phaseFiles.map(async (f) => (await sharp(src(`${id}-${f}.jpg`)).metadata()).width))));
    widths = [...WIDTHS.filter((w) => w < minW), minW].filter((w, i, a) => a.indexOf(w) === i && w <= meta.width);
  }
  const max = widths.at(-1);
  manifest[id] = { width: max, height: Math.round((max * meta.height) / meta.width), widths, variants: variants.filter((v) => v !== 'depth') };
  if (variants.includes('plano')) manifest[id].obra = existsSync(src(`${id}-obra.jpg`));
  if (variants.includes('depth')) manifest[id].depth = true;
  const phases = variants.includes('fases') ? ['antes', 'despues'].filter((f) => existsSync(src(`${id}-${f}.jpg`))) : [];
  if (phases.length) manifest[id].phases = phases;
  if (ONLY && !ONLY.includes(id)) continue; // ONLY=bano-plano regenera solo esa imagen
  for (const w of widths) {
    const base = grade(sharp(file).resize({ width: w }));
    await writeSet(base, id, w);
    if (variants.includes('bn')) await writeSet(sharp(file).resize({ width: w }).greyscale().linear(1.05, -5), `${id}-bn`, w);
    for (const f of phases) {
      // mismo tamaño que la base para que los encuadres casen al píxel
      await writeSet(grade(sharp(src(`${id}-${f}.jpg`)).resize({ width: w, height: Math.round((w * meta.height) / meta.width), fit: 'cover' })), `${id}-${f}`, w);
    }
    if (variants.includes('plano')) {
      const obra = src(`${id}-obra.jpg`);
      const layer = existsSync(obra) ? grade(sharp(obra).resize({ width: w })) : await plano(file, w);
      manifest[id].obra = existsSync(obra);
      await writeSet(layer, `${id}-plano`, w);
    }
  }
  if (variants.includes('depth')) {
    // Normaliza (cerca = blanco) y suaviza bordes para que el desplazamiento no rasgue
    await sharp(src(`depth/${id}-depth.png`)).greyscale().normalise().blur(2.2).resize({ width: 1280 })
      .webp({ quality: 88 }).toFile(pub(`${id}-depth.webp`));
    manifest[id].depth = true;
  }
  console.log('ok', id, widths.join('/'));
}
writeFileSync(path.join(root, 'src/content/demo-images.js'),
  `// [DEMO-IMG] Generado por scripts/make-demo-assets.mjs. No editar a mano.\nexport const DEMO_IMAGES = ${JSON.stringify(manifest, null, 2)};\n`);
