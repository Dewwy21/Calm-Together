import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { TrophyIcon } from '../../src/components/icons';
import { useGrowthTimeline } from '../../src/features/growth/useGrowthTimeline';
import { GrowthDimensionCard } from '../../src/features/growth/GrowthDimensionCard';

export default function GrowthTimelineScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { dimensions, encouragement, encouragementStatus } = useGrowthTimeline();

  const improvingDimensions = dimensions?.filter((d) => d.trend === 'improving') ?? [];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>Growth Timeline</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Your growth, not just theirs.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.sm }}>
        {dimensions === null ? (
          <Text style={[typography.body, { color: color.textSecondary }]}>Loading...</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Mascot size={44} />
              <View style={[{ flex: 1, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md, gap: 4 }, shadows.card]}>
                {encouragementStatus === 'loading' ? (
                  <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>Looking back over the last few weeks...</Text>
                ) : encouragement ? (
                  <>
                    <Text style={[typography.body, { color: color.textPrimary }]}>{encouragement.message}</Text>
                    {encouragement.strategyReminder && (
                      <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>
                        Remember: {encouragement.strategyReminder}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
                    Keep logging and completing lessons — this space will start reflecting your own progress back to you.
                  </Text>
                )}
              </View>
            </View>

            {improvingDimensions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {improvingDimensions.map((d) => (
                  <View
                    key={d.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: color.secondaryTint,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                    }}
                  >
                    <TrophyIcon size={14} color={color.secondary} />
                    <Text style={[typography.caption, { color: color.secondary }]}>{d.label} is trending up</Text>
                  </View>
                ))}
              </View>
            )}

            {dimensions.map((dimension) => (
              <GrowthDimensionCard key={dimension.id} dimension={dimension} />
            ))}

            <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg }]}>
              These are estimates based on your own app activity, not a clinical measurement. Progress in this work is gradual —
              small ups and downs week to week are completely normal.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
