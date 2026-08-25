import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { BlueprintInsight } from './types';

export function TriggersHelpsMap({ triggers, helps }: { triggers: BlueprintInsight[]; helps: BlueprintInsight[] }) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  if (triggers.length === 0 && helps.length === 0) return null;

  return (
    <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
      <Text style={[typography.h3, { color: color.textPrimary }]}>Triggers and what helps</Text>
      <Text style={[typography.caption, { color: color.textSecondary }]}>
        What tends to set things off, side by side with what's actually worked in response.
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
        <View style={{ flex: 1, backgroundColor: color.warning + '22', borderRadius: radii.md, padding: spacing.md, gap: 6 }}>
          <Text style={[typography.caption, { color: color.warning }]}>TRIGGERS</Text>
          {triggers.length === 0 ? (
            <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>None noted yet.</Text>
          ) : (
            triggers.map((t) => (
              <Text key={t.id} style={[typography.bodySmall, { color: color.textPrimary }]}>
                {t.text}
              </Text>
            ))
          )}
        </View>
        <View style={{ flex: 1, backgroundColor: color.secondaryTint, borderRadius: radii.md, padding: spacing.md, gap: 6 }}>
          <Text style={[typography.caption, { color: color.secondary }]}>WHAT HELPS</Text>
          {helps.length === 0 ? (
            <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>None noted yet.</Text>
          ) : (
            helps.map((h) => (
              <Text key={h.id} style={[typography.bodySmall, { color: color.textPrimary }]}>
                {h.text}
              </Text>
            ))
          )}
        </View>
      </View>
    </View>
  );
}
