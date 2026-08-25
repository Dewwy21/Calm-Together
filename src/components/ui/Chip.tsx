import React from 'react';
import { Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  const { color, spacing, typography, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.pill,
        backgroundColor: active ? color.primary : color.surfaceAlt,
      }}
    >
      <Text style={[typography.bodyEmphasis, { color: active ? color.textOnPrimary : color.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}
