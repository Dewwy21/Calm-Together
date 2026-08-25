import React from 'react';
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, textColor, style }: ButtonProps) {
  const { color, radii, spacing, typography } = useTheme();

  const backgrounds = {
    primary: color.primary,
    secondary: color.surfaceAlt,
    ghost: 'transparent',
  } as const;
  const textColors = {
    primary: color.textOnPrimary,
    secondary: color.textPrimary,
    ghost: color.primary,
  } as const;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: backgrounds[variant],
          paddingVertical: spacing.md,
          paddingHorizontal: spacing['2xl'],
          borderRadius: radii.md,
          alignItems: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[typography.label, { color: textColor ?? textColors[variant] }]}>{label}</Text>
    </Pressable>
  );
}
