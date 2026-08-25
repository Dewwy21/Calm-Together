import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { PencilIcon, ArrowRightIcon } from '../../components/icons';

interface PrimaryLogButtonProps {
  onPress: () => void;
}

// The single most visually prominent element on Den: bigger padding, a
// raised shadow, and a bolder label than any other button in the app.
export function PrimaryLogButton({ onPress }: PrimaryLogButtonProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: color.primary,
          borderRadius: radii.xl,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xl,
          opacity: pressed ? 0.92 : 1,
        },
        shadows.raised,
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.md,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PencilIcon size={22} color={color.textOnPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.h2, { color: color.textOnPrimary }]}>Log Today's Experience</Text>
        <Text style={[typography.bodySmall, { color: color.textOnPrimary, opacity: 0.85 }]}>
          Takes about a minute
        </Text>
      </View>
      <ArrowRightIcon size={22} color={color.textOnPrimary} />
    </Pressable>
  );
}
