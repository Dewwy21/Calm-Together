import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hero';
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

// `hero` is just a larger radius for prominent feature cards. Both variants
// stay uniformly rounded, consistent corner treatment reads as a coherent
// product rather than a scrapbook of shapes.
export function Card({ children, variant = 'default', backgroundColor, style }: CardProps) {
  const { color, radii, spacing, shadows } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor ?? color.surface,
          padding: spacing.xl,
          borderRadius: variant === 'hero' ? radii.xl : radii.lg,
          ...shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
