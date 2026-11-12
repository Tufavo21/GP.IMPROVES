import { useEffect, useRef } from 'react';
import { useTick, reducedMotion } from '../lib/hooks.js';
import { accent } from '../lib/accent.js';

// M1 traducido al sector: una sala a oscuras con haces de luz en la niebla, generada por
// shader (WebGL propio, sin Three.js ni fotos). El cursor deja un rastro líquido que quema
// en el color de la noche; en táctil lo hace un cursor fantasma. Se pausa fuera de la vista.
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uAcc; uniform float uIntro; uniform float uPtr;
uniform vec3 uTrail[8];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
float beam(vec2 p,vec2 o,float ang,float w){
  vec2 d=vec2(sin(ang),-cos(ang));vec2 q=p-o;float t=dot(q,d);
  float perp=abs(q.x*d.y-q.y*d.x);float width=w*(.18+t*1.05);
  return step(0.,t)*exp(-perp*perp/(width*width))*exp(-t*.42);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);
  float haze=fbm(p*1.7+vec2(uTime*.035,-uTime*.06));
  float haze2=fbm(p*3.1-vec2(uTime*.05,uTime*.02));
  vec3 col=vec3(.035)+uAcc*.05;
  for(int i=0;i<7;i++){
    float fi=float(i);
    float ox=(fi/6.-.5)*asp*1.2;
    float ang=sin(uTime*(.22+fi*.041)+fi*1.7)*.6+(uPtr-ox)*.3;
    float on=smoothstep(fi*.11,fi*.11+.28,uIntro);
    float b=beam(p,vec2(ox,.64),ang,.05);
    vec3 c=mix(uAcc,vec3(1.),mod(fi,3.)<1.?.8:.06);
    col+=c*b*on*(.5+haze*1.1);
  }
  col+=uAcc*.16*smoothstep(.05,-.6,p.y)*(.4+haze2);
  float m=0.;
  for(int i=0;i<8;i++){
    vec2 tp=vec2((uTrail[i].x-.5)*asp,uTrail[i].y-.5);
    float d=length(p-tp);m+=uTrail[i].z*.011/(d*d+.0035);
  }
  m*=.7+haze2*.7;
  col+=uAcc*smoothstep(.45,1.6,m)*.8+vec3(1.)*smoothstep(2.2,5.,m)*.22;
  col*=.82+.36*haze;
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.028;
  gl_FragColor=vec4(col,1.);
}`;

function setup(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = {};
  ['uRes', 'uTime', 'uAcc', 'uIntro', 'uPtr', 'uTrail'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });
  return { gl, u };
}

export default function LightCanvas({ activeRef }) {
  const ref = useRef(null);
  const st = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = setup(canvas);
    if (!g) { canvas.dataset.gl = 'off'; return undefined; }
    const trail = Array.from({ length: 8 }, () => ({ x: 0.5, y: 0.45, z: 0 }));
    const s = { ...g, trail, px: 0.5, py: 0.45, moved: 0, touch: window.matchMedia('(pointer: coarse)').matches, frames: 0, start: 0, size: '' };
    st.current = s;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      s.px = (e.clientX - r.left) / r.width; s.py = 1 - (e.clientY - r.top) / r.height; s.moved = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.__committeeGL = { frames: () => s.frames };
    return () => { window.removeEventListener('pointermove', onMove); st.current = null; };
  }, []);

  useTick((t) => {
    const s = st.current;
    const canvas = ref.current;
    if (!s || !canvas) return;
    const active = activeRef ? activeRef.current : true;
    if (!active && s.frames > 0) return; // tapado: no se dibuja
    if (reducedMotion && s.frames > 0 && !t.resized) return; // un único fotograma estático
    const dpr = Math.min(window.devicePixelRatio || 1, t.tier === 'mobile' ? 1 : 1.5);
    const w = Math.round(canvas.clientWidth * dpr); const h = Math.round(canvas.clientHeight * dpr);
    const key = `${w}x${h}`;
    if (key !== s.size) { canvas.width = w; canvas.height = h; s.gl.viewport(0, 0, w, h); s.size = key; }
    if (!s.start) s.start = t.time;
    const time = reducedMotion ? 12 : (t.time - s.start) / 1000;
    // Cursor fantasma: en táctil o si el puntero lleva un rato quieto.
    let { px, py } = s;
    const idle = t.time - s.moved > 2600;
    if (s.touch || idle) { px = 0.5 + Math.sin(time * 0.45) * 0.32; py = 0.46 + Math.sin(time * 0.71 + 1.3) * 0.2; }
    const head = s.trail[0];
    head.x += (px - head.x) * 0.22; head.y += (py - head.y) * 0.22; head.z = 1;
    for (let i = 1; i < s.trail.length; i += 1) {
      const a = s.trail[i]; const b = s.trail[i - 1];
      a.x += (b.x - a.x) * 0.2; a.y += (b.y - a.y) * 0.2; a.z = 1 - i / s.trail.length;
    }
    const flat = new Float32Array(24);
    s.trail.forEach((p, i) => { flat[i * 3] = p.x; flat[i * 3 + 1] = p.y; flat[i * 3 + 2] = reducedMotion ? 0 : p.z; });
    const { gl, u } = s;
    gl.uniform2f(u.uRes, w, h);
    gl.uniform1f(u.uTime, time);
    gl.uniform3f(u.uAcc, accent.rgb[0] / 255, accent.rgb[1] / 255, accent.rgb[2] / 255);
    gl.uniform1f(u.uIntro, reducedMotion ? 1 : Math.min(1, time / 2.4));
    gl.uniform1f(u.uPtr, (head.x - 0.5) * (w / h));
    gl.uniform3fv(u.uTrail, flat);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    s.frames += 1;
  });

  return <canvas ref={ref} className="light" aria-hidden="true" />;
}
