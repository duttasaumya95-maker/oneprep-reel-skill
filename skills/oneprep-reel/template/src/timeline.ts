// Episode 100 — single source of truth. Every scene boundary, cue, SFX and caption
// is derived from the VO timings in src/data/vo-manifest.json.
import manifest from './data/vo-manifest.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

type RawLine = { file: string | null; dur: number; chars: string[]; start: number[]; end: number[] };
export type Word = { w: string; s: number; e: number };
export type Line = { id: string; file: string | null; dur: number; words: Word[]; chars: string[]; cs: number[]; ce: number[] };

const raw = (manifest as { placeholder: boolean; lines: Record<string, RawLine> }).lines;
export const PLACEHOLDER_VO = (manifest as { placeholder: boolean }).placeholder;

const toWords = (l: RawLine): Word[] => {
  const out: Word[] = [];
  let cur: Word | null = null;
  l.chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) out.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { w: '', s: l.start[i], e: l.end[i] };
    cur.w += c;
    cur.e = l.end[i];
  });
  if (cur) out.push(cur);
  return out;
};

export const LINES: Record<string, Line> = Object.fromEntries(
  Object.entries(raw).map(([id, l]) => [id, { id, file: l.file, dur: l.dur, words: toWords(l), chars: l.chars, cs: l.start, ce: l.end }]),
);

const f = (sec: number) => Math.round(sec * FPS);

// music beat grid (tonight-hiphop.mp3: ~105 BPM, first beat 0.309 s)
export const BEAT_SEC = 60 / 105;
export const BEAT_PHASE = 0.309;
const snapToBeat = (frame: number, maxPush = 8) => {
  const t = frame / FPS;
  const n = Math.ceil((t - BEAT_PHASE) / BEAT_SEC - 1e-6);
  const snapped = Math.round((BEAT_PHASE + n * BEAT_SEC) * FPS);
  return snapped - frame <= maxPush ? snapped : frame;
};

export const VO: Record<string, number> = {};
const place = (id: string, at: number) => (VO[id] = at);
const end = (id: string) => VO[id] + f(LINES[id].dur);
const wordIdx = (id: string, needle: string) => {
  const i = LINES[id].words.findIndex((w) => w.w.toLowerCase().includes(needle.toLowerCase()));
  if (i < 0) throw new Error(`word "${needle}" not in ${id}`);
  return i;
};
export const wordStart = (id: string, needle: string) => VO[id] + f(LINES[id].words[wordIdx(id, needle)].s);
export const wordEnd = (id: string, needle: string) => VO[id] + f(LINES[id].words[wordIdx(id, needle)].e);

// nth word (0-based) whose letters START with needle — "five" won't match "ninety-five"
const clean = (w: string) => w.toLowerCase().replace(/^[^a-z0-9]+/, '');
const ws = (id: string, needle: string, n = 0) => {
  const hits = LINES[id].words.filter((w) => clean(w.w).startsWith(needle.toLowerCase()));
  if (!hits[n]) throw new Error(`word "${needle}" #${n} not in ${id}`);
  return VO[id] + f(hits[n].s);
};

export type Span = { from: number; to: number };
const S: Span[] = [];
// FLOW RULE: every line starts right after the previous one (≈0.03 s). No hard cut — camera punch on "next month".

// Scene 1 — read the explanation, never again → same mistake next month (s1, s2)
const s1from = 0;
place('s1', s1from + 6);
place('s2', end('s1') + f(0.03));
const wrongAt = ws('s1', 'wrong');
const explAt = ws('s1', 'explanation');
const smartAt = ws('s1', 'smart');
const neverAt = ws('s1', 'never');
const againAt = ws('s1', 'again');
const monthAt = ws('s2', 'month');
const trapAt = ws('s2', 'trap');
const mistakeAt = ws('s2', 'mistake');
const s1to = end('s2') + f(0.02);
S.push({ from: s1from, to: s1to });

// Scene 2 — re-solve after 3 days, then 7 (s3, s4)
const s2from = s1to;
place('s3', s2from + 1);
place('s4', end('s3') + f(0.03));
const resolveAt = ws('s3', 're');
const threeAt = ws('s3', 'three');
const daysAt = ws('s3', 'days');
const sevenAt = ws('s3', 'seven');
const coldAt = ws('s4', 'cold');
const backAt = ws('s4', 'back');
const pileAt = ws('s4', 'pile');
const stopAt = ws('s4', 'stop');
const repeatAt = ws('s4', 'repeating');
const s2to = end('s4') + f(0.02);
S.push({ from: s2from, to: s2to });

// Scene 3 — CTA
const s7from = s2to;
place('s5', s7from + f(0.03));
place('s6', end('s5') + f(0.03));
const clickAt = wordStart('s6', 'cleared');
const okAt = clickAt + 6;
const s7to = Math.max(end('s6') + f(0.4), okAt + 24);
S.push({ from: s7from, to: s7to });

export const SCENES = S;
export const DURATION = s7to;

