// Piezas de obra (lenguaje propio, monocromo y de esquina recta como el marco del logo):
// losa, listón, marco cuadrado, arco de vano y círculo. Coordenadas centradas en (0, 0).
// Las usa la carga de entrada (SVG) y las piezas ambientales del hero (canvas 2D).

export const COLORS = { paper: '#F6F5F2', bone: '#ECEAE4', graphite: '#3A3A38', ink: '#0B0B0B' };

export function piecePath(shape, w, h = w) {
  const x = -w / 2; const y = -h / 2;
  const rect = (rx, ry, rw, rh) => `M${rx} ${ry}h${rw}v${rh}h${-rw}Z`;
  if (shape === 'rect') return rect(x, y, w, h);
  if (shape === 'frame') { const t = w * 0.2; return `${rect(x, y, w, h)}${rect(x + t, y + t, w - 2 * t, h - 2 * t)}`; }
  if (shape === 'arch') {
    const c = y + w / 2; const iw = w * 0.5;
    return `M${x} ${h / 2}V${c}A${w / 2} ${w / 2} 0 0 1 ${-x} ${c}V${h / 2}Z`
      + `M${-iw / 2} ${h / 2}V${c + w * 0.08}A${iw / 2} ${iw / 2} 0 0 1 ${iw / 2} ${c + w * 0.08}V${h / 2}Z`;
  }
  if (shape === 'circle') { const r = w / 2; return `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`; }
  return rect(x, y, w, h);
}

// Canvas 2D: el mismo trazado (Path2D) para las piezas del hero.
const cache = new Map();
export function piecePath2D(shape, w, h = w) {
  const k = `${shape}:${w}:${h}`;
  if (!cache.has(k)) cache.set(k, new Path2D(piecePath(shape, w, h)));
  return cache.get(k);
}

// Marco del logo medido sobre el PNG (en un logo de 360 px de ancho): barras de ~7,5 px,
// izquierda 16,7–24,2, derecha 335,4–342,9, superior 16,4–23,3, hasta y = 314,4 (abierto por abajo).
// `to` = centro y escala final de cada pieza en esas coordenadas. Las de `frame` forman el marco.
export const PIECES = [
  { id: 'losa', shape: 'rect', w: 200, h: 40, fill: COLORS.bone, frame: true,
    from: { x: -170, y: -150, r: -14 }, to: { x: 179.8, y: 19.85, sx: 326.2 / 200, sy: 6.9 / 40 } },
  { id: 'liston-a', shape: 'rect', w: 28, h: 190, fill: COLORS.graphite, frame: true,
    from: { x: -250, y: 330, r: 18 }, to: { x: 20.45, y: 165.4, sx: 7.5 / 28, sy: 298 / 190 } },
  { id: 'liston-b', shape: 'rect', w: 28, h: 190, fill: COLORS.graphite, frame: true,
    from: { x: 640, y: 380, r: -22 }, to: { x: 339.15, y: 165.4, sx: 7.5 / 28, sy: 298 / 190 } },
  { id: 'marco', shape: 'frame', w: 120, h: 120, fill: COLORS.ink,
    from: { x: 590, y: -120, r: 12 }, to: { x: 120, y: 118, sx: 0.5, sy: 0.5 } },
  { id: 'arco', shape: 'arch', w: 110, h: 140, fill: COLORS.bone,
    from: { x: -190, y: 560, r: -8 }, to: { x: 238, y: 118, sx: 0.5, sy: 0.5 } },
  { id: 'circulo', shape: 'circle', w: 100, h: 100, fill: COLORS.graphite,
    from: { x: 430, y: 580, r: 0 }, to: { x: 180, y: 222, sx: 0.5, sy: 0.5 } },
];
