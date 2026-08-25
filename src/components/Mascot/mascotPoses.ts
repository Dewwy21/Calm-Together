import { MascotMotion, MascotPoseName } from './types';
import {
  IconProps,
  BookIcon,
  PencilIcon,
  SwirlIcon,
  BackpackIcon,
  ThoughtIcon,
  ArrowRightIcon,
  TeacupIcon,
  LanternIcon,
  StarIcon,
  LeafIcon,
} from '../icons';

export interface MascotPoseConfig {
  motion: MascotMotion;
  propIcon?: React.ComponentType<IconProps>;
}

// Named poses reusable throughout the app — each is just a motion + an
// optional small prop icon layered on the one real mascot photo (see
// AnimatedMascot.tsx). This is the concrete, buildable stand-in for hand
// -drawn per-pose artwork, which isn't possible without an image-generation
// tool.
export const MASCOT_POSES: Record<MascotPoseName, MascotPoseConfig> = {
  happy: { motion: 'idle' },
  thinking: { motion: 'sway', propIcon: ThoughtIcon },
  listening: { motion: 'idle' },
  celebrating: { motion: 'celebrate', propIcon: StarIcon },
  relaxing: { motion: 'sway', propIcon: LeafIcon },
  encouraging: { motion: 'encourage' },
  reading: { motion: 'idle', propIcon: BookIcon },
  writing: { motion: 'idle', propIcon: PencilIcon },
  meditating: { motion: 'sway', propIcon: SwirlIcon },
  lantern: { motion: 'float', propIcon: LanternIcon },
  backpack: { motion: 'idle', propIcon: BackpackIcon },
  tea: { motion: 'idle', propIcon: TeacupIcon },
  guiding: { motion: 'idle', propIcon: ArrowRightIcon },
};
