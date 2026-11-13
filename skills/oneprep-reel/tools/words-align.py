#!/usr/bin/env python3
"""Exact line cuts + word timings from an ElevenLabs transcript (words.json) of a full-episode take.

  python3 tools/words-align.py N WORDS_JSON
    -> voiceover/epNN/1..K.wav, reel-epNN/public/vo/s1..sK, reel-epNN/src/data/vo-manifest.json

Two modes, picked automatically from the word count:
  * full take   — the transcript covers every line in lines.mjs (incl. the last one); all lines are cut from epN/full.mp3.
  * reuse last  — the transcript covers all but the last line; the last line is read from voiceover/epNN/<K>.mp3
                  (e.g. a recorded "…Tap the link." you reuse in every episode) with locally estimated timings.

[tag] words are dropped; the remaining words are matched in order to the script (lines.mjs `tts`).
Cuts go in the middle of the gap between the last word of one line and the first word of the next.
"""
import json, os, re, subprocess, sys, shutil
sys.path.insert(0, os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location('la', os.path.join(os.path.dirname(__file__), 'local-align.py'))
la = importlib.util.module_from_spec(spec); spec.loader.exec_module(la)
ROOT = la.ROOT

n, wpath = sys.argv[1], sys.argv[2]
nn = f'{int(n):02d}'
J = json.load(open(wpath))
words = [w for w in (J['words'] if isinstance(J, dict) else J) if w.get('type', 'word') == 'word' and not re.fullmatch(r'\[[^\]]+\]', w['text'])]
L = la.lines_for(nn)
all_counts = [len(l['tts'].split()) for l in L]
if sum(all_counts) == len(words):
    lines, reuse_last = L, False
elif sum(all_counts[:-1]) == len(words):
    lines, reuse_last = L[:-1], True
else:
    raise SystemExit(f'word count mismatch: script {sum(all_counts)} (or {sum(all_counts[:-1])} without the last line) vs transcript {len(words)}')
counts = [len(l['tts'].split()) for l in lines]
folder = os.path.join(ROOT, f'ep{n}')
src = os.path.join(folder, next(f for f in sorted(os.listdir(folder)) if re.search(r'full.*\.(mp3|wav|m4a)$', f, re.I)))
T = la.dur(src)
spans, i = [], 0
for c in counts:
    spans.append(words[i:i + c]); i += c
out = os.path.join(ROOT, 'voiceover', f'ep{nn}')
reel = os.path.join(ROOT, f'reel-ep{nn}')
os.makedirs(out, exist_ok=True); os.makedirs(os.path.join(reel, 'public', 'vo'), exist_ok=True)
man = {'placeholder': False, 'source': 'elevenlabs transcript word timings', 'lines': {}}
for k, ws in enumerate(spans):
    a = 0.0 if k == 0 else (spans[k - 1][-1]['end'] + ws[0]['start']) / 2
    b = T if k == len(spans) - 1 else (ws[-1]['end'] + spans[k + 1][0]['start']) / 2
    a = max(0.0, min(a, ws[0]['start'] - 0.04)); b = max(b, ws[-1]['end'] + 0.06)
    wav = f'{out}/{k + 1}.wav'
    la.ff('-v', 'error', '-y', '-i', src, '-af', f'atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS', '-ar', '44100', '-c:a', 'pcm_s16le', wav)
    # per-character timings for the script text, word by word
    text = lines[k]['tts']; toks = text.split(' ')
    chars, st, en = [], [], []
    for j, (tok, w) in enumerate(zip(toks, ws)):
        s0, e0 = w['start'] - a, w['end'] - a
        step = (e0 - s0) / max(1, len(tok))
        for ci, ch in enumerate(tok):
            chars.append(ch); st.append(round(s0 + ci * step, 3)); en.append(round(s0 + (ci + 1) * step, 3))
        if j < len(toks) - 1:
            nxt = ws[j + 1]['start'] - a
            chars.append(' '); st.append(round(e0, 3)); en.append(round(max(e0, nxt), 3))
    rel = f'vo/s{k + 1}.wav'
    shutil.copy(wav, os.path.join(reel, 'public', rel))
    man['lines'][f's{k + 1}'] = {'file': rel, 'dur': round(b - a, 3), 'chars': chars, 'start': st, 'end': en}
    print(f'{k + 1}.wav {a:.2f}–{b:.2f}s  "{ws[0]["text"]} … {ws[-1]["text"]}"')
if reuse_last:
    # reused last line keeps its local estimate
    l11 = L[-1]
    NL = len(L)
    src11 = os.path.join(out, f'{NL}.mp3')
    ch, s, e, d = la.timings(src11, l11['tts'])
    shutil.copy(src11, os.path.join(reel, 'public', 'vo', f's{NL}.mp3'))
    man['lines'][f's{NL}'] = {'file': f'vo/s{NL}.mp3', 'dur': round(d, 3), 'chars': ch, 'start': s, 'end': e}
json.dump(man, open(os.path.join(reel, 'src', 'data', 'vo-manifest.json'), 'w'), indent=1)
json.dump(man, open(os.path.join(reel, 'src', 'data', 'vo-manifest.orig.json'), 'w'), indent=1)
print('summed VO %.2fs' % sum(l['dur'] for l in man['lines'].values()))
