import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton, Card } from '../../../src/components/ui';
import { SECTIONS } from '../../../src/features/onboarding/sections';
import { resolveAnswerText } from '../../../src/features/onboarding/resolveAnswerText';
import { QUESTIONS } from '../../../src/features/onboarding/questions';
import { useBaselineAssessmentContext } from '../../../src/features/baselineAssessment/BaselineAssessmentProvider';
import { computePssScore, computePaqSubscales } from '../../../src/features/baselineAssessment/scoring';
import { BaselinePssScoreCard } from '../../../src/features/baselineAssessment/BaselinePssScoreCard';
import { BaselineRadarChart } from '../../../src/features/baselineAssessment/BaselineRadarChart';
import { CHECKPOINT_LABELS, resolveTimepoint } from '../../../src/features/baselineAssessment/checkpoints';

export default function AssessmentDetailScreen() {
  const { id, justCompleted } = useLocalSearchParams<{ id: string; justCompleted?: string }>();
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
  const pssScore = computePssScore(record.answers);
  const paqSubscales = computePaqSubscales(record.answers);
  const checkpointLabel = CHECKPOINT_LABELS[resolveTimepoint(record)];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        {!justCompleted && <BackButton onPress={() => router.back()} />}
        <View style={{ marginLeft: justCompleted ? 0 : spacing.sm }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>
            {justCompleted ? 'Your Results' : checkpointLabel}
          </Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            {completedAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
            {completedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {(pssScore || paqSubscales) && (
          <View style={{ gap: spacing.md }}>
            <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>YOUR RESULTS</Text>
            {pssScore && <BaselinePssScoreCard score={pssScore} />}
            {paqSubscales && (
              <Card>
                <Text style={[typography.h3, { color: color.textPrimary }]}>Psychological Flexibility (6-PAQ)</Text>
                <Text style={[typography.caption, { color: color.textSecondary, marginTop: 2 }]}>
                  Six areas of parental psychological flexibility, by subscale.
                </Text>
                <BaselineRadarChart subscales={paqSubscales} />
              </Card>
            )}
          </View>
        )}
        {!pssScore && !paqSubscales && (
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            This attempt doesn't have enough answered questions in Sections 4-5 to calculate a score.
          </Text>
        )}

        <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>YOUR ANSWERS</Text>

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

      {justCompleted && (
        <View style={{ padding: spacing.lg }}>
          <Button label="Continue to Your Den" onPress={() => router.replace('/den')} />
        </View>
      )}
    </SafeAreaView>
  );
}
