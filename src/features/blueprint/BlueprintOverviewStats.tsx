import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { BLUEPRINT_SECTION_KEYS, BlueprintSourceType, FamilyBlueprint } from './types';
import { blueprintCompletenessRatio, SOURCE_META } from './blueprintHelpers';

export function BlueprintOverviewStats({ blueprint }: { blueprint: FamilyBlueprint }) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  const completeness = blueprintCompletenessRatio(blueprint);
  const filledCount = Math.round(completeness * BLUEPRINT_SECTION_KEYS.length);

  const sourceCounts = {} as Record<BlueprintSourceType, number>;
  blueprint.recentlyUpdated.forEach((entry) => {
    sourceCounts[entry.sourceType] = (sourceCounts[entry.sourceType] ?? 0) + 1;
  });
  const sourceEntries = (Object.keys(sourceCounts) as BlueprintSourceType[])
    .map((key) => ({ key, count: sourceCounts[key] }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...sourceEntries.map((s) => s.count));
  const topSource = sourceEntries[0];

  return (
    <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }, shadows.card]}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.h3, { color: color.textPrimary }]}>How complete is this picture?</Text>
        <View style={{ height: 10, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ width: `${completeness * 100}%`, height: '100%', backgroundColor: color.primary }} />
        </View>
        <Text style={[typography.caption, { color: color.textSecondary }]}>
          {filledCount} of {BLUEPRINT_SECTION_KEYS.length} sections have insights so far — this fills in more with every interaction, not
          all at once.
        </Text>
      </View>

      {sourceEntries.length > 0 && (
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>Where recent insights came from</Text>
          <View style={{ gap: 6 }}>
            {sourceEntries.map(({ key, count }) => (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={[typography.caption, { color: color.textSecondary, width: 96 }]} numberOfLines={1}>
                  {SOURCE_META[key].label}
                </Text>
                <View style={{ flex: 1, height: 8, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
                  <View style={{ width: `${(count / maxCount) * 100}%`, height: '100%', backgroundColor: color.secondary }} />
                </View>
              </View>
            ))}
          </View>
          {topSource && (
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Most of what's been learned recently came from {SOURCE_META[topSource.key].label}.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
