import React from 'react';
import { Easing, interpolate } from 'remotion';
import { loadFont as loadInterTight } from '@remotion/google-fonts/InterTight';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';

export const SANS_T = loadInterTight('normal', { weights: ['600', '700', '800'], subsets: ['latin'] }).fontFamily;
export const SANS = loadInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] }).fontFamily;
export const SERIF = loadSerif('italic', { weights: ['400'], subsets: ['latin'] }).fontFamily;

export const C = {
  bg: '#F7F7F5', grid: '#E6E6E3', grey: '#8A8A8A', ink: '#1A1A1A', blue: '#4A7CF7', paleBlue: '#E8EEFE',
  yellow: '#FFE45C', red: '#E5484D', green: '#2BB673', cta: '#111111',
};

const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const lerp01 = (frame: number, a: number, b: number, ease: (t: number) => number = (t) => t) =>
  ease(interpolate(frame, [a, b], [0, 1], cl));

export const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Card / block motion: slide up 60px with small overshoot in, fade + up 40px out. */
export const enterExit = (frame: number, inAt: number, outAt?: number, dist = 60): React.CSSProperties => {
  const i = lerp01(frame, inAt, inAt + 12, Easing.out(Easing.back(1.4)));
  const o = outAt === undefined ? 0 : lerp01(frame, outAt, outAt + 8, Easing.in(Easing.cubic));
  return {
    opacity: Math.min(1, lerp01(frame, inAt, inAt + 6)) * (1 - o),
    transform: `translateY(${(1 - i) * dist - o * 40}px)`,
  };
};

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: 'absolute', background: '#fff', borderRadius: 28,
      boxShadow: '0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)', boxSizing: 'border-box', ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- headline
