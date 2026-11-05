// Reglas de validación compartidas por el formulario (cliente) y la función serverless (servidor).
// Los errores son códigos; cada lado los traduce o los registra.

export const TIPOS = ['cocina', 'bano', 'integral', 'otro'];
export const VIVIENDAS = ['piso', 'casa', 'atico', 'otro'];
export const ESTANCIAS = ['cocina', 'bano', 'salon', 'dormitorio', 'pasillo', 'otra'];
export const ACABADOS = ['basico', 'medio', 'alto'];
export const PLAZOS = ['asap', '3m', '6m', 'mas6m', 'sin'];
export const MODOS = ['m2', 'lah'];

export const MIN_TEXT = 10;
export const MAX_TEXT = 2000;
export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = Math.round(1.5 * 1024 * 1024); // tras comprimir
export const MAX_TOTAL_BYTES = Math.round(3.1 * 1024 * 1024); // límite de payload serverless (4,5 MB) tras base64
export const MAX_INPUT_BYTES = 30 * 1024 * 1024; // foto original que se acepta leer en el navegador
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const PHOTO_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
export const roomArea = (r) =>
  r.modo === 'lah' ? (isNum(r.largo) && isNum(r.ancho) ? r.largo * r.ancho : NaN) : r.m2;
export const totalRoomArea = (rooms) => (rooms || []).reduce((s, r) => s + (roomArea(r) || 0), 0);

const text = (v, min = MIN_TEXT) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return 'required';
  if (s.length < min) return 'minLen';
  if (s.length > MAX_TEXT) return 'maxLen';
  return null;
};
const oneOf = (v, list) => (!v ? 'required' : list.includes(v) ? null : 'invalid');
const range = (v, min, max) => (!isNum(v) ? 'required' : v < min || v > max ? 'range' : null);

export function validateReform(d) {
  const e = {};
  const t = oneOf(d.tipo, TIPOS); if (t) e.tipo = t;
  if (d.tipo === 'otro') { const x = text(d.tipoOtro); if (x) e.tipoOtro = x; }
  return e;
}
export function validateHome(d) {
  const e = {};
  const v = oneOf(d.vivienda, VIVIENDAS); if (v) e.vivienda = v;
  if (d.vivienda === 'otro') { const x = text(d.viviendaOtro); if (x) e.viviendaOtro = x; }
  const m = range(d.m2Vivienda, 10, 2000); if (m) e.m2Vivienda = m;
  return e;
}
export function validateRooms(d) {
  const e = {};
  const rooms = Array.isArray(d.estancias) ? d.estancias : [];
  if (rooms.length < 1) e.estancias = 'required';
  else if (rooms.length > 8) e.estancias = 'count';
  rooms.forEach((r, i) => {
    const n = oneOf(r?.nombre, ESTANCIAS); if (n) e[`estancia.${i}.nombre`] = n;
    if (r?.modo === 'lah') {
      const l = range(r.largo, 0.5, 40); if (l) e[`estancia.${i}.largo`] = l;
      const a = range(r.ancho, 0.5, 40); if (a) e[`estancia.${i}.ancho`] = a;
      const h = range(r.alto, 1.8, 6); if (h) e[`estancia.${i}.alto`] = h;
    } else if (r?.modo === 'm2') {
      const m = range(r.m2, 1, 500); if (m) e[`estancia.${i}.m2`] = m;
    } else e[`estancia.${i}.modo`] = 'invalid';
  });
  return e;
}
export function validateFinish(d) {
  const e = {};
  const a = oneOf(d.acabados, ACABADOS); if (a) e.acabados = a;
  const p = oneOf(d.plazo, PLAZOS); if (p) e.plazo = p;
  return e;
}
export function validatePhotoMeta(f) {
  const ext = String(f.name || '').split('.').pop().toLowerCase();
  const typeOk = PHOTO_TYPES.includes(String(f.type || '').toLowerCase()) || (!f.type && PHOTO_EXT.includes(ext));
  if (!typeOk) return 'type';
  if (f.size > MAX_PHOTO_BYTES) return 'size';
  return null;
}
export function validatePhotos(d) {
  const e = {};
  const p = Array.isArray(d.fotos) ? d.fotos : [];
  if (p.length < MIN_PHOTOS) e.fotos = 'required';
  else if (p.length > MAX_PHOTOS) e.fotos = 'count';
  else {
    const bad = p.map(validatePhotoMeta).find(Boolean);
    if (bad) e.fotos = bad;
    else if (p.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) e.fotos = 'total';
  }
  return e;
}
export function validateContact(d) {
  const e = {};
  const n = typeof d.nombre === 'string' ? d.nombre.trim() : '';
  if (!n) e.nombre = 'required'; else if (n.length < 2 || n.length > 120) e.nombre = 'invalid';
  const em = typeof d.email === 'string' ? d.email.trim() : '';
  if (!em) e.email = 'required'; else if (!EMAIL_RE.test(em) || em.length > 200) e.email = 'invalid';
  const tel = typeof d.telefono === 'string' ? d.telefono.replace(/[\s.\-()]/g, '') : '';
  if (!tel) e.telefono = 'required'; else if (!/^\+?\d{9,15}$/.test(tel)) e.telefono = 'invalid';
  const m = text(d.mensaje); if (m) e.mensaje = m;
  if (d.rgpd !== true) e.rgpd = 'required';
  return e;
}

export const STEP_VALIDATORS = [
  validateReform, validateHome, validateRooms, validateFinish, validatePhotos, validateContact,
];

export function validateAll(d) {
  return Object.assign({}, ...STEP_VALIDATORS.map((v) => v(d)));
}
