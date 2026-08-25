import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
interface ActivityCardProps {
  activity: { title: string; description: string; estimatedMinutes: number };
  onPress: () => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          gap: spacing.xs,
        },
        shadows.card,
      ]}
    >
      <Text style={[typography.h3, { color: color.textPrimary }]}>{activity.title}</Text>
      <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{activity.description}</Text>
      <Text style={[typography.caption, { color: color.textSecondary }]}>~{activity.estimatedMinutes} min</Text>
    </Pressable>
  );
}
