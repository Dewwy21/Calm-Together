import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { IconBubble } from '../../components/ui';
import { BlueprintInsight, BlueprintSectionKey } from './types';
import { SECTION_META } from './blueprintHelpers';

export function BlueprintSectionCard({ sectionKey, insights }: { sectionKey: BlueprintSectionKey; insights: BlueprintInsight[] }) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const meta = SECTION_META[sectionKey];

  return (
    <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <IconBubble icon={meta.icon} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>{meta.label}</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>{meta.description}</Text>
        </View>
      </View>

      {insights.length === 0 ? (
        <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>Nothing here yet.</Text>
      ) : (
        <View style={{ gap: 6 }}>
          {insights.map((insight) => (
            <View key={insight.id} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={[typography.bodySmall, { color: color.textPrimary }]}>•</Text>
              <Text style={[typography.bodySmall, { color: color.textPrimary, flex: 1 }]}>{insight.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
