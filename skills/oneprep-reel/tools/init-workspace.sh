#!/bin/zsh
# Create a reel workspace:  zsh tools/init-workspace.sh ~/Desktop/my-reels
#   <ws>/reel/        the Remotion template (npm install runs here once; every episode symlinks its node_modules)
#   <ws>/tools/       pipeline scripts (gen, words-align, sheet, finish-ep, new-episode)
#   <ws>/specs/       your specNN.py + scNN.tsx per episode
#   <ws>/epNN/        voice take (full.mp3) + FULL-SCRIPT.txt
#   <ws>/voiceover/   line cuts
#   <ws>/deliverables mastered MP4s
# Set NODE_MODULES_FROM=/path/to/existing/node_modules to symlink instead of running npm install.
set -e
SKILL="${0:A:h}/.."
WS="${1:?usage: init-workspace.sh <dir>}"
mkdir -p "$WS"/{tools,specs,deliverables,voiceover}
WS="${WS:A}"
[[ -e "$WS/reel" ]] && { echo "$WS/reel already exists"; exit 1; }
cp -R "$SKILL/template" "$WS/reel"
cp "$SKILL"/tools/*.py "$SKILL"/tools/*.sh "$WS/tools/"
if [[ -n "$NODE_MODULES_FROM" ]]; then
  ln -s "${NODE_MODULES_FROM:A}" "$WS/reel/node_modules"
else
  (cd "$WS/reel" && npm install --no-audit --no-fund)
fi
missing=0
for f in $(sed -n 's/^- `\(.*\.mp3\)`.*/\1/p' "$SKILL/template/public/ASSETS.md"); do
  [[ -f "$WS/reel/public/$f" ]] || { echo "missing asset: public/$f"; missing=1; }
done
(( missing )) && echo "→ add the audio files listed in reel/public/ASSETS.md before rendering."
echo "workspace ready: $WS"
