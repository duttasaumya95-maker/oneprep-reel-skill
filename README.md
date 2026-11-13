# oneprep-reel — Claude Code skill

Vertical explainer reels in the OnePrep "GMAT Truths" format: ElevenLabs voice → word-synced Remotion animation → captions,
avatar, SFX, music → one mastered MP4. Built from 100+ produced episodes.

## Install
```bash
git clone <this repo> && cp -R oneprep-reel-skill/skills/oneprep-reel ~/.claude/skills/
```
Then in Claude Code: "make a GMAT Truths reel about …" — or read `skills/oneprep-reel/SKILL.md`.

## Needs
Node 20+, Python 3 with Pillow, Claude Code with the ElevenLabs connector, and the Mixkit audio files listed in
`skills/oneprep-reel/template/public/ASSETS.md` (not included — licence).

## Layout
- `skills/oneprep-reel/SKILL.md` — the workflow
- `template/` — Remotion project (timeline, captions, avatar, camera, CTA)
- `tools/` — init-workspace, new-episode, words-align, gen, sheet, finish-ep
- `examples/` — three real episode specs + scenes (teaching reel, verbal reel, 48 s promo)
- `reference/` — tokens, layout, scene helpers
