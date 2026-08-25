import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const { color, spacing, typography, radii } = useTheme();
  const ratio = (step + 1) / totalSteps;

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ height: 8, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: color.primary }} />
      </View>
      <Text style={[typography.caption, { color: color.textSecondary }]}>
        Step {step + 1} of {totalSteps}
      </Text>
    </View>
  );
}
