#!/usr/bin/env python3
"""Create reel-epNN from the workspace template + an episode JSON.

  python3 tools/new-episode.py episode.json

episode.json:
{
  "n": 102, "slug": "ratios", "title": "Ratios in 20 seconds",
  "lines": [["sarcastic", "Hook line…"], ["deadpan", "Turn…"], ["sincere", "Teach…"], ["sincere", "Rule…"],
            ["excited", "Want faster Quant? Join a free one-day session with a GMAT expert with fifteen-plus years of experience,"]],
  "last": "and get every doubt cleared. Tap the link.",
  "last_audio": "voiceover/cta-last.mp3",        # optional: reuse a recorded last line (else it is part of the take)
  "name": "OnePrep_GMAT_Reel_ep102_ratios"        # optional output file name
}
Writes reel-epNN/ (node_modules symlinked to reel/node_modules), scripts/lines.mjs, build-all.sh output name,
epNN/FULL-SCRIPT.txt (the exact prompt to send to ElevenLabs), and voiceover/epNN/.
"""
import json, os, re, shutil, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
E = json.load(open(sys.argv[1]))
n, slug = int(E['n']), E['slug']
lines, last = E['lines'], E['last']
R = os.path.join(ROOT, f'reel-ep{n}')
if os.path.exists(R): raise SystemExit(f'{R} exists')
shutil.copytree(os.path.join(ROOT, 'reel'), R, symlinks=True,
                ignore=shutil.ignore_patterns('node_modules', 'out', 'norm', 's?.wav', 't?.wav', 's?.mp3', 'vo-manifest*.json', '.DS_Store'))
os.symlink(os.path.join(ROOT, 'reel', 'node_modules'), os.path.join(R, 'node_modules'))
os.makedirs(os.path.join(R, 'out', 'raw'), exist_ok=True); os.makedirs(os.path.join(R, 'public', 'vo', 'norm'), exist_ok=True)
texts = [t for _, t in lines] + [last]
js = (f"// Episode {n} voiceover lines. `tts` = the words as spoken (GMAT -> Gee-Mat) and is what the transcript is matched against.\n"
      "const L = [\n" + ''.join('  ' + json.dumps(t, ensure_ascii=False) + ',\n' for t in texts) +
      "];\nexport const LINES = L.map((text, i) => ({ id: `s${i + 1}`, text, tts: text.replace(/GMAT/g, 'Gee-Mat') }));\n")
open(os.path.join(R, 'scripts', 'lines.mjs'), 'w').write(js)
ep = os.path.join(ROOT, f'ep{n}'); vo = os.path.join(ROOT, 'voiceover', f'ep{n:02d}')
os.makedirs(ep, exist_ok=True); os.makedirs(vo, exist_ok=True)
take = list(lines)
if E.get('last_audio'):
    shutil.copy(os.path.join(ROOT, E['last_audio']), os.path.join(vo, f'{len(texts)}.mp3'))
else:
    take.append(['excited', last])
prompt = '\n\n'.join(f'[{tag}] ' + t.replace('GMAT', '/ˈdʒiːmæt/').replace('’', "'") for tag, t in take)
open(os.path.join(ep, 'FULL-SCRIPT.txt'), 'w').write(prompt + '\n')
name = E.get('name') or f'OnePrep_GMAT_Reel_ep{n}_{slug}'
b = open(os.path.join(R, 'scripts', 'build-all.sh')).read()
b = re.sub(r'D=\.\./deliverables/ep\d+', f'D=../deliverables/ep{n}', b)
b = re.sub(r'"A_captions:true:true:[^"]+"', f'"A_captions:true:true:{name}"', b)
open(os.path.join(R, 'scripts', 'build-all.sh'), 'w').write(b)
print(f'reel-ep{n} ready · {sum(len(t.split()) for t in texts)} words · last line {"reused" if E.get("last_audio") else "in the take"}')
print('--- ElevenLabs prompt (also in', os.path.relpath(os.path.join(ep, 'FULL-SCRIPT.txt'), ROOT) + ') ---')
print(prompt)
