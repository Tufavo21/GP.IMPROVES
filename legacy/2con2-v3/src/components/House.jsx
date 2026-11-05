import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useI18n } from '../i18n/index.jsx';
import { Btn, EASE } from './ui.jsx';

// Trazo de rectángulo como <path> (todos los trazos llevan pathLength="1" para dibujarse al entrar).
const R = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;
let n = 0;
const P = ({ d, ...rest }) => { n += 1; return <path d={d} pathLength="1" style={{ '--d': n % 14 }} {...rest} />; };

// Qué estancias se encienden con cada tipo de reforma.
const MAP = { cocina: ['cocina'], bano: ['bano'], integral: ['cocina', 'bano', 'salon', 'dormitorio'], otras: ['salon', 'dormitorio'] };
const KEYS = ['cocina', 'bano', 'integral', 'otras'];
const ROOM_TO_SEL = { cocina: 'cocina', bano: 'bano', salon: 'otras', dormitorio: 'otras' };

// Casa en corte: cada estancia es una zona pulsable que abre el texto del tipo de reforma que le corresponde.
function Room({ id, box, label, sel, soft, onPick, children }) {
  const on = MAP[sel].includes(id);
  return (
    <g className="room" data-on={on ? (soft ? 'soft' : 'hard') : 'off'} onClick={() => onPick(ROOM_TO_SEL[id])}>
      <rect className="rm-bg" x={box[0]} y={box[1]} width={box[2]} height={box[3]} />
      <g className="art">{children}</g>
      <text className="rm-label" x={box[0] + 14} y={box[1] + 24}>{label}</text>
    </g>
  );
}

export default function House() {
  const { t, dict } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const [sel, setSel] = useState('cocina');
  n = 0;

  const s = dict.services;
  const names = dict.form.rooms.names;
  const content = {
    cocina: { ...s.items[0], tag: s.tags[0] },
    bano: { ...s.items[1], tag: s.tags[1] },
    integral: { ...s.items[2], tag: s.tags[2] },
    otras: { title: s.other.title, text: s.other.text, points: [], tag: s.tags[3] },
  };
  const c = content[sel];
  const soft = sel === 'integral';

  return (
    <div className="house-wrap">
      <div className="house-stage">
        <svg
          ref={ref} className="house" data-in={inView || reduce} viewBox="0 0 800 580" aria-hidden="true" focusable="false"
        >
          {/* tejado: levanta al elegir reforma integral */}
          <g className="roof" data-lift={sel === 'integral'} onClick={() => setSel('integral')}>
            <path className="roof-bg" d="M44 192 L400 62 L756 192 Z" />
            <g className="art">
              <P d="M44 192 L400 62 L756 192 Z" />
              <P d={R(572, 84, 38, 74)} />
              <P d="M120 168 L400 82 L680 168" />
              <P d="M190 150 L400 100 L620 150" />
            </g>
            <g className="smoke">
              <circle cx="591" cy="70" r="7" /><circle cx="598" cy="52" r="9" /><circle cx="590" cy="30" r="11" />
            </g>
          </g>

          <Room id="bano" box={[70, 192, 260, 160]} label={names.bano} sel={sel} soft={soft} onPick={setSel}>
            <P d={R(90, 296, 134, 44)} /><P d="M100 340v10M214 340v10" /><P d="M96 296v-26q0-8 8-8h12" />
            <P d={R(180, 214, 56, 50)} /><P d="M180 240h56" />
            <P d={R(284, 270, 22, 34)} /><P d="M264 304h56v28q0 8-8 8h-40q-8 0-8-8z" />
          </Room>

          <Room id="dormitorio" box={[330, 192, 400, 160]} label={names.dormitorio} sel={sel} soft={soft} onPick={setSel}>
            <P d={R(360, 252, 20, 88)} /><P d={R(380, 292, 184, 34)} /><P d={R(386, 274, 46, 18)} /><P d="M380 340v8M564 340v8" />
            <P d={R(578, 304, 44, 36)} /><P d="M600 304v-22" /><P d="M588 282h24l-4-14h-16z" />
            <P d={R(650, 214, 62, 86)} /><P d="M681 214v86M650 257h62" />
          </Room>

          <Room id="cocina" box={[70, 352, 310, 168]} label={names.cocina} sel={sel} soft={soft} onPick={setSel}>
            <P d={R(92, 458, 160, 52)} /><P d="M146 458v52M200 458v52" />
            <P d={R(92, 382, 160, 44)} /><P d="M172 382v44" />
            <P d={R(266, 382, 48, 128)} /><P d="M266 446h48" />
            <P d={R(328, 398, 40, 58)} /><P d="M348 398v58" />
            <P d="M348 352v26" /><circle cx="348" cy="384" r="6" pathLength="1" style={{ '--d': 7 }} />
          </Room>

          <Room id="salon" box={[380, 352, 350, 168]} label={names.salon} sel={sel} soft={soft} onPick={setSel}>
            <P d={R(470, 392, 126, 44)} /><P d="M533 392v44M470 414h126" />
            <P d={R(414, 452, 196, 24)} /><P d={R(414, 476, 196, 30)} /><P d={R(406, 462, 14, 44)} /><P d={R(604, 462, 14, 44)} />
            <P d="M660 400v106" /><P d="M638 400h44l-8 26h-28z" />
            <P d={R(692, 486, 22, 20)} /><P d="M703 486c-14-18-10-30-4-40M703 486c10-14 22-18 28-34" />
          </Room>

          {/* estructura exterior y suelo */}
          <g className="art frame">
            <P d="M70 192V520H730V192" /><P d="M70 352H730" /><P d="M330 192V352" /><P d="M380 352V520" />
            <P d="M30 520H770" />
          </g>
        </svg>
        <p className="house-hint cap">{t('services.hint')}</p>
      </div>

      <div className="house-side">
        <div className="chips" role="tablist" aria-label={t('services.tabsLabel')}>
          {KEYS.map((k) => (
            <button
              key={k} type="button" role="tab" id={`tab-${k}`} aria-selected={sel === k} aria-controls="svc-panel"
              className="chip" onClick={() => setSel(k)}
            >{content[k].title}</button>
          ))}
        </div>
        <div id="svc-panel" role="tabpanel" aria-labelledby={`tab-${sel}`} className="svc-panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sel}
              initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="cap sp-tag">{c.tag}</p>
              <h3 className="sp-title">{c.title}</h3>
              <p className="body">{c.text}</p>
              {c.points.length > 0 && <ul className="pts">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>}
              <div className="sp-cta"><Btn variant="white" href="#presupuesto">{s.cta}</Btn></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
