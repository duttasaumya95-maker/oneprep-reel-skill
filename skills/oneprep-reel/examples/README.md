# Examples (real episodes)

| Files | Episode | Shows |
|---|---|---|
| `spec89.py`, `sc89.tsx` | Remainders (Quant teach) | algebra card struck out → step rows → answer pill → rule pill |
| `spec92.py`, `sc92.tsx` | "Verbal is common sense" | profile card + falling score bar → screen vs outside knowledge → evidence/gap/conclusion |
| `spec101.py`, `sc101.tsx` | 48 s OnePrep promo | longer scenes with phases, two headlines in one scene (`exitAt` + a second `Headline`) |
| `episode.json` | template input | what `tools/new-episode.py` expects |

Copy a pair into `<workspace>/specs/` renamed to your episode number, then edit.

The promo also changed the CTA (not covered by gen.py): in `reel-epNN/src/`
- `timeline.ts`: `const clickAt = wordStart('s6', 'oneprep');` (the s6 word the cursor clicks on)
- `Captions.tsx`: `s6: [...plain('Go to'), T('oneprep.in', 3, true)],`
- `Scenes.tsx` → `Scene7`: the card strings ("10 days free", "See your 18-skill map", "₹0 · no card", "Start free trial →", "Trial started").
