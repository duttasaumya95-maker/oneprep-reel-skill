#!/bin/zsh
# Render the ONE main version (captions + music), then master each to -14 LUFS / -1 dBTP into ../deliverables
set -e
cd "${0:A:h}/.."
D=../deliverables/ep100; mkdir -p out/raw $D
for v in "A_captions:true:true:OnePrep_GMAT_Reel_ep100_spacedrep"; do
  parts=("${(@s/:/)v}"); n=$parts[1]; c=$parts[2]; b=$parts[3]; o=$parts[4]
  npx remotion render src/index.ts OnePrepReel out/raw/$n.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k --props="{\"captions\":$c,\"bgm\":$b}" --log=error
  m=$(npx remotion ffmpeg -hide_banner -i out/raw/$n.mp4 -vn -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | python3 -I -c "
import sys,json;t=sys.stdin.read();j=json.loads(t[t.rindex('{'):t.rindex('}')+1]);print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
  npx remotion ffmpeg -hide_banner -v error -y -i out/raw/$n.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:${m}:linear=true,aresample=48000" -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$D/$o.mp4"
  printf "%-48s " $o; npx remotion ffmpeg -hide_banner -i "$D/$o.mp4" -vn -af loudnorm=I=-14:TP=-1:print_format=json -f null - 2>&1 | python3 -I -c "
import sys,json;t=sys.stdin.read();j=json.loads(t[t.rindex('{'):t.rindex('}')+1]);print('I',j['input_i'],'TP',j['input_tp'])"
done
rm -f out/raw/*.mp4  # mastered copies live in ../deliverables
