// ============================================================ Scene 1 — 655 → 18 tiles → 3 red, nameless → more questions, same score
const RED = [4, 9, 15];
const RED_NAMES = ['Inference', 'Assumption', 'Data reading'];
export const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const out = S1.to - 6;
  const fade = 1 - lerp01(frame, out, out + 6);
  const score = enterExit(frame, -6);
  const crack = lerp01(frame, CUE.oneAt - 2, CUE.oneAt + 6);
  const burst = lerp01(frame, CUE.eighteenAt - 2, CUE.eighteenAt + 12, Easing.out(Easing.cubic));
  const gridOut = 1 - lerp01(frame, CUE.everyoneAt - 6, CUE.everyoneAt + 2);
  const fine = lerp01(frame, CUE.fineAt - 2, CUE.fineAt + 8);
  const red = lerp01(frame, CUE.twoAt - 2, CUE.twoAt + 6);
  const nameless = frame >= CUE.namesAt - 2;
  const mocks = enterExit(frame, CUE.everyoneAt);
  const rows = [['+200 questions', CUE.questionsAt], ['+30 videos', CUE.videosAt]] as const;
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={-24} gap={3} selAt={SEL_AT[0]} exitAt={out}
        words={[{ t: 'your score is', k: 'b' }, { t: 'lying', k: 'sel' }]} />
      {burst < 1 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', ...score, opacity: (score.opacity as number) * (1 - burst), transform: `translateX(${shake(frame, CUE.lyingAt, 14, 16)}px) scale(${1 + 0.15 * burst})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.14em', color: '#9A9A95' }}>YOUR MOCK SCORE</div>
          <div style={{ position: 'relative', display: 'inline-block', fontFamily: SANS_T, fontWeight: 800, fontSize: 260, lineHeight: 1, color: C.ink, letterSpacing: '-0.04em' }}>
            655
            <svg style={{ position: 'absolute', left: 0, top: 0, opacity: crack }} width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
              <path d="M48 0 L44 18 L54 26 L42 40 L50 60" stroke={C.red} strokeWidth={1.4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
            </svg>
          </div>
        </div>
      )}
      {burst > 0 && gridOut > 0 && (
        <div style={{ position: 'absolute', left: 150, width: 780, top: 470, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, opacity: gridOut * fade }}>
          {Array.from({ length: 18 }).map((_, i) => {
            const p = lerp01(frame, CUE.eighteenAt - 2 + (i % 6), CUE.eighteenAt + 8 + (i % 6), Easing.out(Easing.back(2)));
            const isRed = RED.includes(i);
            const bg = isRed && red > 0 ? C.red : fine > 0 && !isRed ? C.green : '#D6D6D2';
            return (
              <div key={i} style={{ height: 112, borderRadius: 18, background: bg, display: 'grid', placeItems: 'center', fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: '#fff', transform: `scale(${p * (isRed && red > 0 ? 1 + 0.08 * Math.sin(frame / 3) : 1)})` }}>
                {isRed && nameless ? '?' : ''}
              </div>
            );
          })}
        </div>
      )}
      {red > 0 && gridOut > 0 && (
        <div style={{ position: 'absolute', left: 120, width: 840, top: 900, display: 'flex', justifyContent: 'center', gap: 14, opacity: gridOut * fade }}>
          {RED_NAMES.map((nm, i) => {
            const p = pop(frame, CUE.costingAt - 4 + i * 3, 8, 2);
            return <span key={nm} style={{ background: '#FDECEC', color: C.red, borderRadius: 14, padding: '8px 18px', fontFamily: SANS_T, fontWeight: 800, fontSize: 32, transform: `scale(${p})`, opacity: p > 0 ? 1 : 0, filter: nameless ? 'blur(7px)' : 'none' }}>{nm}</span>;
          })}
        </div>
      )}
      <Sticker frame={frame} at={CUE.costingAt} left={680} top={960} text="−points" rot={7} bg={C.red} fade={gridOut} />
      <Card style={{ left: 120, width: 840, top: 480, padding: '14px 34px', ...mocks, opacity: (mocks.opacity as number) * fade }}>
        {rows.map(([t, a], i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', height: 88, borderTop: i ? '2px solid #EEEEEA' : 'none', fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: C.ink, opacity: lerp01(frame, a - 3, a + 4) }}>{t}</div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 110, borderTop: '2px solid #EEEEEA', opacity: lerp01(frame, CUE.sameAt - 6, CUE.sameAt) }}>
          {['645', '650', '645'].map((s, i) => <span key={i} style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 60, color: i === 2 ? C.red : C.ink }}>{s}{i < 2 ? <span style={{ color: '#C9C9C4', margin: '0 18px' }}>→</span> : null}</span>)}
        </div>
      </Card>
      <Stamp frame={frame} at={CUE.sameAt + 4} top={880} text="SAME SCORE" fade={fade} />
    </>
  );
};

