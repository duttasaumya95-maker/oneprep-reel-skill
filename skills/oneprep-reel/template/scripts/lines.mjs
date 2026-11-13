// Episode 100 voiceover (Eleven v4 full take). Last line reused from Ep4. `tts` = spoken words (GMAT -> Gee-Mat).
const L = [
  'Got a question wrong. Read the explanation. Felt smart. Never saw it again.',
  'Next month. Same trap. Same mistake.',
  'Re-solve every wrong question after three days. Then again after seven.',
  'Can’t solve it cold? It goes back in the pile. That’s how mistakes stop repeating.',
  'Want a mistake log that works? Join a free one-day session with a GMAT expert with fifteen-plus years of experience,',
  'and get every doubt cleared. Tap the link.',
];
export const LINES = L.map((text, i) => ({ id: `s${i + 1}`, text, tts: text.replace(/GMAT/g, 'Gee-Mat') }));
