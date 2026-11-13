import { Easing } from 'remotion';
import { CAM, CamKey } from './timeline';

const EASE: Record<NonNullable<CamKey['ease']>, (t: number) => number> = {
  out: Easing.out(Easing.cubic),
  inout: Easing.inOut(Easing.cubic),
  whip: Easing.bezier(0.6, 0, 0.4, 1), // whip-pan curve from WhipPanReal.tsx
  lin: (t) => t,
  cut: () => 1,
};

export type Cam = { x: number; y: number; s: number; r: number };

export const camAt = (frame: number): Cam => {
  if (frame <= CAM[0].f) return CAM[0];
  for (let i = 1; i < CAM.length; i++) {
    const b = CAM[i];
    if (frame <= b.f) {
      const a = CAM[i - 1];
      if (b.ease === 'cut') return frame < b.f ? a : b;
      const t = EASE[b.ease ?? 'inout']((frame - a.f) / Math.max(1, b.f - a.f));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: a.s + (b.s - a.s) * t, r: a.r + (b.r - a.r) * t };
    }
  }
  return CAM[CAM.length - 1];
};
