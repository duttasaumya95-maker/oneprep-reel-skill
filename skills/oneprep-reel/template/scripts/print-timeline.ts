import { SCENES, VO, LINES, CUE, DURATION } from '../src/timeline';
const s = (f: number) => (f / 30).toFixed(2);
SCENES.forEach((x, i) => console.log(`S${i + 1}  ${s(x.from)} → ${s(x.to)}  (${s(x.to - x.from)}s)`));
Object.keys(VO).forEach((id) => console.log(`  ${id.padEnd(4)} @${s(VO[id])}  dur ${LINES[id].dur.toFixed(2)}`));
console.log('total', s(DURATION), 's', JSON.stringify(CUE));
