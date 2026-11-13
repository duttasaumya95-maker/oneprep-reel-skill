// "Prep" — OnePrep's line-art mascot, reused from the preview artifact's SVG.
// Expressions E1–E7 and mouth shapes c/s/o/r/t (≈ brief M1–M5) are frame-driven.
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { CUE, LINES, SCENES, VO, FPS, ORIGIN, STEP_Y } from './timeline';
import { camAt } from './camera';

export type Exp = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';
export type Mouth = 'c' | 's' | 'o' | 'r' | 't';

const fb = { transformBox: 'fill-box' as const, transformOrigin: 'center' };

export const AvatarSvg: React.FC<{ exp: Exp; mouth: Mouth; bob: number; nod: number }> = ({ exp, mouth, bob, nod }) => {
  let m: Mouth | 'f' = mouth;
  if (mouth === 'c' && exp === 'e5') m = 'f';
  if (mouth === 'c' && (exp === 'e6' || exp === 'e7')) m = 't';
  const brow = { bl: '', br: '' };
  let eye = '';
  if (exp === 'e2') { brow.bl = 'translateY(-10px) rotate(-10deg)'; brow.br = 'translateY(2px)'; }
  if (exp === 'e3') { brow.bl = brow.br = 'translateY(-11px)'; eye = 'scale(1.4)'; }
  if (exp === 'e4') { brow.bl = brow.br = 'translateY(-9px)'; eye = 'translateY(-4px)'; }
  if (exp === 'e5') { brow.bl = 'translateY(4px) rotate(12deg)'; brow.br = 'translateY(4px) rotate(-12deg)'; }
  if (exp === 'e6' || exp === 'e7') { brow.bl = brow.br = 'translateY(-5px)'; }
  const S = '#1A1A1A';
  return (
    <svg viewBox="0 0 200 220" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <g transform={`translate(0 ${-bob + nod})`}>
        <path d="M20 224 C24 180 60 160 100 160 C140 160 176 180 180 224 Z" fill="#fff" stroke={S} strokeWidth={5} strokeLinejoin="round" />
        <path d="M86 168 L84 194 M114 168 L116 194" stroke="#4A7CF7" strokeWidth={5} strokeLinecap="round" />
        <path d="M80 150 Q100 178 120 150" fill="#fff" stroke={S} strokeWidth={5} />
        <ellipse cx={48} cy={104} rx={9} ry={14} fill="#fff" stroke={S} strokeWidth={5} />
        <ellipse cx={152} cy={104} rx={9} ry={14} fill="#fff" stroke={S} strokeWidth={5} />
        <ellipse cx={100} cy={98} rx={52} ry={60} fill="#fff" stroke={S} strokeWidth={5} />
        <path d="M47 98 C39 52 66 30 102 30 C140 30 163 54 153 99 C149 79 141 67 128 62 C114 73 88 75 68 64 C61 74 53 84 47 98 Z" fill={S} />
        <path d="M84 34 C88 18 104 15 113 26 M120 32 C128 22 140 24 144 32" stroke={S} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M64 83 Q78 76 92 82" fill="none" stroke={S} strokeWidth={5} strokeLinecap="round" style={{ ...fb, transform: brow.bl }} />
        <path d="M108 82 Q122 76 136 83" fill="none" stroke={S} strokeWidth={5} strokeLinecap="round" style={{ ...fb, transform: brow.br }} />
        <rect x={60} y={90} width={36} height={26} rx={10} fill="#fff" stroke={S} strokeWidth={4.5} />
        <rect x={104} y={90} width={36} height={26} rx={10} fill="#fff" stroke={S} strokeWidth={4.5} />
        <path d="M96 101 L104 101 M60 99 L50 96 M140 99 L150 96" stroke={S} strokeWidth={4} strokeLinecap="round" />
        <circle cx={78} cy={103} r={4.5} fill={S} style={{ ...fb, transform: eye }} />
        {exp === 'e7' ? (
          <path d="M114 104 Q122 98 130 104" fill="none" stroke={S} strokeWidth={4} strokeLinecap="round" />
        ) : (
          <circle cx={122} cy={103} r={4.5} fill={S} style={{ ...fb, transform: eye }} />
        )}
        <path d="M100 112 Q95 124 103 126" fill="none" stroke={S} strokeWidth={3.5} strokeLinecap="round" />
        <g fill={S} opacity={0.45}>
          {[[76, 138], [82, 146], [90, 151], [110, 151], [118, 146], [124, 138], [100, 153]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />
          ))}
        </g>
        {m === 'c' && <path d="M86 134 Q100 144 114 134" fill="none" stroke={S} strokeWidth={4.5} strokeLinecap="round" />}
        {m === 'f' && <path d="M88 137 L112 136" fill="none" stroke={S} strokeWidth={4.5} strokeLinecap="round" />}
        {m === 's' && <ellipse cx={100} cy={137} rx={9} ry={4.5} fill={S} />}
        {m === 'o' && <ellipse cx={100} cy={138} rx={11} ry={8.5} fill={S} />}
        {m === 'r' && <ellipse cx={100} cy={138} rx={6} ry={7} fill={S} />}
        {m === 't' && <path d="M86 132 Q100 148 114 132 Z" fill="#fff" stroke={S} strokeWidth={4} strokeLinejoin="round" />}
        {exp === 'e4' && (
          <g fill="#fff" stroke={S} strokeWidth={4.5}>
            <path d="M14 168 C8 150 12 134 22 132 C30 131 32 144 32 156" />
            <path d="M186 168 C192 150 188 134 178 132 C170 131 168 144 168 156" />
          </g>
        )}
        {(exp === 'e6' || exp === 'e7') && (
          <g fill="#fff" stroke={S} strokeWidth={4.5} strokeLinejoin="round">
            <rect x={-30} y={171} width={40} height={13} rx={6.5} />
            <rect x={2} y={164} width={36} height={30} rx={12} />
          </g>
        )}
      </g>
    </svg>
  );
};

