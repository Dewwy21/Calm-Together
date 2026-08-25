import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { CloseButton } from '../../components/ui';

interface ConnectListHeaderProps {
  title: string;
  onClose: () => void;
}

// Shared header for every Connect list/hub screen: title left, close
// right, identical padding everywhere so the gap to the content below
// never varies from screen to screen.
export function ConnectListHeader({ title, onClose }: ConnectListHeaderProps) {
  const { color, spacing, typography } = useTheme();
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
      <Text style={[typography.h1, { color: color.textPrimary }]}>{title}</Text>
      <CloseButton onPress={onClose} />
    </View>
  );
}
