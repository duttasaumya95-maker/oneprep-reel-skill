// ============================================================ Scene 1 — ÷7 leaves 3, double it? algebra panic → pick a number
export const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const out = S1.to - 6;
  const fade = 1 - lerp01(frame, out, out + 6);
  const q = enterExit(frame, CUE.sevenAt - 12);
  const alg = enterExit(frame, CUE.algAt - 4);
  const algOut = 1 - lerp01(frame, CUE.skipAt - 2, CUE.skipAt + 6);
  const cut = lerp01(frame, CUE.skipAt, CUE.skipAt + 8, Easing.out(Easing.cubic));
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={-24} gap={3} selAt={SEL_AT[0]} exitAt={out}
        words={[{ t: 'need', k: 'b' }, { t: 'algebra?', k: 'sel' }]} />
      <Card style={{ left: 120, width: 840, top: 450, padding: '24px 34px', ...q, opacity: (q.opacity as number) * fade }}>
        <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 50, color: C.ink }}>n ÷ 7 → remainder <span style={{ color: C.blue, opacity: lerp01(frame, CUE.threeAt - 2, CUE.threeAt + 4) }}>3</span></div>
        <div style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 50, color: C.ink, marginTop: 12, opacity: lerp01(frame, CUE.doubleAt - 2, CUE.doubleAt + 6) }}>2n ÷ 7 → remainder <span style={{ background: C.yellow, borderRadius: 10, padding: '0 12px' }}>?</span></div>
      </Card>
      {algOut > 0 && (
        <Card style={{ left: 120, width: 840, top: 690, padding: '22px 34px', ...alg, opacity: (alg.opacity as number) * algOut, transform: `${alg.transform ?? ''} translateX(${shake(frame, CUE.panicAt, 12, 14)}px)` }}>
          {['n = 7k + 3', '2n = 14k + 6', '= 7(2k) + 6 … ?'].map((l, i) => (
            <div key={l} style={{ position: 'relative', fontFamily: SANS_T, fontWeight: 700, fontSize: 40, color: i === 2 ? C.red : C.ink, marginTop: i ? 8 : 0, opacity: lerp01(frame, CUE.algAt + i * 6, CUE.algAt + 6 + i * 6) }}>{l}</div>
          ))}
          <span style={{ position: 'absolute', left: 20, right: 20, top: '50%', height: 8, borderRadius: 4, background: C.red, transform: `scaleX(${cut})`, transformOrigin: 'left' }} />
        </Card>
      )}
      <Sticker frame={frame} at={CUE.panicAt} left={620} top={920} text="panic" rot={7} bg={C.red} fade={algOut} />
      <Stamp frame={frame} at={CUE.pickAt} top={760} text="PICK A NUMBER" color={C.green} fade={fade} />
    </>
  );
};

// ============================================================ Scene 2 — n = 3 → 2n = 6 → 6 ÷ 7 leaves 6
export const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const rows = [['n = 3', '3 ÷ 7 = 0 r 3 ✓', CUE.n3At], ['2n = 6', 'double it', CUE.sixAt], ['6 ÷ 7', '= 0 r 6', CUE.leavesAt]] as const;
  const ans = pop(frame, CUE.ansAt - 2, 9, 2.4);
  const rule = enterExit(frame, CUE.testAt - 4);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={S2.from + 4} gap={4} selAt={SEL_AT[1]}
        words={[{ t: 'pick the', k: 'b' }, { t: 'smallest', k: 'sel' }]} />
      <Card style={{ left: 120, width: 840, top: 450, padding: '8px 34px', ...enterExit(frame, S2.from + 2) }}>
        {rows.map(([a, b, at], i) => {
          const p = pop(frame, at - 2, 8, 2);
          return (
            <div key={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 100, borderTop: i ? '2px solid #EEEEEA' : 'none', opacity: p > 0 ? 1 : 0.15, transform: `translateX(${(1 - Math.min(1, p)) * 30}px)` }}>
              <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 54, color: C.blue }}>{a}</span>
              <span style={{ fontFamily: SANS_T, fontWeight: 700, fontSize: 38, color: '#8A8A85' }}>{b}</span>
            </div>
          );
        })}
      </Card>
      {ans > 0 && (
        <div style={{ position: 'absolute', left: 120, width: 840, top: 820, textAlign: 'center', transform: `scale(${ans})`, opacity: 1 - lerp01(frame, CUE.testAt - 6, CUE.testAt) }}>
          <span style={{ display: 'inline-block', background: C.yellow, borderRadius: 20, padding: '10px 36px', fontFamily: SANS_T, fontWeight: 800, fontSize: 64, color: C.ink }}>remainder = 6</span>
        </div>
      )}
      <div style={{ position: 'absolute', left: 120, width: 840, top: 820, textAlign: 'center', ...rule }}>
        <span style={{ display: 'inline-block', background: C.cta, color: '#fff', borderRadius: 18, padding: '14px 30px', fontFamily: SANS_T, fontWeight: 800, fontSize: 40 }}>test number → <span style={{ color: C.yellow }}>simplest one that fits</span></span>
      </div>
    </>
  );
};
