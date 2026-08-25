import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { EventType } from './types';

// Meltdown/Parent Reaction only. Positive Moment's own question flow
// (see questionConfig.ts POSITIVE_QUESTION_STEPS) already asks these kinds
// of things directly and interactively, so an extra "just something to sit
// with" box here would just repeat what was already asked.
const PROMPTS_BY_TYPE: Record<'meltdown' | 'parentReaction', string[]> = {
  meltdown: [
    'What do you think your child needed most during this moment?',
    'What went better than last time?',
    "Is there a pattern you're starting to notice?",
  ],
  parentReaction: [
    'What were you feeling right before you reacted?',
    'What would you want to tell a friend going through this same moment?',
    'What might help you feel steadier next time?',
  ],
};

interface ReflectionPromptsProps {
  eventType: EventType | null;
}

// Purely optional, non-interactive prompts — no input is collected here.
export function ReflectionPrompts({ eventType }: ReflectionPromptsProps) {
  const { color, spacing, typography, radii } = useTheme();
  if (!eventType || eventType === 'positiveMoment') return null;
  const prompts = PROMPTS_BY_TYPE[eventType];

  return (
    <View style={{ backgroundColor: color.secondaryTint, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }}>
      <Text style={[typography.h3, { color: color.textPrimary }]}>Reflection Questions</Text>
      <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
        No need to answer these, just something to sit with if you'd like.
      </Text>
      {prompts.map((prompt, i) => (
        <Text key={i} style={[typography.body, { color: color.textPrimary, fontStyle: 'italic' }]}>
          • {prompt}
        </Text>
      ))}
    </View>
  );
}
