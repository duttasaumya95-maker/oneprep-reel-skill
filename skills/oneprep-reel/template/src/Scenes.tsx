import React from 'react';
import { Easing, interpolate } from 'remotion';
import { CUE, SCENES, SEL_AT } from './timeline';
import { C, Card, Headline, SANS, SANS_T, SERIF, enterExit, lerp01 } from './ui';

const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const [S1, S2] = SCENES;
const S7 = SCENES[SCENES.length - 1];
const pop = (frame: number, at: number, d = 8, b = 2) => lerp01(frame, at, at + d, Easing.out(Easing.back(b)));
void SERIF; void S1; void S2;

const CheckSvg: React.FC<{ size: number; color: string; w?: number }> = ({ size, color, w = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CrossSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" /></svg>
);
const Tick: React.FC<{ frame: number; at: number; size?: number }> = ({ frame, at, size = 56 }) => {
  const s = pop(frame, at, 8, 2.2);
  return (
    <span style={{ flex: 'none', width: size, height: size, borderRadius: 14, border: `4px solid ${s > 0 ? C.green : '#D5D5D1'}`, background: s > 0 ? '#E6F7EF' : '#fff', boxSizing: 'border-box', display: 'grid', placeItems: 'center' }}>
      <span style={{ display: 'grid', transform: `scale(${s})` }}><CheckSvg size={size * 0.7} color={C.green} /></span>
    </span>
  );
};
const shake = (frame: number, at: number, amp = 10, len = 12) =>
  frame < at || frame > at + len ? 0 : Math.sin(((frame - at) / 2) * Math.PI) * amp * (1 - (frame - at) / len);
const Sticker: React.FC<{ frame: number; at: number; left: number; top: number; text: string; rot?: number; bg?: string; fade?: number }> = ({ frame, at, left, top, text, rot = -7, bg = '#FFD84D', fade = 1 }) => {
  const st = lerp01(frame, at, at + 7, Easing.out(Easing.back(2.6)));
  if (st <= 0) return null;
  return (
    <div style={{ position: 'absolute', left, top, transform: `rotate(${rot}deg) scale(${1.6 - 0.6 * st})`, opacity: Math.min(1, st * 3) * fade }}>
      <div style={{ background: bg, border: '4px solid #1A1A1A', borderRadius: 999, padding: '12px 30px', boxShadow: '0 8px 0 #1A1A1A', fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: C.ink, whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
};
void shake; void CrossSvg; void Tick; void interpolate; void Card; void SANS; void enterExit; void CUE; void SEL_AT; void Sticker;

const Stamp: React.FC<{ frame: number; at: number; top: number; text: string; color?: string; fade?: number; size?: number; rot?: number }> = ({ frame, at, top, text, color = C.red, fade = 1, size = 72, rot = -5 }) => {
  const s = lerp01(frame, at - 2, at + 6, Easing.out(Easing.back(2.4)));
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: fade }}>
      <span style={{ display: 'inline-block', transform: `rotate(${rot}deg) scale(${2 - s})`, opacity: Math.min(1, s * 2), border: `8px solid ${color}`, borderRadius: 18, padding: '4px 28px', background: 'rgba(247,247,245,0.92)', fontFamily: SANS_T, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
};
// ============================================================ Scene 1 — wrong, read the explanation, never again → same trap next month
export const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const out = S1.to - 6;
  const fade = 1 - lerp01(frame, out, out + 6);
  const q = enterExit(frame, CUE.wrongAt - 10);
  const ex = enterExit(frame, CUE.explAt - 4);
  const gone = lerp01(frame, CUE.neverAt, CUE.againAt + 6);
  const later = enterExit(frame, CUE.monthAt - 2);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={-24} gap={3} selAt={SEL_AT[0]} exitAt={out}
        words={[{ t: 'read it', k: 'b' }, { t: 'once?', k: 'sel' }]} />
      <div style={{ opacity: (1 - gone) * fade }}>
        <Card style={{ left: 120, width: 840, top: 450, padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...q }}>
          <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: C.ink }}>Q14 · percent change</span>
          <span style={{ display: 'grid', placeItems: 'center', width: 60, height: 60, borderRadius: 14, background: '#FDECEC' }}><CrossSvg size={34} color={C.red} /></span>
        </Card>
        <Card style={{ left: 120, width: 840, top: 590, padding: '20px 30px', ...ex }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: '#9A9A95' }}>EXPLANATION</div>
          {[90, 76].map((w, i) => <div key={i} style={{ height: 16, borderRadius: 8, background: '#E4E4E0', width: `${w}%`, marginTop: 18 }} />)}
        </Card>
      </div>
      <Sticker frame={frame} at={CUE.smartAt} left={620} top={560} text="felt smart" rot={7} bg="#fff" fade={1 - gone} />
      <Card style={{ left: 120, width: 840, top: 520, padding: '22px 30px', ...later, opacity: (later.opacity as number) * fade }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: '#9A9A95' }}>30 DAYS LATER · MOCK 4</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: C.ink, opacity: lerp01(frame, CUE.trapAt - 3, CUE.trapAt + 4) }}>Q9 · percent change</span>
          <span style={{ display: 'grid', placeItems: 'center', width: 60, height: 60, borderRadius: 14, background: '#FDECEC', opacity: lerp01(frame, CUE.trapAt, CUE.trapAt + 4) }}><CrossSvg size={34} color={C.red} /></span>
        </div>
      </Card>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 560, textAlign: 'center', fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: '#9A9A95', opacity: gone * (1 - lerp01(frame, CUE.monthAt - 6, CUE.monthAt)) }}>…never opened again.</div>
      <Stamp frame={frame} at={CUE.mistakeAt} top={760} text="SAME MISTAKE" fade={fade} />
    </>
  );
};

