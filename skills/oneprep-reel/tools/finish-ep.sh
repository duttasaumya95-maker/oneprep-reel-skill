#!/bin/zsh
# Final pass for one episode whose visuals + voice cut are done:
#   tighten (cap pauses 0.35s, keep exact word timings) -> per-line loudnorm -> typecheck -> render + master to -14 LUFS
#   -> deliverables/epN/<name>.mp4
# Usage: zsh tools/finish-ep.sh 37
set -e
N=$1
ROOT="${0:A:h}/.."
R="$ROOT/reel-ep$N"
S="$ROOT/.work"; mkdir -p $S
cd "$R"
CAP=0.35 TEMPO=1.0 python3 scripts/tighten-vo.py >/dev/null
python3 - <<'EOF'
import json,subprocess
p='src/data/vo-manifest.json'; j=json.load(open(p))
FF=['npx','remotion','ffmpeg','-hide_banner']
for k,l in j['lines'].items():
    f='public/'+l['file']
    err=subprocess.run(FF+['-i',f,'-af','loudnorm=I=-16:TP=-2:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    m=json.loads(err[err.rindex('{'):err.rindex('}')+1])
    meas=f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}"
    subprocess.run(FF+['-v','error','-y','-i',f,'-af',f'loudnorm=I=-16:TP=-2:LRA=7:{meas}:linear=true,aresample=48000','-c:a','pcm_s16le',f'public/vo/norm/{k}.wav'],check=True)
    l['file']=f'vo/norm/{k}.wav'
json.dump(j,open(p,'w'),indent=1)
EOF
npx tsc --noEmit -p .
npx esbuild scripts/print-timeline.ts --bundle --platform=node --format=esm --log-level=error --outfile=$S/pt$N.mjs
TOTAL=$(node $S/pt$N.mjs | grep '^total' | awk '{print $2}')
D=$(python3 -c "print(int($TOTAL*30))")
sed -i '' -E "s/--frame=[0-9]+/--frame=$((D-6))/" scripts/build-all.sh
echo "ep$N total ${TOTAL}s (end frame $((D-6)))"
mkdir -p "$ROOT/reel/node_modules/.cache/webpack/remotion-production-4.0.484"
zsh scripts/build-all.sh 2>&1 | grep -E 'I -|rror' || true
ls "$ROOT/deliverables/ep$N"
