import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { LeafIcon, StarIcon, CloudIcon, TreeIcon, RiverIcon, FlowerIcon, IconProps } from '../../components/icons';

const MOTIF_SETS: React.ComponentType<IconProps>[][] = [
  [LeafIcon, StarIcon],
  [CloudIcon, TreeIcon],
  [RiverIcon, FlowerIcon],
  [StarIcon, LeafIcon],
];

interface OnboardingDecorProps {
  /** picks which pair of nature motifs to show, so it varies screen to screen without being random */
  variant: number;
}

// Purely decorative, low-opacity nature accents in the far corners. Never
// sits behind text or interactive elements, so it can't get in the way of
// the actual question.
export function OnboardingDecor({ variant }: OnboardingDecorProps) {
  const { color } = useTheme();
  const [TopIcon, BottomIcon] = MOTIF_SETS[variant % MOTIF_SETS.length];

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <View style={{ position: 'absolute', top: 12, right: 8, opacity: 0.12 }}>
        <TopIcon size={64} color={color.secondary} />
      </View>
      <View style={{ position: 'absolute', bottom: 90, left: 4, opacity: 0.1 }}>
        <BottomIcon size={56} color={color.primary} />
      </View>
    </View>
  );
}
