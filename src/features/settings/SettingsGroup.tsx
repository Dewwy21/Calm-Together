import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';

interface SettingsGroupProps {
  children: React.ReactNode;
}

// Apple-Settings-style grouped card: rows stacked with a thin divider
// between them, no divider after the last row.
export function SettingsGroup({ children }: SettingsGroupProps) {
  const { color, spacing, radii, shadows } = useTheme();
  const rows = React.Children.toArray(children);

  return (
    <View
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          overflow: 'hidden',
        },
        shadows.card,
      ]}
    >
      {rows.map((row, i) => (
        <View key={i}>
          {row}
          {i < rows.length - 1 && (
            <View style={{ height: 1, backgroundColor: color.border, marginLeft: spacing.lg + 36 + spacing.md }} />
          )}
        </View>
      ))}
    </View>
  );
}
