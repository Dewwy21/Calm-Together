import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { Mascot } from '../../components/Mascot';
import { SpeechBubble } from '../../components/ui';

interface OnboardingBreakProps {
  message: string;
}

// A brief, question-free pause between clusters of questions, purely for
// encouragement and pacing.
export function OnboardingBreak({ message }: OnboardingBreakProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
      <Mascot size={110} />
      <SpeechBubble text={message} />
    </View>
  );
}
