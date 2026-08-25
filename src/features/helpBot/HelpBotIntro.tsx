import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { AnimatedMascot } from '../../components/Mascot';
import { SpeechBubble, Chip } from '../../components/ui';
import { useDenContext } from '../den/DenProvider';

const STARTER_PROMPTS = [
  'I had a rough moment today',
  "I'm feeling overwhelmed",
  'Something good happened',
  'Tell me about ADHD',
];

interface HelpBotIntroProps {
  onPromptPress: (prompt: string) => void;
}

// Shown only when the conversation is empty. The greeting is aware of the
// caregiver's own recent history (streak, logs) so it can celebrate a
// milestone rather than always opening with the same generic line.
export function HelpBotIntro({ onPromptPress }: HelpBotIntroProps) {
  const { spacing, typography, color } = useTheme();
  const den = useDenContext();

  const greeting =
    den.streak >= 3
      ? `Hey, look at that, a ${den.streak} day streak. I see you showing up for this. What's on your mind today?`
      : den.totalLogs === 0
      ? "Hi, I'm glad you're here. I'm around whenever you want to talk something through, celebrate a win, or just take a breath. What's going on?"
      : "Hey, good to see you. Whatever today's been like, I'm here for it. What's on your mind?";

  return (
    <View style={{ gap: spacing.xl, alignItems: 'center', paddingTop: spacing.xl }}>
      <AnimatedMascot size={110} motion={den.streak >= 3 ? 'celebrate' : 'idle'} />
      <View style={{ width: '100%' }}>
        <SpeechBubble text={greeting} />
      </View>
      <View style={{ width: '100%', gap: spacing.sm }}>
        <Text style={[typography.caption, { color: color.textSecondary }]}>OR TRY ONE OF THESE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {STARTER_PROMPTS.map((prompt) => (
            <Chip key={prompt} label={prompt} active={false} onPress={() => onPromptPress(prompt)} />
          ))}
        </View>
      </View>
    </View>
  );
}
