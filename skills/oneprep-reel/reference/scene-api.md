# Scene API (available inside scNN.tsx)

From `ui.tsx`: `C` (colours), `SANS`, `SANS_T`, `SERIF`, `lerp01(frame, a, b, ease?)` → 0…1,
`enterExit(frame, inAt, outAt?, dist=60)` → style (fade + rise), `Card` (white absolute card, pass `style`),
`Headline({ frame, words: [{t, k:'b'|'sel'|'strike'}], top, size, start, gap, selAt, exitAt? })`.

From the Scenes.tsx preamble:
- `pop(frame, at, d=8, back=2)` — overshoot scale 0…1
- `shake(frame, at, amp=10, len=12)` — x offset
- `Tick({frame, at, size})`, `CheckSvg({size, color})`, `CrossSvg({size, color})`
- `Sticker({frame, at, left, top, text, rot, bg, fade})` — rotated pill
- `Stamp({frame, at, top, text, color, size, rot, fade})` — rubber-stamp slam, centred
- `S1`, `S2`, `S7` (scene spans `{from, to}`), `CUE` (your cue frames), `SEL_AT` (headline highlight frames), `Easing`, `interpolate`

Patterns that read well:
- One idea per card; reveal rows on their cue words (`opacity: 0.3 + 0.7 * lerp01(frame, a-3, a+4)`).
- "Wrong way" visuals: strike-through bar `scaleX(lerp01(...))`, `Stamp` in red, a shaking card.
- "Right way": ticks, a yellow highlight pill, a black rule pill at the bottom (`background: C.cta`).
- Fade scene-1 content by `S1.to - 6`; when one element replaces another in the same spot, fade the first out 6 frames before.
