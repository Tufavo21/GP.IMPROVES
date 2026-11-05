// Renderizador WebGL mínimo (sin Three.js) para fotos con profundidad:
//  · desplazamiento por mapa de profundidad (cerca = blanco): la cámara se mueve ±3–4° aparentes;
//  · fundido direccional entre dos estancias (barrido con borde suave + leve desplazamiento).
// Devuelve null si no hay WebGL: quien lo usa enseña las imágenes estáticas.
const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `precision mediump float;
varying vec2 v;
uniform sampler2D imgA, depA, imgB, depB;
uniform vec2 aspA, aspB;     // escala de «cover» por textura
uniform vec2 cam;            // -1..1
uniform float mixv, dir, zoomA, zoomB, strength;
vec2 cover(vec2 uv, vec2 asp, float z){ return (uv - 0.5) * asp / z + 0.5; }
vec4 sampleRoom(sampler2D img, sampler2D dep, vec2 uv){
  float d = texture2D(dep, uv).r;
  vec2 off = cam * (d - 0.42) * strength;
  return texture2D(img, uv + off);
}
void main(){
  vec2 ua = cover(v, aspA, zoomA);
  vec2 ub = cover(v, aspB, zoomB);
  // barrido direccional: entra desde abajo al bajar y desde arriba al subir
  float edge = dir > 0.0 ? (1.0 - v.y) : v.y;
  float m = smoothstep(edge, edge + 0.2, mixv * 1.2);
  ub.y += (1.0 - m) * 0.04 * dir;
  vec4 a = sampleRoom(imgA, depA, ua);
  vec4 b = sampleRoom(imgB, depB, ub);
  gl_FragColor = mix(a, b, m);
}`;

export function createDepthRenderer(canvas) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch { gl = null; }
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch { return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['imgA', 'depA', 'imgB', 'depB', 'aspA', 'aspB', 'cam', 'mixv', 'dir', 'zoomA', 'zoomB', 'strength'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform1i(U.imgA, 0); gl.uniform1i(U.depA, 1); gl.uniform1i(U.imgB, 2); gl.uniform1i(U.depB, 3);

  const texture = (source) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const rooms = []; // { img, dep, w, h }
  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; });

  return {
    get lost() { return lost; },
    addRoom(i, image, depth) { rooms[i] = { img: texture(image), dep: texture(depth), w: image.naturalWidth, h: image.naturalHeight }; },
    has(i) { return !!rooms[i]; },
    resize(w, h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); },
    render({ a, b, mix, dir, cam, zoomA = 1.06, zoomB = 1.06, strength = 0.022 }) {
      if (lost) return false;
      const A = rooms[a]; const B = rooms[b] || A;
      if (!A) return false;
      const ca = canvas.width / canvas.height;
      const asp = (r) => { const ia = r.w / r.h; return ca > ia ? [1, ia / ca] : [ca / ia, 1]; };
      // cover: escala la coordenada de pantalla al recorte de la imagen
      const fa = asp(A); const fb = asp(B);
      gl.uniform2f(U.aspA, fa[0], fa[1]); gl.uniform2f(U.aspB, fb[0], fb[1]);
      gl.uniform2f(U.cam, cam[0], cam[1]);
      gl.uniform1f(U.mixv, mix); gl.uniform1f(U.dir, dir);
      gl.uniform1f(U.zoomA, zoomA); gl.uniform1f(U.zoomB, zoomB); gl.uniform1f(U.strength, strength);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.img);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, A.dep);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, B.img);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, B.dep);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return true;
    },
  };
}