// ---- camera
export const ORIGIN = [
  { x: 0, y: 0 },
  { x: 0, y: 2200 },
  { x: 1180, y: 2200 },
];
export type CamKey = { f: number; x: number; y: number; s: number; r: number; ease?: 'out' | 'inout' | 'whip' | 'lin' | 'cut' };
const k = (frame: number, o: { x: number; y: number }, s = 1, r = 0, ease: CamKey['ease'] = 'inout', dx = 0, dy = 0): CamKey => ({
  f: frame, x: o.x + dx, y: o.y + dy, s, r, ease,
});
export const STEP_Y = 205;
const PUNCH = monthAt;
const punchScene = PUNCH < s1to ? 0 : 1;
export const CAM: CamKey[] = punchScene === 0 ? [
  k(0, ORIGIN[0], 1.0, 0, 'cut'),
  k(PUNCH - 1, ORIGIN[0], 1.03, 0, 'lin'),
  k(PUNCH, ORIGIN[0], 1.08, 0, 'cut'),
  k(PUNCH + 18, ORIGIN[0], 1.04, 0, 'out'),
  k(s1to - 4, ORIGIN[0], 1.05, 0, 'lin'),
  k(s1to + 8, ORIGIN[1], 1.0, 0, 'whip'),
  k(s2to - 4, ORIGIN[1], 1.03, 0, 'lin'),
  k(s2to + 12, ORIGIN[2], 1.0, 0, 'whip'),
  k(DURATION, ORIGIN[2], 1.0, 0, 'lin'),
] : [
  k(0, ORIGIN[0], 1.0, 0, 'cut'),
  k(s1to - 4, ORIGIN[0], 1.04, 0, 'lin'),
  k(s1to + 8, ORIGIN[1], 1.0, 0, 'whip'),
  k(PUNCH - 1, ORIGIN[1], 1.0, 0, 'lin'),
  k(PUNCH, ORIGIN[1], 1.08, 0, 'cut'),
  k(PUNCH + 18, ORIGIN[1], 1.03, 0, 'out'),
  k(s2to - 4, ORIGIN[1], 1.03, 0, 'lin'),
  k(s2to + 12, ORIGIN[2], 1.0, 0, 'whip'),
  k(DURATION, ORIGIN[2], 1.0, 0, 'lin'),
];
export const BLUR_SPANS: Array<[number, number]> = [
  [s1to - 4, s1to + 8],
  [s2to - 4, s2to + 12],
];

// ---- SFX
const db = (d: number) => Math.pow(10, d / 20);
export const SFX: Array<{ file: string; at: number; vol: number; dur?: number }> = [
  { file: 'pop.mp3', at: 10, vol: db(-18) },
  { file: 'hit-weak.mp3', at: wrongAt, vol: db(-20) },
  { file: 'ui-select-click.mp3', at: explAt, vol: db(-22) },
  { file: 'sparkle-touch.mp3', at: smartAt, vol: db(-22) },
  { file: 'swoosh-quick.mp3', at: neverAt, vol: db(-22) },
  { file: 'clock-tick-single.mp3', at: monthAt, vol: db(-18) },
  { file: 'hit-weak.mp3', at: trapAt, vol: db(-20) },
  { file: 'hit-weak.mp3', at: mistakeAt, vol: db(-18) },
  { file: 'marker-pen-line.mp3', at: resolveAt, vol: db(-20) },
  { file: 'ui-message-pop.mp3', at: threeAt, vol: db(-20) },
  { file: 'ui-message-pop.mp3', at: sevenAt, vol: db(-20) },
  { file: 'swoosh-quick.mp3', at: backAt, vol: db(-22) },
  { file: 'chime-crystal.mp3', at: repeatAt, vol: db(-24) },
  { file: 'bass-hit-short.mp3', at: PUNCH, vol: db(-16) },
  { file: 'whoosh-fast.mp3', at: s1to - 6, vol: db(-16) },
  { file: 'whoosh-fast.mp3', at: s2to - 4, vol: db(-16) },
  { file: 'switch-tap.mp3', at: clickAt, vol: db(-16) },
  { file: 'ui-success-soft.mp3', at: okAt, vol: db(-16) },
  { file: 'sparkle-touch.mp3', at: okAt + 2, vol: db(-22) },
];

const BED = db(-26);
export const musicVolume = (frame: number) => {
  const speaking = Object.keys(VO).some((id) => frame >= VO[id] - 3 && frame <= end(id) + 3);
  let v = speaking ? BED * db(-6) : BED;
  if (frame >= s2from && frame < s2to) v *= db(2.5);
  return v * Math.max(0, Math.min(1, (DURATION - frame) / 20));
};
export const vEnd = end;
export const SEL_AT = [-8, resolveAt];
export const CUE = {
  wrongAt, explAt, smartAt, neverAt, againAt, monthAt, trapAt, mistakeAt, resolveAt, threeAt, daysAt, sevenAt, coldAt, backAt, pileAt, stopAt, repeatAt,
  clickAt, okAt,
  av1: monthAt, av2: coldAt,
  nods: [mistakeAt, sevenAt, repeatAt],
};
