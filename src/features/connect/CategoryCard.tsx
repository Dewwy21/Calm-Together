import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../../components/icons';

interface CategoryCardProps {
  icon: React.ComponentType<IconProps>;
  title: string;
  description: string;
  tint: string;
  onPress: () => void;
}

const TITLE_FONT_SIZE = 15.5;
const TITLE_LINE_HEIGHT = 20;
const DESCRIPTION_LINE_HEIGHT = 18;

// The four large hub cards on the Connect tab. Every card shares identical
// dimensions: a fixed width (set by the parent grid) and a fixed height,
// built from fixed-height title/description slots reserved for exactly two
// lines each. A short title and a long title occupy the same footprint, so
// no card ever ends up taller, narrower, or more cramped than its
// neighbors.
export function CategoryCard({ icon: Icon, title, description, tint, onPress }: CategoryCardProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: '48%',
          alignItems: 'center',
          backgroundColor: color.surface,
          borderRadius: radii.xl,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.sm,
        },
        shadows.card,
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.md,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Icon size={24} color={color.textPrimary} />
      </View>
      <Text
        numberOfLines={2}
        style={[
          typography.h3,
          {
            color: color.textPrimary,
            textAlign: 'center',
            fontSize: TITLE_FONT_SIZE,
            lineHeight: TITLE_LINE_HEIGHT,
            height: TITLE_LINE_HEIGHT * 2,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        numberOfLines={2}
        style={[
          typography.caption,
          {
            color: color.textSecondary,
            textAlign: 'center',
            marginTop: 4,
            lineHeight: DESCRIPTION_LINE_HEIGHT,
            height: DESCRIPTION_LINE_HEIGHT * 2,
          },
        ]}
      >
        {description}
      </Text>
    </Pressable>
  );
}