// ============================================================ Scene 2 — re-solve after 3 days, then 7 → can't? back in the pile
export const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const W = 680;
  const pts = [['Day 0', 'wrong', 0, CUE.resolveAt - 4, C.red], ['+3 days', 're-solve', 0.45, CUE.threeAt, C.blue], ['+7 days', 're-solve', 1, CUE.sevenAt, C.green]] as const;
  const line = lerp01(frame, CUE.resolveAt, CUE.sevenAt + 6);
  const loop = enterExit(frame, CUE.coldAt - 4);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={S2.from + 4} gap={4} selAt={SEL_AT[1]}
        words={[{ t: 're-solve', k: 'b' }, { t: 'it', k: 'sel' }]} />
      <Card style={{ left: 120, width: 840, top: 450, height: 230, padding: 0, ...enterExit(frame, S2.from + 2) }}>
        <div style={{ position: 'absolute', left: 80, top: 105, width: W, height: 10, borderRadius: 5, background: '#EEEEEA' }} />
        <div style={{ position: 'absolute', left: 80, top: 105, width: W * line, height: 10, borderRadius: 5, background: C.blue }} />
        {pts.map(([l, s, x, a, col]) => {
          const p = pop(frame, a - 2, 8, 2.2);
          return (
            <div key={l} style={{ position: 'absolute', left: 80 + W * x - 90, width: 180, top: 30, textAlign: 'center', transform: `scale(${p})`, opacity: p > 0 ? 1 : 0 }}>
              <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 32, color: C.ink }}>{l}</div>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: col, border: '5px solid #fff', boxShadow: '0 0 0 3px #1A1A1A', margin: '14px auto' }} />
              <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 30, color: col }}>{s}</div>
            </div>
          );
        })}
      </Card>
      <Card style={{ left: 120, width: 840, top: 730, padding: '22px 30px', ...loop }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: SANS_T, fontWeight: 800, fontSize: 40, color: C.ink }}>
          <span>Can’t solve it cold?</span>
          <span style={{ color: C.red, opacity: lerp01(frame, CUE.backAt - 3, CUE.backAt + 4) }}>↺ back in the pile</span>
        </div>
        <div style={{ marginTop: 14, textAlign: 'center', fontFamily: SANS_T, fontWeight: 800, fontSize: 38, color: C.green, opacity: lerp01(frame, CUE.stopAt - 3, CUE.stopAt + 5) }}>mistakes stop repeating ✓</div>
      </Card>
    </>
  );
};

