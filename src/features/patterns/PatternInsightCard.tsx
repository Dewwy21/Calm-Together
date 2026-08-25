import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { ChatIcon } from '../../components/icons';
import { DetectedPattern } from './types';
import { PatternVisual } from './PatternVisual';

interface PatternInsightCardProps {
  pattern: DetectedPattern;
  interpretation?: string;
  suggestedLessonTopic?: string | null;
  loadingInterpretation: boolean;
  accentColor: string;
  accentTint: string;
  onGenerateLesson?: (topic: string) => void;
}

export function PatternInsightCard({
  pattern,
  interpretation,
  suggestedLessonTopic,
  loadingInterpretation,
  accentColor,
  accentTint,
  onGenerateLesson,
}: PatternInsightCardProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const topic = suggestedLessonTopic ?? pattern.suggestedLessonTopic;

  return (
    <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }, shadows.card]}>
      <View>
        <Text style={[typography.h3, { color: color.textPrimary }]}>{pattern.title}</Text>
        <Text style={[typography.body, { color: color.textPrimary, marginTop: 2 }]}>{pattern.summary}</Text>
      </View>

      <PatternVisual evidence={pattern.evidence} accentColor={accentColor} />

      {loadingInterpretation ? (
        <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>Thinking about what this might mean...</Text>
      ) : interpretation ? (
        <View style={{ backgroundColor: accentTint, borderRadius: radii.md, padding: spacing.md, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ChatIcon size={14} color={accentColor} />
            <Text style={[typography.caption, { color: accentColor }]}>What this might mean</Text>
          </View>
          <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{interpretation}</Text>
        </View>
      ) : null}

      {topic && onGenerateLesson && (
        <Pressable
          onPress={() => onGenerateLesson(topic)}
          style={{ alignSelf: 'flex-start', backgroundColor: accentTint, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
        >
          <Text style={[typography.bodySmall, { color: accentColor }]}>Generate a lesson about this →</Text>
        </Pressable>
      )}
    </View>
  );
}
