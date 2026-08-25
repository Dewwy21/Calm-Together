export interface MascotProps {
  size?: number;
}

// Motion presets applied to the single mascot photo via Animated transforms
// (no per-pose artwork exists — see AnimatedMascot.tsx). `idle` is the
// default ambient state: a slow, subtle breathing pulse, safe to use
// anywhere the mascot appears without it feeling distracting.
export type MascotMotion = 'idle' | 'wave' | 'bounce' | 'float' | 'sway' | 'celebrate' | 'encourage';

// Named poses reusable throughout the app: each maps to a motion + an
// optional small prop icon shown alongside the mascot (see mascotPoses.ts).
// This is how "several mascot poses" are delivered without new artwork.
export type MascotPoseName =
  | 'happy'
  | 'thinking'
  | 'listening'
  | 'celebrating'
  | 'relaxing'
  | 'encouraging'
  | 'reading'
  | 'writing'
  | 'meditating'
  | 'lantern'
  | 'backpack'
  | 'tea'
  | 'guiding';
