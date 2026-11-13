import React from 'react';
import { Composition } from 'remotion';
import { DURATION, FPS, H, W } from './timeline';
import { Reel, ReelProps } from './Main';

export const Root: React.FC = () => (
  <Composition<any, ReelProps>
    id="OnePrepReel"
    component={Reel}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{ captions: true, bgm: true }}
  />
);
