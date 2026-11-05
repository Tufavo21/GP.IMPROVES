import { MAX_PHOTO_BYTES, MAX_INPUT_BYTES, PHOTO_TYPES, PHOTO_EXT } from '../../shared/schema.js';

export const isHeic = (f) => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
export const typeAllowed = (f) => {
  const ext = String(f.name || '').split('.').pop().toLowerCase();
  return PHOTO_TYPES.includes(String(f.type || '').toLowerCase()) || (!f.type && PHOTO_EXT.includes(ext));
};

async function decode(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* prueba con <img> */ }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch { return null; } finally { URL.revokeObjectURL(url); }
}

const toBlob = (canvas, q) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', q));

// Reduce la foto en el navegador (JPEG, lado máximo decreciente) hasta quedar bajo `target` bytes.
export async function compress(file, target = MAX_PHOTO_BYTES) {
  const src = await decode(file);
  if (!src) return null;
  const w0 = src.width || src.naturalWidth; const h0 = src.height || src.naturalHeight;
  let max = 2000; let q = 0.82; let last = null;
  for (let i = 0; i < 10; i += 1) {
    const s = Math.min(1, max / Math.max(w0, h0));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w0 * s)); canvas.height = Math.max(1, Math.round(h0 * s));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    last = await toBlob(canvas, q);
    if (last && last.size <= target) break;
    if (q > 0.6) q -= 0.08; else max = Math.round(max * 0.8);
  }
  if (src.close) src.close();
  return last && last.size <= target ? last : null;
}

// Devuelve { ok:true, blob, name, type, size, heic } o { ok:false, code }.
export async function processFile(file, target = MAX_PHOTO_BYTES) {
  if (!typeAllowed(file)) return { ok: false, code: 'type' };
  if (file.size > MAX_INPUT_BYTES) return { ok: false, code: 'size' };
  const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
  const blob = await compress(file, target);
  if (blob) return { ok: true, blob, name: `${base}.jpg`, type: 'image/jpeg', size: blob.size, heic: false };
  if (isHeic(file)) {
    // El navegador no sabe descodificar HEIC: se envía tal cual solo si ya cabe en el límite.
    if (file.size <= target) return { ok: true, blob: file, name: file.name, type: 'image/heic', size: file.size, heic: true };
    return { ok: false, code: 'heicBig' };
  }
  return { ok: false, code: 'decode' };
}

export const toBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = reject;
  r.readAsDataURL(blob);
});
