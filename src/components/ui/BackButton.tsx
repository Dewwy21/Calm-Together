import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme';
import { ChevronLeftIcon } from '../icons';

interface BackButtonProps {
  onPress: () => void;
  /** use on a photo/dark backdrop */
  onDark?: boolean;
  label?: string;
}

// Consistent "go back one level" affordance, top-left, for screens nested
// inside a flow (log detail from Past Logs, an exercise from Calm Corner).
export function BackButton({ onPress, onDark = false, label = 'Back' }: BackButtonProps) {
  const { color, radii, spacing, typography } = useTheme();
  const tint = onDark ? '#fff' : color.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.pill,
        backgroundColor: onDark ? 'rgba(0,0,0,0.25)' : 'transparent',
      }}
    >
      <ChevronLeftIcon size={20} color={tint} />
      <Text style={[typography.bodyEmphasis, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}
