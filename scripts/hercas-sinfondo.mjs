// Quita el fondo gris de estudio de las fotos del corte (clave de color + relleno desde los bordes).
// Uso: node scripts/hercas-sinfondo.mjs
import sharp from 'sharp';

const NAMES = ['antes', 'despues'];
const T_LO = 14;  // por debajo: fondo puro (transparente)
const T_HI = 58;  // por encima: sujeto (opaco); entre medias, borde suave

function fitBackground(data, W, H) {
  // Ajuste cuadrático por canal con píxeles que seguro son fondo: franja superior y laterales altos
  const rows = [];
  for (let y = 0; y < H; y += 4) {
    for (let x = 0; x < W; x += 4) {
      const fy = y / H, fx = x / W;
      if (fy < 0.07 || (fy < 0.55 && (fx < 0.07 || fx > 0.93))) rows.push([x / W, y / H, (y * W + x) * 3]);
    }
  }
  const terms = ([x, y]) => [1, x, y, x * x, y * y, x * y];
  const coef = [];
  for (let c = 0; c < 3; c++) {
    const n = 6, A = Array.from({ length: n }, () => new Float64Array(n)), b = new Float64Array(n);
    for (const r of rows) {
      const t = terms(r), v = data[r[2] + c];
      for (let i = 0; i < n; i++) { b[i] += t[i] * v; for (let j = 0; j < n; j++) A[i][j] += t[i] * t[j]; }
    }
    for (let i = 0; i < n; i++) { // eliminación gaussiana
      let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
      [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
      for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
    }
    const x = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    coef.push(x);
  }
  return (x, y) => coef.map((k) => { const t = terms([x / W, y / H]); return t.reduce((s, v, i) => s + v * k[i], 0); });
}

for (const name of NAMES) {
  const src = `hercas/img/corte-${name}.png`;
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const bg = fitBackground(data, W, H);
  const bgc = new Float32Array(N * 3);
  const dist = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, c = bg(x, y);
    bgc[i * 3] = c[0]; bgc[i * 3 + 1] = c[1]; bgc[i * 3 + 2] = c[2];
    dist[i] = Math.hypot(data[i * 3] - c[0], data[i * 3 + 1] - c[1], data[i * 3 + 2] - c[2]);
  }
  // Solo es fondo lo que está conectado con el borde de la foto (los blancos de ojos y dientes se quedan)
  const region = new Uint8Array(N);
  const stack = [];
  const seed = (i) => { if (!region[i] && dist[i] < T_HI) { region[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) seed(i - 1); if (x < W - 1) seed(i + 1); if (y > 0) seed(i - W); if (y < H - 1) seed(i + W);
  }
  // huecos de fondo encerrados entre rizos: casi el mismo gris aunque no toquen el borde
  for (let i = 0; i < N; i++) {
    const fx = (i % W) / W, fy = ((i / W) | 0) / H;
    const face = fx > 0.27 && fx < 0.73 && fy > 0.32;   // cara, ojos y dientes: nunca
    if (!region[i] && !face && fy < 0.62 && dist[i] < 22) region[i] = 1;
  }
  // Alfa suave en la zona de borde y color «limpio» (se resta el gris del fondo de los mechones finos)
  const alpha = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (!region[i]) { alpha[i] = 255; continue; }
    const t = Math.min(1, Math.max(0, (dist[i] - T_LO) / (T_HI - T_LO)));
    alpha[i] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  // Banda de 5 px junto al fondo: píxeles mezcla de pelo oscuro y gris. El alfa sale de su luminancia
  // entre el color local del pelo (mínimo 7×7) y el del fondo; así desaparece el halo gris.
  const lum = (r, g, b) => r * 0.3 + g * 0.59 + b * 0.11;
  const L = new Float32Array(N);
  for (let i = 0; i < N; i++) L[i] = lum(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  let near = Uint8Array.from(region);
  for (let pass = 0; pass < 5; pass++) {
    const next = Uint8Array.from(near);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (!near[i] && (near[i - 1] || near[i + 1] || near[i - W] || near[i + W])) next[i] = 1;
    }
    near = next;
  }
  for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) {
    const i = y * W + x;
    if (region[i] || !near[i]) continue;
    let lf = 255;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) lf = Math.min(lf, L[i + dy * W + dx]);
    const lb = lum(bgc[i * 3], bgc[i * 3 + 1], bgc[i * 3 + 2]);
    if (lf > 95 || L[i] <= lf || lb - lf < 40) continue; // solo bordes de pelo/camiseta oscuros
    const a = Math.min(1, Math.max(0, (lb - L[i]) / (lb - lf)));
    alpha[i] = Math.min(alpha[i], Math.round(Math.pow(a, 0.8) * 255));
  }
  // se recoge el contorno 1 px (quita el último anillo gris) y luego se suaviza 3×3
  const choked = new Uint8Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 255;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) m = Math.min(m, alpha[yy * W + xx]);
    }
    choked[y * W + x] = m;
  }
  const softA = new Uint8Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, k = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += choked[yy * W + xx]; k++; }
    }
    softA[y * W + x] = Math.round(s / k);
  }
  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const a = softA[i] / 255;
    for (let c = 0; c < 3; c++) {
      const p = data[i * 3 + c], b = bgc[i * 3 + c];
      out[i * 4 + c] = a > 0.02 && a < 0.98 ? Math.max(0, Math.min(255, Math.round((p - (1 - a) * b) / a))) : p;
    }
    out[i * 4 + 3] = softA[i];
  }
  const img = sharp(out, { raw: { width: W, height: H, channels: 4 } });
  await img.clone().png({ compressionLevel: 9 }).toFile(`hercas/img/corte-${name}-sinfondo.png`);
  for (const w of [720, 1135]) {
    await img.clone().resize({ width: w }).webp({ quality: 84, alphaQuality: 90 }).toFile(`hercas/img/corte-${name}-sinfondo-${w}.webp`);
  }
  let transparent = 0; for (let i = 0; i < N; i++) if (softA[i] < 8) transparent++;
  console.log(name, `${W}x${H}`, 'fondo transparente', (transparent / N * 100).toFixed(1) + '%');
}
