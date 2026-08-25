import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { CloseButton } from '../../components/ui';
import { AnimatedMascot } from '../../components/Mascot';

interface ConnectDetailHeaderProps {
  onClose: () => void;
}

// Shared header for every Connect detail screen (a single activity or
// episode): small mascot left, close right. The title lives in the
// scrollable content below, not here, so this row's height never changes.
export function ConnectDetailHeader({ onClose }: ConnectDetailHeaderProps) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      <AnimatedMascot size={36} motion="idle" />
      <CloseButton onPress={onClose} />
    </View>
  );
}
