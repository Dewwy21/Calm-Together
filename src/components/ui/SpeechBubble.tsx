import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface SpeechBubbleProps {
  text: string;
}

// The mascot's encouragement bubble — asymmetric organic radius (one sharp
// corner) so it visually points toward the mascot rather than reading as a
// generic rounded card.
export function SpeechBubble({ text }: SpeechBubbleProps) {
  const { color, organicRadii, spacing, typography, shadows } = useTheme();
  return (
    <View
      style={{
        backgroundColor: color.surface,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        ...organicRadii.speechBubble,
        ...shadows.card,
      }}
    >
      <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{text}</Text>
    </View>
  );
}
