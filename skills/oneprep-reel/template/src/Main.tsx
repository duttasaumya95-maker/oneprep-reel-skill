import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { BLUR_SPANS, DURATION, LINES, ORIGIN, SCENES, SFX, VO, musicVolume } from './timeline';
import { camAt } from './camera';
import { C } from './ui';
import { Scene1, Scene2, Scene7 } from './Scenes';
import { Avatar } from './Avatar';
import { Captions } from './Captions';

export type ReelProps = { captions: boolean; bgm: boolean };

const SCENE_COMPONENTS = [Scene1, Scene2, Scene7];
// how long each scene's content stays visible after its boundary (camera leaving it)
const TAIL = [14, 14, 0];

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const c = camAt(frame);
  const gx = Math.floor((c.x - 1560) / 60) * 60;
  const gy = Math.floor((c.y - 2040) / 60) * 60;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.bg }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.s}) rotate(${c.r}deg) translate(${-540 - c.x}px, ${-960 - c.y}px)` }}>
        <div style={{
          position: 'absolute', left: gx, top: gy, width: 4200, height: 6000,
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: '60px 60px',
        }} />
        {SCENE_COMPONENTS.map((Comp, i) => {
          const s = SCENES[i];
          if (frame < s.from - 1 || frame >= s.to + TAIL[i]) return null;
          return (
            <div key={i} style={{ position: 'absolute', left: ORIGIN[i].x, top: ORIGIN[i].y, width: 1080, height: 1920 }}>
              <Comp frame={frame} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ captions, bgm }) => {
  const frame = useCurrentFrame();
  const fast = BLUR_SPANS.some(([a, b]) => frame >= a && frame <= b);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={200} samples={10}><World /></CameraMotionBlur>
      ) : (
        <World />
      )}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'linear-gradient(rgba(0,0,0,.06), transparent 12%, transparent 88%, rgba(0,0,0,.06))' }} />
      <Avatar />
      {captions && <Captions />}
      {Object.keys(VO).map((id) =>
        LINES[id].file ? (
          <Sequence key={id} from={VO[id]} durationInFrames={Math.ceil(LINES[id].dur * 30) + 2} name={`VO ${id}`}>
            <Audio src={staticFile(LINES[id].file!)} />
          </Sequence>
        ) : null,
      )}
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={s.dur ?? 60} name={`SFX ${s.file}`}>
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.vol} />
        </Sequence>
      ))}
      {bgm && <Audio src={staticFile('bgm/tonight-hiphop.mp3')} volume={(f) => musicVolume(f)} />}
      {void DURATION}
    </AbsoluteFill>
  );
};
