import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../../components/icons';

interface QuickAccessCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  tint: string;
  onPress: () => void;
}

export function QuickAccessCard({ icon: Icon, label, tint, onPress }: QuickAccessCardProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.sm,
          minHeight: 96,
          justifyContent: 'center',
        },
        shadows.card,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radii.md,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={color.textPrimary} />
      </View>
      <Text style={[typography.caption, { color: color.textPrimary, textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
}
