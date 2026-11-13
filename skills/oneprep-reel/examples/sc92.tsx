// ============================================================ Scene 1 — engineer: Verbal is common sense → that's why points drop
export const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const out = S1.to - 6;
  const fade = 1 - lerp01(frame, out, out + 6);
  const card = enterExit(frame, CUE.engAt - 10);
  const items = [['Verbal = common sense', CUE.senseAt], ['Prep needed: none', CUE.skipAt]] as const;
  const drop = lerp01(frame, CUE.loseAt - 2, CUE.pointsAt + 8, Easing.out(Easing.cubic));
  const bar = enterExit(frame, CUE.exactlyAt - 4);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={-24} gap={3} selAt={SEL_AT[0]} exitAt={out}
        words={[{ t: 'common', k: 'b' }, { t: 'sense?', k: 'sel' }]} />
      <Card style={{ left: 120, width: 840, top: 450, padding: '24px 34px', ...card, opacity: (card.opacity as number) * fade }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ width: 70, height: 70, borderRadius: 18, background: C.blue, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: SANS_T, fontWeight: 800, fontSize: 36 }}>B.E</span>
          <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 46, color: C.ink }}>Engineer</span>
        </div>
        {items.map(([t, a]) => <div key={t} style={{ fontFamily: SANS_T, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 14, opacity: lerp01(frame, a - 3, a + 5) }}>✓ {t}</div>)}
      </Card>
      <Card style={{ left: 120, width: 840, top: 800, padding: '22px 34px', ...bar, opacity: (bar.opacity as number) * fade }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS_T, fontWeight: 800, fontSize: 34, color: C.ink }}><span>Verbal score</span><span style={{ color: drop > 0.1 ? C.red : C.ink }}>{Math.round(85 - 13 * drop)}</span></div>
        <div style={{ height: 22, borderRadius: 11, background: '#EEEEEA', marginTop: 14 }}>
          <div style={{ width: `${(85 - 13 * drop) / 90 * 100}%`, height: 22, borderRadius: 11, background: drop > 0.1 ? C.red : C.blue }} />
        </div>
      </Card>
    </>
  );
};

// ============================================================ Scene 2 — only what's on the screen → evidence, conclusion, gap
export const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const scr = enterExit(frame, S2.from + 2);
  const outside = pop(frame, CUE.outsideAt - 2, 8, 2);
  const x = lerp01(frame, CUE.screenAt - 4, CUE.screenAt + 4);
  const glow = lerp01(frame, CUE.screenAt - 2, CUE.screenAt + 6);
  const logic = enterExit(frame, CUE.treatAt - 4);
  const chips = [['Evidence', CUE.evidAt, C.blue], ['Conclusion', CUE.conclAt, C.ink]] as const;
  const gap = pop(frame, CUE.gapAt - 2, 8, 2.4);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={S2.from + 4} gap={4} selAt={SEL_AT[1]}
        words={[{ t: 'only the', k: 'b' }, { t: 'screen', k: 'sel' }]} />
      <div style={{ position: 'absolute', left: 120, top: 450, width: 520, height: 300, background: '#fff', border: `5px solid ${glow > 0 ? C.blue : '#1A1A1A'}`, borderRadius: 22, padding: 26, boxSizing: 'border-box', boxShadow: `0 0 ${40 * glow}px rgba(74,124,247,0.5)`, ...scr }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', color: '#9A9A95' }}>ON SCREEN</div>
        {[92, 80, 88, 60].map((w, i) => <div key={i} style={{ height: 16, borderRadius: 8, background: '#E4E4E0', width: `${w}%`, marginTop: 22 }} />)}
      </div>
      <div style={{ position: 'absolute', left: 680, top: 500, width: 280, textAlign: 'center', transform: `scale(${outside})`, opacity: (outside > 0 ? 1 : 0) * (1 - lerp01(frame, CUE.treatAt - 6, CUE.treatAt)) }}>
        <div style={{ position: 'relative', background: '#FFF4CC', borderRadius: 24, padding: '22px 10px', fontFamily: SANS_T, fontWeight: 800, fontSize: 34, color: C.ink }}>
          what I already know
          <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: x }}><CrossSvg size={120} color={C.red} /></span>
        </div>
      </div>
      <Card style={{ left: 120, width: 840, top: 800, padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, ...logic }}>
        <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 40, color: '#fff', background: chips[0][2], borderRadius: 14, padding: '8px 20px', opacity: lerp01(frame, chips[0][1] - 3, chips[0][1] + 4) }}>{chips[0][0]}</span>
        <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 36, color: C.red, border: `4px dashed ${C.red}`, borderRadius: 14, padding: '4px 16px', transform: `scale(${gap})`, opacity: gap > 0 ? 1 : 0 }}>gap</span>
        <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 40, color: '#fff', background: chips[1][2], borderRadius: 14, padding: '8px 20px', opacity: lerp01(frame, chips[1][1] - 3, chips[1][1] + 4) }}>{chips[1][0]}</span>
      </Card>
      <Sticker frame={frame} at={CUE.clicksAt} left={640} top={930} text="click." rot={-6} />
    </>
  );
};
