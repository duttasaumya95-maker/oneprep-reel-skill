# Trim dead air at the ends of each voice line and cap long internal pauses,
# using the word timings from src/data/vo-manifest.json. Writes ../voiceover/tight/N.wav (scratch).
import json, subprocess, sys, os
CAP = float(os.environ.get('CAP', '0.35'))
SPECIAL = {}
LEAD, TAIL = 0.05, 0.10
TEMPO = os.environ.get('TEMPO', '1.0')
man = json.load(open('src/data/vo-manifest.orig.json'))['lines']  # timings of the untouched files
tight = {}
out_dir = '../voiceover/tight'; os.makedirs(out_dir, exist_ok=True)
for k, l in man.items():
    ch, s, e = l['chars'], l['start'], l['end']
    ws, cur = [], None
    for i, c in enumerate(ch):
        if c.isspace():
            if cur: ws.append(cur); cur = None
            continue
        cur = [s[i], e[i], c] if not cur else [cur[0], e[i], cur[2] + c]
    if cur: ws.append(cur)
    keep, a = [], max(0, ws[0][0] - LEAD)
    for i in range(len(ws) - 1):
        gap = ws[i + 1][0] - ws[i][1]
        cap = SPECIAL.get((k, ws[i][2]), CAP)
        if gap > cap:
            half = cap / 2
            keep.append((a, ws[i][1] + half)); a = ws[i + 1][0] - half
    keep.append((a, min(l['dur'], ws[-1][1] + TAIL)))
    src = 'public/' + l['file']
    parts = ''.join(f'[0:a]atrim={x:.3f}:{y:.3f},asetpts=PTS-STARTPTS[p{j}];' for j, (x, y) in enumerate(keep))
    fc = parts + ''.join(f'[p{j}]' for j in range(len(keep))) + f'concat=n={len(keep)}:v=0:a=1,atempo={TEMPO}[o]'
    n = k[1:]
    subprocess.run(['npx', 'remotion', 'ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[o]', '-ar', '44100', '-c:a', 'pcm_s16le', f'{out_dir}/{n}.wav'], check=True)
    new = sum(y - x for x, y in keep)
    print(f'{k:4} {l["dur"]:.2f}s -> {new:.2f}s  ({len(keep) - 1} pauses capped)')

    # carry the exact word timings through the cuts + tempo
    t = float(TEMPO)
    cum, segs = 0.0, []
    for x, y in keep:
        segs.append((x, y, cum)); cum += y - x
    def mp(v):
        for x, y, c0 in segs:
            if v <= y:
                return round((c0 + max(0.0, v - x)) / t, 3)
        return round(cum / t, 3)
    import shutil
    shutil.copy(f'{out_dir}/{n}.wav', f'public/vo/t{n}.wav')
    tight[k] = {'file': f'vo/t{n}.wav', 'dur': round(cum / t, 3), 'chars': ch, 'start': [mp(v) for v in s], 'end': [mp(v) for v in e]}
json.dump({'placeholder': False, 'source': 'transcript timings, tightened', 'lines': tight}, open('src/data/vo-manifest.json', 'w'), indent=1)