// ============================================================ Scene 7 — ProductCardProgressiveAssemble + CursorPerformance + PopBurstConfirm
const field = (frame: number, at: number, mode: 'rise' | 'pop' = 'rise'): React.CSSProperties => {
  const k = lerp01(frame, at, at + 15, Easing.out(Easing.cubic));
  return { opacity: Math.min(1, k * 2), transform: mode === 'pop' ? `scale(${0.4 + 0.6 * Easing.out(Easing.back(1.70158))(k)})` : `translateY(${(1 - k) * 18}px)` };
};
const P0 = { x: 1180, y: 1700 }, P1 = { x: 900, y: 1780 }, P2 = { x: 1040, y: 1250 };
export const CTA_BTN = { x: 540, y: 1112 }; // click point (screen == world-local, camera holds)
const bez = (t: number) => {
  const u = 1 - t;
  const P3 = CTA_BTN;
  return { x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x, y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y };
};
export const Scene7: React.FC<{ frame: number }> = ({ frame }) => {
  const c0 = S7.from + 10; // card lands; fields assemble after it
  const ck = CUE.clickAt;
  // cursor: 16f bezier slide with overshoot (t→1.05 at 13f), hover 6f, click
  const ts = ck - 22;
  const ct = frame < ts + 13
    ? interpolate(frame, [ts, ts + 13], [0, 1.05], { ...cl, easing: Easing.out(Easing.cubic) })
    : interpolate(frame, [ts + 13, ts + 16], [1.05, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const cur = bez(ct);
  const dip = interpolate(frame, [ck, ck + 2, ck + 6], [0, 3, 0], cl);
  const press = interpolate(frame, [ck, ck + 2, ck + 6, ck + 10, ck + 14], [1, 0.96, 1, 1.03, 1], cl);
  const ripD = interpolate(frame, [ck, ck + 22], [60, 380], { ...cl, easing: Easing.out(Easing.cubic) });
  const ripO = interpolate(frame, [ck, ck + 26], [0.6, 0], cl);
  // PopBurstConfirm on the ✓ (release at okAt)
  const ok = CUE.okAt;
  const sc = frame < ok ? 0 : frame <= ok + 6 ? interpolate(frame, [ok, ok + 6], [0.6, 1.35], { ...cl, easing: Easing.out(Easing.cubic) }) : interpolate(frame, [ok + 6, ok + 17], [1.35, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const chk = lerp01(frame, ok, ok + 8, Easing.out(Easing.cubic));
  const pt = lerp01(frame, ok, ok + 14);
  const okLbl = lerp01(frame, ok + 4, ok + 12, Easing.out(Easing.back(2)));
  return (
    <>
      <Card style={{ left: 90, width: 900, top: 560, padding: '40px 44px', ...enterExit(frame, c0 - 8) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 26, borderBottom: '2px solid #EEEEEA', marginBottom: 30, ...field(frame, c0) }}>
          <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: C.ink }}>OnePrep</span>
          <span style={{ background: C.cta, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 28, lineHeight: 1, padding: '14px 22px', borderRadius: 999, ...field(frame, c0 + 20, 'pop') }}>Free seat</span>
        </div>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', marginBottom: 32 }}>
          <div style={{ flex: 'none', width: 200, height: 200, borderRadius: 24, background: C.cta, color: C.yellow, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: SANS_T, fontWeight: 800, fontSize: 34, lineHeight: 1.15, letterSpacing: '0.06em', ...field(frame, c0 + 2) }}>GMAT<br />EXPERT</div>
          <div>
            <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.ink, ...field(frame, c0 + 10) }}>Free 1-Day GMAT Session</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, lineHeight: 1.35, color: '#7A7A75', marginTop: 10, ...field(frame, c0 + 20) }}>Live with a 15+ year GMAT expert<br />Doubts cleared</div>
            <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 84, lineHeight: 1, color: C.red, marginTop: 14, transformOrigin: 'left center', ...field(frame, c0 + 40, 'pop') }}>Rs 0</div>
          </div>
        </div>
        <div style={{
          width: '100%', borderRadius: 26, background: C.cta, color: '#fff', fontFamily: SANS_T, fontWeight: 700, fontSize: 44, lineHeight: 1, padding: '38px 0', textAlign: 'center',
          ...field(frame, c0 + 55), transform: `${field(frame, c0 + 55).transform} scale(${press})`,
        }}>Book your free seat →</div>
        <div style={{ height: 76, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 14 }}>
          {frame >= ok && (
            <svg width={64} height={64} viewBox="0 0 480 480" style={{ transform: `scale(${sc})`, overflow: 'visible' }}>
              {pt < 1 && Array.from({ length: 10 }).map((_, i) => {
                const ang = ((i * 36 + 9 * Math.sin(i * 7.31)) * Math.PI) / 180;
                const d = 210 + 190 * Easing.out(Easing.cubic)(pt), len = 46 * (1 - pt);
                return <line key={i} x1={240 + Math.cos(ang) * d} y1={240 + Math.sin(ang) * d} x2={240 + Math.cos(ang) * (d + len)} y2={240 + Math.sin(ang) * (d + len)} stroke={i % 5 < 2 ? C.green : C.ink} strokeWidth={30} strokeLinecap="round" opacity={1 - pt} />;
              })}
              <circle cx={240} cy={240} r={190} fill={C.green} />
              <path d="M 150 245 L 215 310 L 340 175" fill="none" stroke="#fff" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chk} />
            </svg>
          )}
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.green, opacity: okLbl, transform: `scale(${0.6 + 0.4 * okLbl})` }}>Seat reserved</span>
        </div>
      </Card>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.grey, ...field(frame, c0 + 70) }}>
        Link below · oneprep.in
      </div>
      {frame >= ck && frame < ck + 26 && (
        <div style={{ position: 'absolute', left: CTA_BTN.x - ripD / 2, top: CTA_BTN.y - ripD / 2, width: ripD, height: ripD, borderRadius: '50%', border: '6px solid #fff', boxSizing: 'border-box', opacity: ripO, mixBlendMode: 'difference' }} />
      )}
      {frame >= ts && (
        <svg width={64} height={64} viewBox="0 0 28 28" style={{ position: 'absolute', left: cur.x - 4.5 + 60 * lerp01(frame, ok + 4, ok + 14, Easing.in(Easing.cubic)), top: cur.y - 2.3 + dip + 90 * lerp01(frame, ok + 4, ok + 14, Easing.in(Easing.cubic)), opacity: 1 - lerp01(frame, ok + 4, ok + 14), filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.3))' }}>
          <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill={C.ink} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
};
