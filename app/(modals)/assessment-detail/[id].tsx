import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton } from '../../../src/components/ui';
import { SECTIONS } from '../../../src/features/onboarding/sections';
import { resolveAnswerText } from '../../../src/features/onboarding/resolveAnswerText';
import { QUESTIONS } from '../../../src/features/onboarding/questions';
import { useBaselineAssessmentContext } from '../../../src/features/baselineAssessment/BaselineAssessmentProvider';

export default function AssessmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { assessments } = useBaselineAssessmentContext();

  const record = assessments.find((a) => a.id === id);

  if (!record) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Attempt not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const completedAt = new Date(record.completedAtISO);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>Baseline Assessment</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            {completedAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
            {completedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {SECTIONS.map((section) => {
          const rows = section.questionIds
            .map((questionId) => ({ questionId, text: resolveAnswerText(record.answers, questionId) }))
            .filter((r) => r.text !== null);
          if (rows.length === 0) return null;

          return (
            <View key={section.id} style={{ gap: spacing.sm }}>
              <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>
                SECTION {section.sectionNumber} — {section.title.toUpperCase()}
              </Text>
              <View style={{ gap: spacing.sm }}>
                {rows.map(({ questionId, text }) => {
                  const question = QUESTIONS.find((q) => q.id === questionId)!;
                  return (
                    <View
                      key={questionId}
                      style={[
                        { backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md, gap: 2 },
                        shadows.card,
                      ]}
                    >
                      <Text style={[typography.caption, { color: color.textSecondary }]}>{question.prompt}</Text>
                      <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
