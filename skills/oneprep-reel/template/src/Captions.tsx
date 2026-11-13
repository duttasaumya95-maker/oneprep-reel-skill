// Burned-in captions: word-by-word pop (85%→100% in 3f), Inter 800, black text,
// keywords on a yellow block. Display tokens map onto spoken words so numbers
// read as figures ("thirty-five thousand rupees" -> "Rs 35,000").
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { FPS, LINES, VO } from './timeline';
import { C, SANS } from './ui';

type Tok = [display: string, spoken: number, kw?: boolean];
const T = (d: string, n = 1, kw = false): Tok => [d, n, kw];
const plain = (s: string) => s.split(' ').map((w) => T(w));

export const CAPTIONS: Record<string, Tok[]> = {
  s1: [...plain('Got a question'), T('wrong.', 1, true), ...plain('Read the'), T('explanation.', 1, true), T('Felt smart.', 2, true), T('Never saw it again.', 4, true)],
  s2: [T('Next month.', 2, true), T('Same trap.', 2, true), T('Same mistake.', 2, true)],
  s3: [T('Re-solve', 1, true), ...plain('every wrong question after'), T('3 days.', 2, true), ...plain('Then again after'), T('7.', 1, true)],
  s4: [T('Can’t solve it cold?', 4, true), ...plain('It goes'), T('back in the pile.', 4, true), ...plain('That’s how'), T('mistakes stop repeating.', 3, true)],
  s5: [...plain('Want a'), T('mistake log', 2, true), ...plain('that'), T('works?', 1, true), ...plain('Join a'), T('free', 1, true), T('1-day'), ...plain('session with a GMAT expert with'), T('15+ years', 2, true), ...plain('of experience,')],
  s6: [...plain('and get every doubt cleared.'), T('Tap the link.', 3, true)],
};

type Chunk = { toks: { d: string; kw: boolean; s: number }[]; from: number; to: number };
const CHUNKS: Chunk[] = [];
for (const id of Object.keys(CAPTIONS)) {
  const L = LINES[id];
  const toks = CAPTIONS[id];
  const sum = toks.reduce((a, t) => a + t[1], 0);
  if (sum !== L.words.length) throw new Error(`caption ${id}: ${sum} tokens vs ${L.words.length} spoken words`);
  let wi = 0;
  const timed = toks.map(([d, n, kw]) => {
    const s = VO[id] + Math.round(L.words[wi].s * FPS);
    wi += n;
    return { d, kw: !!kw, s, wordCount: n };
  });
  // chunk: break after punctuation, or when 3 tokens / 4 words are reached
  let cur: typeof timed = [];
  let words = 0;
  const flush = () => {
    if (!cur.length) return;
    CHUNKS.push({ toks: cur, from: cur[0].s - 2, to: 0 });
    cur = [];
    words = 0;
  };
  timed.forEach((t, i) => {
    cur.push(t);
    words += t.wordCount;
    const next = timed[i + 1];
    if (/[,.?!…]$/.test(t.d) || cur.length >= 3 || words >= 4 || (next && words + next.wordCount > 4)) flush();
  });
  flush();
}
CHUNKS.forEach((c, i) => {
  const lineEnd = c.toks[c.toks.length - 1].s + 18;
  const next = CHUNKS[i + 1];
  c.to = next ? Math.min(next.from, Math.max(lineEnd, next.from - 0)) : lineEnd + 20;
  if (next && next.from - lineEnd > 24) c.to = lineEnd + 8; // gap between lines: clear
});
export const CAPTION_CHUNKS = CHUNKS;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CHUNKS.find((k) => frame >= k.from && frame < k.to);
  if (!c) return null;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1480, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: 1.2, color: C.ink, letterSpacing: '-0.01em', zIndex: 6 }}>
      {c.toks.map((t, i) => {
        const p = interpolate(frame, [t.s, t.s + 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
        return (
          <span key={i} style={{
            display: 'inline-block', margin: '0 .13em', opacity: frame >= t.s ? 1 : 0, transform: `scale(${0.85 + 0.15 * p})`,
            background: t.kw ? C.yellow : 'transparent', borderRadius: 12, padding: t.kw ? '0 .16em' : 0,
          }}>{t.d}</span>
        );
      })}
    </div>
  );
};