// ============================================================ Scene 2 — OnePrep: skill map → daily plan → AI tutor; then the trick: write the skill
export const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const A = frame < CUE.trickAt - 4;
  const aOut = 1 - lerp01(frame, CUE.trickAt - 8, CUE.trickAt - 2);
  const map = enterExit(frame, CUE.mapsAt - 4);
  const plan = pop(frame, CUE.planAt - 2, 9, 2);
  const chat = enterExit(frame, CUE.midnightAt - 4);
  const steps = ['Step 1 · find the conclusion', 'Step 2 · spot the gap', 'Step 3 · test each option'];
  const note = enterExit(frame, CUE.wrongAt - 6);
  const strike = lerp01(frame, CUE.whyAt - 2, CUE.whyAt + 8, Easing.out(Easing.cubic));
  const chips = [['Inference', CUE.infAt], ['Assumption', CUE.assumpAt], ['Timing', CUE.timingAt]] as const;
  const rule = enterExit(frame, CUE.topicsAt - 4);
  return (
    <>
      <Headline frame={frame} top={290} size={92} start={S2.from + 4} gap={4} selAt={SEL_AT[1]} exitAt={CUE.trickAt - 8}
        words={[{ t: 'meet', k: 'b' }, { t: 'OnePrep', k: 'sel' }]} />
      <Headline frame={frame} top={290} size={92} start={CUE.trickAt - 2} gap={3} selAt={CUE.tonightAt}
        words={[{ t: 'try this', k: 'b' }, { t: 'tonight', k: 'sel' }]} />
      {A && (
        <div style={{ opacity: aOut }}>
          <Card style={{ left: 120, width: 840, top: 450, padding: '22px 30px', ...map }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: '#9A9A95' }}><span>YOUR 18 SKILLS</span><span style={{ color: C.red, opacity: lerp01(frame, CUE.failingAt - 3, CUE.failingAt + 4) }}>3 FAILING</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 10, marginTop: 14 }}>
              {Array.from({ length: 18 }).map((_, i) => {
                const on = lerp01(frame, CUE.mapsAt + i, CUE.mapsAt + 6 + i);
                const bad = RED.includes(i) && frame >= CUE.failingAt - 2;
                return <span key={i} style={{ height: 52, borderRadius: 10, background: bad ? C.red : on > 0.5 ? C.green : '#E4E4E0', transform: `scale(${0.6 + 0.4 * on})` }} />;
              })}
            </div>
          </Card>
          <Card style={{ left: 120, width: 840, top: 680, padding: '18px 30px', transform: `scale(${plan})`, opacity: (plan > 0 ? 1 : 0) * (1 - lerp01(frame, CUE.midnightAt - 6, CUE.midnightAt)) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: '#9A9A95' }}>TODAY’S PLAN</div>
            {RED_NAMES.map((nm, i) => <div key={nm} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: SANS_T, fontWeight: 800, fontSize: 38, color: C.ink, opacity: lerp01(frame, CUE.planAt + i * 4, CUE.planAt + 6 + i * 4) }}><span>{nm}</span><span style={{ color: C.blue }}>{[20, 15, 10][i]} Qs</span></div>)}
          </Card>
          <Card style={{ left: 120, width: 840, top: 680, padding: '18px 30px', ...chat }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: C.blue, color: '#fff', borderRadius: 12, padding: '6px 16px', fontFamily: SANS_T, fontWeight: 800, fontSize: 30, opacity: lerp01(frame, CUE.tutorAt - 3, CUE.tutorAt + 4) }}>AI tutor</span>
              <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 30, color: '#9A9A95' }}>12:04 AM</span>
            </div>
            {steps.map((s, i) => <div key={s} style={{ fontFamily: SANS_T, fontWeight: 700, fontSize: 36, color: C.ink, marginTop: 12, opacity: lerp01(frame, CUE.stepAt - 4 + i * 5, CUE.stepAt + 2 + i * 5) }}>{s}</div>)}
          </Card>
        </div>
      )}
      {!A && (
        <>
          <Card style={{ left: 120, width: 840, top: 460, padding: '24px 34px', background: '#FFFDF4', ...note }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: '#9A9A95' }}>MISTAKE LOG</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
              <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: C.ink }}>Q17 ✗</span>
              <span style={{ position: 'relative', fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: strike > 0 ? '#9A9A95' : C.ink, opacity: lerp01(frame, CUE.readingAt - 3, CUE.readingAt + 4) }}>
                Reading Comp.
                <span style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 8, borderRadius: 4, background: C.red, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
              {chips.map(([t, a]) => { const p = pop(frame, a - 2, 8, 2.2); return <span key={t} style={{ background: C.yellow, borderRadius: 14, padding: '8px 20px', fontFamily: SANS_T, fontWeight: 800, fontSize: 38, color: C.ink, transform: `scale(${p})`, opacity: p > 0 ? 1 : 0 }}>{t}</span>; })}
            </div>
          </Card>
          <Sticker frame={frame} at={CUE.tonightAt} left={640} top={420} text="save this" rot={7} />
          <Card style={{ left: 120, width: 840, top: 820, padding: '10px 30px', ...rule }}>
            {[['Topics', 'hide the problem', C.red, CUE.topicsAt], ['Skills', 'show it', C.green, CUE.skills2At]].map(([a, b, col, at], i) => (
              <div key={a as string} style={{ display: 'flex', alignItems: 'center', gap: 18, height: 84, borderTop: i ? '2px solid #EEEEEA' : 'none', opacity: 0.3 + 0.7 * lerp01(frame, (at as number) - 3, (at as number) + 4) }}>
                <span style={{ width: 170, fontFamily: SANS_T, fontWeight: 800, fontSize: 44, color: col as string }}>{a}</span>
                <span style={{ fontFamily: SANS_T, fontWeight: 800, fontSize: 40, color: C.ink }}>{b}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
};
