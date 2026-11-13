#!/usr/bin/env python3
"""Patch reel-epNN with the episode spec in specs/specNN.py + specs/scNN.tsx.
   python3 tools/gen.py 89"""
import re, sys, os, importlib.util
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
HERE = os.path.join(ROOT, 'specs')
n = sys.argv[1]
spec = importlib.util.spec_from_file_location('s', f'{HERE}/spec{n}.py'); S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
R = f'{ROOT}/reel-ep{n}/src'
rd = lambda p: open(f'{R}/{p}').read()
def wr(p, t): open(f'{R}/{p}', 'w').write(t)
def sub1(pat, rep, txt, flags=re.S):
    out, k = re.subn(pat, lambda m: rep, txt, count=1, flags=flags)
    if k != 1: raise SystemExit(f'pattern not found: {pat[:60]}')
    return out
t = rd('timeline.ts')
t = re.sub(r'^// Episode \d+', f'// Episode {n}', t)
def cue_lines(cs):
    return '\n'.join(f"const {name} = ws('{line}', '{needle}'{', %d' % k if k else ''});" for name, line, needle, k in cs)
sc = f"""// Scene 1 — {S.TITLE1} (s1, s2)
const s1from = 0;
place('s1', s1from + 6);
place('s2', end('s1') + f(0.03));
{cue_lines(S.CUES1)}
const s1to = end('s2') + f(0.02);
S.push({{ from: s1from, to: s1to }});

// Scene 2 — {S.TITLE2} (s3, s4)
const s2from = s1to;
place('s3', s2from + 1);
place('s4', end('s3') + f(0.03));
{cue_lines(S.CUES2)}
const s2to = end('s4') + f(0.02);
S.push({{ from: s2from, to: s2to }});

"""
t = sub1(r'// Scene 1 — .*?(?=// Scene 3 — CTA)', sc, t)
t = sub1(r'const PUNCH = \w+;', f'const PUNCH = {S.PUNCH};', t)
t = sub1(r'// FLOW RULE:[^\n]*', f'// FLOW RULE: every line starts right after the previous one (≈0.03 s). No hard cut — camera punch on "{S.PUNCH_WORD}".', t)
sfx = ',\n'.join(f"  {{ file: '{f}', at: {at}, vol: db({d}) }}" for f, at, d in S.SFX)
m = re.search(r"export const SFX[^\n]*= \[\n(.*?)\n\];", t, re.S)
fixed = [l for l in m.group(1).split('\n') if "'pop.mp3', at: 10," in l or 'bass-hit-short' in l or 'whoosh-fast' in l or re.search(r"at: (clickAt|okAt)\b", l)]
fixed = [l for l in fixed if not re.search(r"at: \w+At, vol", l) or re.search(r"at: (clickAt|okAt)\b", l)]
t = t[:m.start(1)] + '\n'.join(fixed[:1]) + '\n' + sfx + ',\n' + '\n'.join(fixed[1:]) + t[m.end(1):]
t = sub1(r'export const SEL_AT = \[[^\]]*\];', f'export const SEL_AT = [-8, {S.SEL2}];', t)
names = [c[0] for c in S.CUES1 + S.CUES2]
t = sub1(r'export const CUE = \{.*?\n\};', 'export const CUE = {\n  ' + ', '.join(names) + ',\n  clickAt, okAt,\n  av1: ' + S.AV1 + ', av2: ' + S.AV2 + ',\n  nods: [' + ', '.join(S.NODS) + '],\n};', t)
wr('timeline.ts', t)
c = rd('Captions.tsx')
caps = ''.join(f'  s{i + 1}: [{x}],\n' for i, x in enumerate(S.CAPS))
m = re.search(r"export const CAPTIONS: Record<string, Tok\[\]> = \{\n(.*?)(  s6: )", c, re.S)
c = c[:m.start(1)] + caps + c[m.start(2):]
wr('Captions.tsx', c)
a = rd('Avatar.tsx')
a = a.replace('CUE.everyoneAt', 'CUE.av1').replace('CUE.timedAt', 'CUE.av2')
wr('Avatar.tsx', a)
s = rd('Scenes.tsx')
i1 = s.index('// ============================================================ Scene 1')
i7 = s.index('// ============================================================ Scene 7')
s = s[:i1] + open(f'{HERE}/sc{n}.tsx').read().strip() + '\n\n' + s[i7:]
wr('Scenes.tsx', s)
print('patched ep', n)
