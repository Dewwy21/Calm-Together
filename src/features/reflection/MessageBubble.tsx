import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { ReflectionMessage } from '../logEvent/types';
import { DisclaimerNote } from '../aiEngine/DisclaimerNote';

interface MessageBubbleProps {
  message: ReflectionMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { color, spacing, typography, organicRadii, shadows } = useTheme();
  const isAssistant = message.role === 'assistant';

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ alignItems: isAssistant ? 'flex-start' : 'flex-end' }}>
        <View
          style={[
            {
              maxWidth: '86%',
              backgroundColor: isAssistant ? color.surface : color.primary,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              ...organicRadii.speechBubble,
            },
            isAssistant ? shadows.card : null,
          ]}
        >
          <Text style={[typography.body, { color: isAssistant ? color.textPrimary : color.textOnPrimary }]}>
            {message.text}
          </Text>
        </View>
      </View>

      {isAssistant && !!message.framework && (
        <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>Based on: {message.framework}</Text>
      )}
      {isAssistant && message.showsDisclaimer && <DisclaimerNote />}
    </View>
  );
}

export function ThinkingBubble() {
  const { color, spacing, organicRadii, shadows, typography } = useTheme();
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View
        style={[
          {
            backgroundColor: color.surface,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            ...organicRadii.speechBubble,
          },
          shadows.card,
        ]}
      >
        <Text style={[typography.body, { color: color.textSecondary }]}>···</Text>
      </View>
    </View>
  );
}
