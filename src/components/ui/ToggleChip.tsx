import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../icons';

interface ToggleChipProps {
  icon: React.ComponentType<IconProps>;
  activeLabel: string;
  inactiveLabel: string;
  active: boolean;
  onPress: () => void;
}

export function ToggleChip({ icon: Icon, activeLabel, inactiveLabel, active, onPress }: ToggleChipProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        alignSelf: 'flex-start',
        backgroundColor: active ? color.primaryTint : color.surfaceAlt,
        borderRadius: radii.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <Icon size={16} color={active ? color.primary : color.textSecondary} />
      <Text style={[typography.caption, { color: active ? color.primary : color.textSecondary }]}>
        {active ? activeLabel : inactiveLabel}
      </Text>
    </Pressable>
  );
}
