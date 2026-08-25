import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { AnimatedMascot, MascotMotion } from '../../components/Mascot';
import { SpeechBubble } from '../../components/ui';
import { IconProps } from '../../components/icons';

interface MascotMomentProps {
  text: string;
  motion?: MascotMotion;
  propIcon?: React.ComponentType<IconProps>;
  size?: number;
  ctaLabel?: string;
  onPressCta?: () => void;
}

// The reusable "contextual moment" building block: an animated mascot next
// to a speech bubble, with an optional tap-through recommendation. Used
// anywhere the otter needs to say something specific to what just
// happened, rather than just sitting decoratively next to a title.
export function MascotMoment({ text, motion = 'idle', propIcon, size = 56, ctaLabel, onPressCta }: MascotMomentProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
        <AnimatedMascot size={size} motion={motion} propIcon={propIcon} />
        <View style={{ flex: 1 }}>
          <SpeechBubble text={text} />
        </View>
      </View>
      {ctaLabel && onPressCta && (
        <Pressable
          onPress={onPressCta}
          style={{
            alignSelf: 'flex-start',
            marginLeft: size + spacing.sm,
            backgroundColor: color.primaryTint,
            borderRadius: radii.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          <Text style={[typography.bodySmall, { color: color.primary, fontFamily: typography.bodyEmphasis.fontFamily }]}>{ctaLabel} →</Text>
        </Pressable>
      )}
    </View>
  );
}