// ---- lip-sync: map the character being spoken to a mouth shape
const charMouth = (c: string): Mouth => {
  const ch = c.toLowerCase();
  if ('mbp'.includes(ch)) return 'c';
  if ('ai'.includes(ch)) return 'o';
  if ('ouwq'.includes(ch)) return 'r';
  if ('esz'.includes(ch) || ch === 'y') return 't';
  if (/[a-z0-9]/.test(ch)) return 's';
  return 'c';
};
export const mouthAt = (frame: number): Mouth => {
  for (const id of Object.keys(VO)) {
    const L = LINES[id];
    const t = (frame - VO[id]) / FPS;
    if (t < 0 || t > L.dur) continue;
    // hold each shape ≥2 frames: sample at the start of the 2-frame bucket
    const tq = (Math.floor((frame - VO[id]) / 2) * 2) / FPS;
    for (let i = 0; i < L.chars.length; i++) {
      if (tq >= L.cs[i] && tq < L.ce[i]) return charMouth(L.chars[i]);
    }
    return 'c';
  }
  return 'c';
};

// ---- choreography: screen-space keys, or world-space ("w") keys that ride the camera
type Key = { f: number; x: number; y: number; w: number; ring?: boolean; show: boolean; exp: Exp; world?: boolean };
const [, s2] = SCENES;
const s7 = SCENES[SCENES.length - 1];
const KEYS: Key[] = [
  { f: -10, x: 60, y: 1225, w: 220, show: false, exp: 'e2' },
  { f: 10, x: 60, y: 1225, w: 220, show: true, exp: 'e6' },
  { f: CUE.av1, x: 60, y: 1225, w: 220, show: true, exp: 'e3' },
  { f: s2.from + 4, x: 840, y: 1250, w: 170, show: true, exp: 'e4' },
  { f: CUE.av2, x: 840, y: 1250, w: 170, show: true, exp: 'e6' },
  { f: s7.from, x: 840, y: 1250, w: 170, show: false, exp: 'e6' },
  { f: s7.from + 26, x: 800, y: 300, w: 220, show: true, exp: 'e6' },
  { f: s7.to - 10, x: 800, y: 300, w: 220, show: true, exp: 'e7' },
];
void STEP_Y;

const MOVE = 9;
const toScreen = (k: Key, frame: number) => {
  if (!k.world) return { x: k.x, y: k.y, w: k.w };
  const sceneIdx = SCENES.findIndex((s) => frame < s.to) ;
  const o = ORIGIN[Math.max(0, sceneIdx)] ?? ORIGIN[4];
  const c = camAt(frame);
  // world -> screen (scale about screen centre)
  const wx = ORIGIN[4].x + k.x, wy = ORIGIN[4].y + k.y;
  void o;
  return { x: 540 + (wx - c.x - 540) * c.s, y: 960 + (wy - c.y - 960) * c.s, w: k.w * c.s };
};

export const Avatar: React.FC = () => {
  const frame = useCurrentFrame();
  let i = KEYS.length - 1;
  while (i > 0 && KEYS[i].f > frame) i--;
  const cur = KEYS[i];
  const prev = KEYS[Math.max(0, i - 1)];
  const a = toScreen(prev, frame);
  const b = toScreen(cur, frame);
  const moved = a.x !== b.x || a.y !== b.y || a.w !== b.w;
  const tRaw = interpolate(frame, [cur.f, cur.f + MOVE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t = Easing.bezier(0.34, 1.4, 0.64, 1)(tRaw);
  const x = moved && prev.show && cur.show ? a.x + (b.x - a.x) * t : b.x;
  const y = moved && prev.show && cur.show ? a.y + (b.y - a.y) * t : b.y;
  const w = moved && prev.show && cur.show ? a.w + (b.w - a.w) * t : b.w;
  // squash on landing (2 frames)
  const land = moved && prev.show && cur.show ? frame - (cur.f + MOVE) : 99;
  const squash = land >= 0 && land < 3 ? [0.1, 0.06, 0.02][land] : 0;
  // pop in (outBack ~6f) / out (5f)
  let sc = 1;
  if (cur.show && !prev.show) sc = Easing.out(Easing.back(2))(interpolate(frame, [cur.f, cur.f + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  if (!cur.show) sc = prev.show ? interpolate(frame, [cur.f, cur.f + 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  if (sc <= 0.001) return null;
  // idle bob 4px / 1s, nod 3-frame dip on each pill
  const bob = 2 + 2 * Math.sin((frame / FPS) * Math.PI * 2);
  const nodF = [...CUE.nods].map((p: number) => frame - p).find((d) => d >= 0 && d < 6);
  const nod = nodF === undefined ? 0 : [3, 7, 8, 5, 2, 0][nodF];
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, zIndex: 5,
        transform: `scale(${sc * (1 + squash * 0.8)}, ${sc * (1 - squash)})`,
        transformOrigin: '50% 100%',
      }}
    >
      {cur.ring ? (
        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', background: '#fff', border: '6px solid #1A1A1A', overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ marginTop: '-2%' }}>
            <AvatarSvg exp={cur.exp} mouth={mouthAt(frame)} bob={bob * 0.5} nod={nod} />
          </div>
        </div>
      ) : (
        <AvatarSvg exp={cur.exp} mouth={mouthAt(frame)} bob={bob} nod={nod} />
      )}
    </div>
  );
};