export type HWord = { t: string; k?: 'b' | 'sel' | 'strike' };
export const Headline: React.FC<{
  frame: number; words: HWord[]; top: number; size?: number; start: number; gap?: number;
  selAt: number; exitAt?: number; strikeAt?: number; replace?: { t: string; at: number }; side?: number;
}> = ({ frame, words, top, size = 82, start, gap = 4, selAt, exitAt, strikeAt, replace, side = 70 }) => {
  const ex = exitAt === undefined ? 0 : lerp01(frame, exitAt, exitAt + 8, Easing.in(Easing.cubic));
  let idx = 0;
  return (
    <div
      style={{
        position: 'absolute', left: side, right: side, top, textAlign: 'center', fontFamily: SANS_T, fontWeight: 600,
        fontSize: size, lineHeight: 1.12, color: C.grey, letterSpacing: '-0.02em',
        opacity: 1 - ex, transform: `translateY(${-ex * 40}px)`,
      }}
    >
      {words.map((w, i) => {
        const at = w.k === 'sel' ? selAt : start + idx++ * gap;
        const p = lerp01(frame, at, at + 6, Easing.out(Easing.cubic));
        if (w.k === 'strike' && replace) {
          const cut = strikeAt === undefined ? 0 : lerp01(frame, strikeAt, strikeAt + 10, Easing.out(Easing.cubic));
          const gone = lerp01(frame, replace.at - 6, replace.at, Easing.in(Easing.quad));
          if (gone >= 1) return <React.Fragment key={i}><Sel frame={frame} t={replace.t} at={replace.at} />{' '}</React.Fragment>;
          return (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', position: 'relative', color: C.ink, fontWeight: 700, opacity: p * (1 - gone), transform: `translateY(${(1 - p) * 20 - gone * 16}px)` }}>
                {w.t}
                <span style={{ position: 'absolute', left: -4, right: -4, top: '54%', height: 7, borderRadius: 4, background: C.red, transform: `scaleX(${cut})`, transformOrigin: 'left' }} />
              </span>{' '}
            </React.Fragment>
          );
        }
        if (w.k === 'sel') return <React.Fragment key={i}><Sel frame={frame} t={w.t} at={at} />{' '}</React.Fragment>;
        return (
          <React.Fragment key={i}>
            <span style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, color: w.k === 'b' ? C.ink : C.grey, fontWeight: w.k === 'b' ? 700 : 600 }}>
              {w.t}
            </span>{' '}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Figma-style selected word: serif italic, blue box draws left→right in 8f, handles pop at the end. */
const Sel: React.FC<{ frame: number; t: string; at: number }> = ({ frame, t, at }) => {
  const p = lerp01(frame, at, at + 6, Easing.out(Easing.cubic));
  const box = lerp01(frame, at + 6, at + 14, Easing.out(Easing.cubic));
  const handles = frame >= at + 13 ? 1 : 0;
  const hs: React.CSSProperties = { position: 'absolute', width: 15, height: 15, background: '#fff', border: `3px solid ${C.blue}`, boxSizing: 'border-box', opacity: handles };
  return (
    <span
      style={{
        position: 'relative', display: 'inline-block', isolation: 'isolate', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400,
        fontSize: '1.2em', color: C.ink, letterSpacing: 0, padding: '0 .14em', margin: '0 .02em', lineHeight: 1,
        opacity: p, transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <span style={{ position: 'absolute', inset: '.02em -.02em -.06em', border: `3px solid ${C.blue}`, background: C.paleBlue, zIndex: -1, clipPath: `inset(0 ${(1 - box) * 100}% 0 0)` }} />
      {t}
      <i style={{ ...hs, left: -8, top: -6 }} />
      <i style={{ ...hs, right: -8, bottom: -10 }} />
    </span>
  );
};

// ---------------------------------------------------------------- review card
const markerPath = (seed: number) => {
  // adapted from MarkerUnderlineTitle.buildStroke: wobbly mid-line + variable width,
  // drawn full text-height in a 1000×100 box and stretched to each text line.
  const rand = mulberry32(seed);
  const N = 40;
  const top: string[] = [];
  const bot: string[] = [];
  const wob = Array.from({ length: N + 1 }, () => rand() - 0.5);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * 1000;
    const mid = 52 - t * 4 + Math.sin(t * Math.PI * 1.6 + 0.4) * 2.5 + wob[i] * 2.5;
    const w = 76 + Math.sin(t * Math.PI) * 6 + wob[i] * 6 - Math.max(0, t - 0.95) * 300;
    top.push(`${x.toFixed(1)},${(mid - w / 2).toFixed(1)}`);
    bot.push(`${x.toFixed(1)},${(mid + w / 2).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`;
};

/** Rebuilt review: no name, no photo, no Google UI — blurred placeholders + the one chosen line. */
export const ReviewCard: React.FC<{
  frame: number; top: number; lines: string[]; inAt: number; hlAt: number; outAt?: number; seed: number; fontSize?: number;
}> = ({ frame, top, lines, inAt, hlAt, outAt, seed, fontSize = 44 }) => {
  const total = lines.reduce((a, l) => a + l.length, 0);
  let acc = 0;
  const HL = 14; // sweep frames
  return (
    <Card style={{ left: 90, width: 900, top, padding: '40px 48px', ...enterExit(frame, inAt, outAt) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
        <span style={{ width: 66, height: 66, borderRadius: '50%', background: '#D7D7D3', filter: 'blur(3px)' }} />
        <span style={{ width: 230, height: 22, borderRadius: 11, background: '#DADAD6', filter: 'blur(3px)' }} />
        <span style={{ marginLeft: 'auto', fontSize: 36, letterSpacing: 3, color: '#D3D3CF' }}>
          <b style={{ color: '#F5B301', fontWeight: 400 }}>★</b>★★★★
        </span>
      </div>
      <div style={{ height: 20, width: '86%', borderRadius: 10, background: '#E8E8E4', filter: 'blur(2.5px)', margin: '12px 0' }} />
      <div style={{ margin: '14px 0', fontFamily: SANS, fontWeight: 500, fontSize, lineHeight: 1.36, color: C.ink, letterSpacing: '-0.01em' }}>
        {lines.map((l, i) => {
          const a0 = hlAt + (acc / total) * HL;
          acc += l.length;
          const a1 = hlAt + (acc / total) * HL;
          const p = lerp01(frame, a0, a1);
          return (
            <div key={i} style={{ position: 'relative' }}>
              <span style={{ position: 'relative', display: 'inline-block', padding: '0 6px', marginLeft: -6 }}>
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: '4%', width: '100%', height: '92%', zIndex: 0, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
                  <path d={markerPath(seed + i)} fill={C.yellow} fillOpacity={0.9} />
                </svg>
                <span style={{ position: 'relative' }}>{l}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 20, width: '62%', borderRadius: 10, background: '#E8E8E4', filter: 'blur(2.5px)', margin: '12px 0' }} />
    </Card>
  );
};
