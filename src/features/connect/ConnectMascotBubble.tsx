import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { AnimatedMascot, MASCOT_POSES, MascotPoseName } from '../../components/Mascot';
import { SpeechBubble } from '../../components/ui';

interface ConnectMascotBubbleProps {
  text: string;
  size?: number;
  pose?: MascotPoseName;
  /** if present, the whole bubble becomes tappable (e.g. jump to a recommended activity) */
  onPress?: () => void;
}

// The otter's recurring "guide" presence across Connect: introduces a
// section or celebrates progress, conversational rather than a mascot
// cheering from the sidelines. `pose` defaults to a calm idle breathing
// motion; pass 'guiding' when the bubble is a tappable recommendation.
export function ConnectMascotBubble({ text, size = 56, pose = 'happy', onPress }: ConnectMascotBubbleProps) {
  const { spacing } = useTheme();
  const { motion, propIcon } = MASCOT_POSES[pose];
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}
    >
      <AnimatedMascot size={size} motion={motion} propIcon={propIcon} />
      <View style={{ flex: 1 }}>
        <SpeechBubble text={text} />
      </View>
    </Pressable>
  );
}
