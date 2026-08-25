import React from 'react';
import { Image } from 'react-native';
import { MascotProps } from './types';

const OTTER_IMAGE = require('../../../assets/mascot/otter.png');

// Renders the caregiver-supplied otter illustration directly. `pose`,
// `expression`, and `accessory` stay on the prop signature for source
// compatibility with existing call sites but are currently no-ops — there's
// only one source image. Add pose-specific artwork later if needed.
export function Mascot({ size = 120 }: MascotProps) {
  return <Image source={OTTER_IMAGE} style={{ width: size, height: size }} resizeMode="contain" />;
}
