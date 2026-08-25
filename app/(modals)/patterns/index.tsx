import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { BackButton } from '../../../src/components/ui';
import { AnimatedMascot } from '../../../src/components/Mascot';
import { usePatternInsights } from '../../../src/features/patterns/usePatternInsights';
import { PatternInsightCard } from '../../../src/features/patterns/PatternInsightCard';

export default function PatternsScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { patterns, status, interpretationFor } = usePatternInsights();

  function generateLesson(topic: string) {
    router.push(`/(modals)/courses/personalized/new?sourceType=pattern&topic=${encodeURIComponent(topic)}`);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Patterns</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={[typography.body, { color: color.textSecondary }]}>
          Trends we're noticing across your Daily Log, explained in plain language and backed by the actual numbers.
        </Text>

        {patterns.length === 0 ? (
          <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
            <AnimatedMascot size={90} motion="idle" />
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              Not enough logged yet to spot a real pattern. Keep logging in Daily Log and this page will start filling in.
            </Text>
          </View>
        ) : (
          patterns.map((pattern) => {
            const interp = interpretationFor(pattern.id);
            return (
              <PatternInsightCard
                key={pattern.id}
                pattern={pattern}
                interpretation={interp?.interpretation}
                suggestedLessonTopic={interp?.suggestedLessonTopic}
                loadingInterpretation={status === 'loading' && !interp}
                accentColor={color.accent}
                accentTint={color.accentTint}
                onGenerateLesson={generateLesson}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
