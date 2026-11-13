#!/bin/zsh
# sheet.sh N f1 f2 ... -> .work/exN/sheet.png (up to 8 frames, 4 per row, 1/3 scale)
set -e
N=$1; shift
HERE="${0:A:h}"; ROOT="$HERE/.."
S="$ROOT/.work"; mkdir -p $S
O=$S/ex$N; rm -rf $O; mkdir -p $O
cd "$ROOT/reel-ep$N"
mkdir -p "../reel/node_modules/.cache/webpack/remotion-production-4.0.484"
npx remotion bundle src/index.ts --out-dir=$O/bundle --log=error >/dev/null
i=0; for f in "$@"; do npx remotion still $O/bundle OnePrepReel $O/f$(printf %02d $i).png --frame=$f --scale=0.34 --props='{"captions":true,"bgm":false}' --log=error >/dev/null & i=$((i+1)); done; wait
python3 "$HERE/tile.py" $O
