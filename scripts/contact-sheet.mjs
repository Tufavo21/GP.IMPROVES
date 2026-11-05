// Monta una hoja de contacto con las capturas de verificación: node scripts/contact-sheet.mjs <dir> <out> [cols] [thumbW]
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import path from 'node:path';
const [dir, out, cols = 4, tw = 480, filter = ''] = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith('.png') && f.includes(filter)).sort();
const C = Number(cols); const TW = Number(tw);
const metas = await Promise.all(files.map((f) => sharp(path.join(dir, f)).metadata()));
const th = Math.round(TW * metas[0].height / metas[0].width);
const rows = Math.ceil(files.length / C);
const tiles = await Promise.all(files.map(async (f, i) => ({
  input: await sharp(path.join(dir, f)).resize({ width: TW, height: th, fit: 'cover', position: 'top' }).toBuffer(),
  left: (i % C) * (TW + 8), top: Math.floor(i / C) * (th + 26) + 22,
})));
const labels = files.map((f, i) => `<text x="${(i % C) * (TW + 8) + 4}" y="${Math.floor(i / C) * (th + 26) + 16}" font-size="14" font-family="Arial">${f}</text>`).join('');
await sharp({ create: { width: C * (TW + 8), height: rows * (th + 26), channels: 3, background: '#ddd' } })
  .composite([...tiles, { input: Buffer.from(`<svg width="${C * (TW + 8)}" height="${rows * (th + 26)}">${labels}</svg>`), left: 0, top: 0 }])
  .jpeg({ quality: 82 }).toFile(out);
console.log(out, files.length);
