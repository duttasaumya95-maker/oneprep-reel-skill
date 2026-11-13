---
name: oneprep-reel
description: Make 25–60 s vertical (1080×1920) explainer reels in the OnePrep "GMAT Truths" format — sarcastic hook, deadpan turn, two sincere teaching lines, a CTA card with a cursor click — with an ElevenLabs voice, word-synced captions, an avatar, SFX and music, rendered in Remotion and mastered to −14 LUFS. Use when the user asks for a reel, short, promo or "GMAT Truths" episode in this format, or wants to batch several episodes from a topic list.
---

# OnePrep reel format

One script → one voice take → word timings → two animated scenes + CTA → one mastered MP4.
Everything on screen is driven by the spoken words: every cue is "the frame this word starts".

## The format (keep it)
| Part | Lines | Tone | Screen |
|---|---|---|---|
| Scene 1 | s1 hook, s2 turn | `[sarcastic]` then `[deadpan]` | Headline with a highlighted word, the "wrong way" acted out, camera punch on the turn |
| Scene 2 | s3 teach, s4 rule | `[sincere]` ×2 | Headline, the right way step by step, a one-line rule to remember |
| Scene 3 (CTA) | s5 ask + offer, s6 close | `[excited]` | Product card assembles, cursor clicks the button on a word of s6, ✓ confirm |

- 1080×1920, 30 fps. Episodes **under 40 s** (~65–80 words); promos up to 60 s (~130–150 words).
- One video per topic: captions + music version only.
- Palette, fonts, safe areas and mix levels: `reference/format.md`. Scene helpers: `reference/scene-api.md`.

## Setup (once)
```bash
zsh skills/oneprep-reel/tools/init-workspace.sh ~/Desktop/my-reels
```
Then add the audio files listed in `reel/public/ASSETS.md` (Mixkit, not redistributed here).
Voice: the ElevenLabs connector (`creative_generate_speech`, `creative_transcribe_audio`). Never put an API key in the workspace or in git.

## Per episode (run from the workspace)
1. **Script** — 5 lines + the closing line (see "Writing rules"). Save `episode.json` (schema in `tools/new-episode.py`).
2. **Project** — `python3 tools/new-episode.py episode.json` → `reel-epNN/`, `epNN/FULL-SCRIPT.txt` (the exact TTS prompt).
3. **Voice** — `creative_generate_speech` with the FULL-SCRIPT text, `model_id: eleven_v4`, your voice_id, `generations_count: 1`, one shared `flow_id`.
   Save the audio as `epNN/full.mp3`.
4. **Timings** — poll `creative_get_flow_run_status` until the speech is **completed**, *then* `creative_transcribe_audio` with `connect_from: [speech node]`.
   Connecting to an unfinished speech node re-runs (and re-charges) the speech. Download `words_download_url` → `.work/epNN/words.json`.
5. **Align** — `python3 tools/words-align.py NN .work/epNN/words.json`. It needs the transcript word count to equal the script's;
   if it differs (e.g. "one hundred" → "100"), edit words.json or re-word the line. Full-take and reused-last-line modes are automatic.
6. **Spec + scenes** — write `specs/specNN.py` and `specs/scNN.tsx` (copy an example from `examples/`), then `python3 tools/gen.py NN`.
7. **Check** — `cd reel-epNN && npx tsc --noEmit -p .`, then `zsh tools/sheet.sh NN <8 frame numbers>` and look at `.work/exNN/sheet.png`.
   Fix overlaps, clipped text, empty frames, wrong numbers; re-run gen + sheet.
8. **Render** — `zsh tools/finish-ep.sh NN` (tighten pauses → per-line loudnorm → render → master −14 LUFS / −1.5 dBTP) → `deliverables/epNN/`.

## Spec file (`specs/specNN.py`)
```python
TITLE1 = 'what scene 1 shows'; TITLE2 = 'what scene 2 shows'
CUES1 = [('lyingAt','s1','lying',0), ...]   # (name, line, word-prefix, occurrence) — scene 1 words from s1/s2
CUES2 = [('mapsAt','s3','maps',0), ...]     # scene 2 words from s3/s4
PUNCH = 'oneAt'; PUNCH_WORD = 'it’s eighteen'   # camera punch frame
SEL2 = 'mapsAt'                                # when scene 2's highlighted headline word appears (pick an early cue)
AV1 = 'oneAt'; AV2 = 'trickAt'; NODS = ['namesAt', 'stepAt', 'skills2At']   # avatar moves
SFX = [('hit-weak.mp3', 'lyingAt', -20), ...] # (file in public/sfx, cue, dB)
CAPS = ["...plain('Your'), T('GMAT score', 2, true), ...", ...]   # s1..s5 caption tokens
```
- Cue needles match the **start** of a word, case-insensitive ("five" won't hit "ninety-five", but "nine" hits "ninety"; use the occurrence index).
- Captions: `T(text, words, highlight)` shows `text` for the next `words` spoken words; `...plain('a b c')` = one token per word.
  The word counts in a line **must add up exactly** to the spoken words of that line. Write digits on screen ("3 to 5") even when spoken as words.
- The closing line s6 caption lives in `reel-epNN/src/Captions.tsx`; the CTA click word in `timeline.ts` (`clickAt = wordStart('s6', '…')`).
  Change the CTA card text in `Scenes.tsx` → `Scene7` (gen.py never touches Scene 7, the CTA timeline or s6).

## Scene file (`specs/scNN.tsx`)
Must start with the line `// ============================================================ Scene 1 — …` and contain `Scene1` and `Scene2`
(`export const SceneN: React.FC<{ frame: number }>`). Put any shared helper **after** that marker line, never above it
(gen.py keeps everything above the first marker as the shared preamble — a helper there gets duplicated on re-runs).
Layout: headline at top 290; content between y 450 and ~1100; avatar bottom-left/right; captions ~1480–1580 — keep that band clear.
Exit scene 1 content by `S1.to - 6`; use `CUE.xxxAt` for every appearance so it lands on the word.

## Writing rules
- Hook = a recognisable mistake said with confidence ("You solved it fully. Three minutes. Proud?"). Turn = 3–8 flat words.
- Teach with one concrete, checkable example; then one rule line. Do the maths yourself and write it in the episode notes.
- No invented stats, scores or guarantees. Hedge exam facts or check the official source.
- Spoken text: words, not symbols. Avoid single letters and spoken digits that a transcriber may merge ("2n", "one hundred").
  Write GMAT as `GMAT` in lines.mjs (spoken "Gee-Mat"); the prompt uses `/ˈdʒiːmæt/`.
- Tags: `[sarcastic] [deadpan] [sincere] [sincere] [excited]`.

## QA before sending
- Sheet frames: nothing overlaps the headline or captions band, no empty stretch over ~0.5 s, numbers on screen match the voice.
- Length under the limit; loudness line from finish-ep shows `I -14.x TP -1.5`.
- Credits: ~450–520 ElevenLabs credits per 30 s take, ~830 for a 48 s promo. Transcription is free.

## Gotchas learned the hard way
- Remotion's bundled ffmpeg has no `tile`/`pad` filters → sheets are tiled with PIL (`tools/tile.py`).
- Keep the pipeline in the workspace, not a temp folder — temp dirs get wiped.
- A transcription started before its speech finished re-generates the speech.
