#!/usr/bin/env python3
"""Offline replacement for ElevenLabs forced alignment (no credits, no downloads).

  python3 tools/local-align.py split  N          # epN/<N or *full*>.mp3 -> voiceover/epNN/1..10.wav (cut in the pauses)
  python3 tools/local-align.py import N [DIR]    # per-line files -> reel-epNN/public/vo/sK.wav + src/data/vo-manifest.json

Line cuts: pick the 9 pauses that best match where each line should end (by text length).
Word timings: inside each line, the text is spread over the *speech* parts only (silences removed),
so pauses after commas/full stops fall where the audio actually pauses.
"""
import json, os, re, subprocess, sys, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FF = ['npx', '--prefix', os.path.join(ROOT, 'reel'), 'remotion']


def ff(*a):
    return subprocess.run(FF + ['ffmpeg', '-hide_banner', *a], capture_output=True, text=True)


def dur(path):
    r = subprocess.run(FF + ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(r.stdout.strip())


def silences(path, noise='-38dB', d=0.12):
    err = ff('-i', path, '-af', f'silencedetect=noise={noise}:d={d}', '-f', 'null', '-').stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    T = dur(path)
    out = []
    for i, s in enumerate(st):
        e = en[i] if i < len(en) else T
        out.append((max(0.0, s), e))
    return out, T


def lines_for(nn):
    js = f"import('{ROOT}/reel-ep{nn}/scripts/lines.mjs').then(m=>console.log(JSON.stringify(m.LINES)))"
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)


def weight(c):
    if c.isalnum():
        return 1.0
    if c.isspace():
        return 0.5
    return 0.25


def split(n):
    nn = f'{int(n):02d}'
    folder = os.path.join(ROOT, f'ep{n}')
    files = sorted(os.listdir(folder))
    pick = [f for f in files if re.search(r'full.*\.(mp3|wav|m4a)$', f, re.I)] or [f for f in files if re.match(rf'^(ep)?{n}\.(mp3|wav|m4a)$', f, re.I)]
    src = os.path.join(folder, pick[0])
    L = lines_for(nn)[:10]
    allsil, T = silences(src, d=0.1)
    # speaking time elapsed before each pause (pauses removed)
    sp_before, t_speech, last = [], 0.0, 0.0
    for a, b in allsil:
        t_speech += max(0.0, a - last)
        sp_before.append(t_speech)
        last = b
    S = t_speech + max(0.0, T - last)
    inner = [(i, a, b) for i, (a, b) in enumerate(allsil) if a > 0.05 and b < T - 0.05]
    sw = lambda c: 1.0 if c.isalnum() else (0.35 if c.isspace() else 0.0)
    w = [sum(sw(c) for c in l['tts']) for l in L]
    tot = sum(w)
    exp, acc = [], 0
    for x in w[:-1]:
        acc += x
        exp.append(S * acc / tot)
    # segment DP: every line should take (its text weight x global pace) of *speaking* time
    import math
    sil = [(a, b) for _, a, b in inner]
    spos = [sp_before[i] for i, _, _ in inner]
    mid = [(a + b) / 2 for a, b in sil]
    ln = [b - a for a, b in sil]
    P = [0.0] + spos + [S]            # speaking-time position of each cut candidate (0 = start, last = end)
    C = len(P)
    r = S / tot
    def seg(i, k, j):
        d = P[j] - P[k]
        if d <= 0.15:
            return 1e6
        c = math.log(d / (w[i] * r)) ** 2
        if 0 < j < C - 1:
            c -= 0.15 * min(ln[j - 1], 0.8)
        return c
    INF = 1e18
    best = [[INF] * C for _ in range(10)]
    prev = [[-1] * C for _ in range(10)]
    for j in range(1, C - 1):
        best[0][j] = seg(0, 0, j)
    for i in range(1, 10):
        for j in range(1, C):
            if i < 9 and j == C - 1:
                continue
            if i == 9 and j != C - 1:
                continue
            for k in range(1, j):
                v = best[i - 1][k] + seg(i, k, j)
                if v < best[i][j]:
                    best[i][j], prev[i][j] = v, k
    j = C - 1
    picks = []
    for i in range(9, 0, -1):
        j = prev[i][j]
        picks.append(j - 1)
    picks.reverse()
    exp = [mid[p] for p in picks]
    cuts = [0.0] + [mid[p] for p in picks] + [T]
    out = os.path.join(ROOT, 'voiceover', f'ep{nn}')
    os.makedirs(out, exist_ok=True)
    for i in range(10):
        a, b = cuts[i], cuts[i + 1]
        ff('-v', 'error', '-y', '-i', src, '-af', f'atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS', '-ar', '44100', '-c:a', 'pcm_s16le', f'{out}/{i + 1}.wav')
        print(f'{i + 1}.wav  {a:.2f}–{b:.2f}s  ({b - a:.2f}s)   expected end {exp[i] if i < 9 else T:.2f}')


def timings(path, text):
    sil, T = silences(path, d=0.08)
    speech, t = [], 0.0
    for s, e in sil:
        if s > t:
            speech.append((t, s))
        t = max(t, e)
    if t < T:
        speech.append((t, T))
    if not speech:
        speech = [(0, T)]
    S = sum(b - a for a, b in speech)

    def real(pos):  # position along speech-only timeline -> real time
        for a, b in speech:
            if pos <= b - a:
                return a + pos
            pos -= b - a
        return speech[-1][1]

    chars = list(text)
    ws = [weight(c) for c in chars]
    W = sum(ws)
    start, end, acc = [], [], 0.0
    for x in ws:
        start.append(round(real(S * acc / W), 3))
        acc += x
        end.append(round(real(S * acc / W), 3))
    return chars, start, end, T


def do_import(n, d=None):
    nn = f'{int(n):02d}'
    reel = os.path.join(ROOT, f'reel-ep{nn}')
    d = d or os.path.join(ROOT, 'voiceover', f'ep{nn}')
    os.makedirs(os.path.join(reel, 'public', 'vo'), exist_ok=True)
    out = {'placeholder': False, 'source': 'local silence alignment', 'lines': {}}
    tot = 0
    for l in lines_for(nn):
        k = l['id'][1:]
        src = next((os.path.join(d, f'{k}.{e}') for e in ('wav', 'mp3', 'm4a') if os.path.exists(os.path.join(d, f'{k}.{e}'))), None)
        if not src:
            raise SystemExit(f'missing {k} in {d}')
        ext = src.rsplit('.', 1)[1]
        rel = f"vo/{l['id']}.{ext}"
        shutil.copy(src, os.path.join(reel, 'public', rel))
        chars, s, e, T = timings(src, l['tts'])
        out['lines'][l['id']] = {'file': rel, 'dur': round(T, 3), 'chars': chars, 'start': s, 'end': e}
        tot += T
    json.dump(out, open(os.path.join(reel, 'src', 'data', 'vo-manifest.json'), 'w'), indent=1)
    print(f'ep{nn}: summed VO {tot:.2f}s')


if __name__ == '__main__':
    cmd, n = sys.argv[1], sys.argv[2]
    if cmd == 'split':
        split(n)
    else:
        do_import(n, sys.argv[3] if len(sys.argv) > 3 else None)
