import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { CloseButton, IconBubble } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { ChartIcon } from '../../src/components/icons';
import { useBaselineAssessmentContext } from '../../src/features/baselineAssessment/BaselineAssessmentProvider';

export default function AssessmentHistoryScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { assessments } = useBaselineAssessmentContext();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <Text style={[typography.h1, { color: color.textPrimary }]}>Assessment History</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      {assessments.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }}>
          <Mascot size={100} />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>No attempts yet</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            Every time you complete the Baseline Assessment, it's saved here as its own dated record — nothing is ever
            overwritten.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          {assessments.map((record, index) => {
            const completedAt = new Date(record.completedAtISO);
            const isFirst = index === assessments.length - 1;
            return (
              <Pressable
                key={record.id}
                onPress={() => router.push(`/(modals)/assessment-detail/${record.id}`)}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    backgroundColor: color.surface,
                    borderRadius: radii.lg,
                    padding: spacing.md,
                  },
                  shadows.card,
                ]}
              >
                <IconBubble icon={ChartIcon} color={color.primaryTint} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>
                    {completedAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    {completedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    {isFirst ? ' · First attempt' : ''}
                    {record.completedByName ? ` · ${record.completedByName}` : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
