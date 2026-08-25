import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTheme } from '../../theme';
import { StarIcon } from '../../components/icons';
import { Exercise } from './types';

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

export function ExerciseCard({ exercise, isFavorite, onToggleFavorite, onPress }: ExerciseCardProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          gap: spacing.md,
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          padding: spacing.sm,
          alignItems: 'center',
        },
        shadows.card,
      ]}
    >
      <Image source={exercise.image} style={{ width: 72, height: 72, borderRadius: radii.md }} resizeMode="cover" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.h3, { color: color.textPrimary }]}>{exercise.title}</Text>
        <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
          {exercise.description}
        </Text>
        <Text style={[typography.caption, { color: color.textSecondary }]}>~{exercise.estimatedMinutes} min</Text>
      </View>
      <Pressable onPress={onToggleFavorite} hitSlop={10} style={{ padding: spacing.xs }}>
        <StarIcon size={20} color={isFavorite ? color.accent : color.border} />
      </Pressable>
    </Pressable>
  );
}
