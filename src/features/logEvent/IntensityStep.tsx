import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme';

interface IntensityStepProps {
  value: number;
  onChange: (value: number) => void;
}

const LABELS: Record<number, string> = {
  1: 'Barely noticeable',
  3: 'Mild',
  5: 'Moderate',
  7: 'Strong',
  10: 'Overwhelming',
};

export function IntensityStep({ value, onChange }: IntensityStepProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>How intense was it?</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        A rough sense is enough. 1 is barely noticeable, 10 is overwhelming.
      </Text>

      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: radii.pill,
            backgroundColor: color.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.display, { color: color.textOnPrimary, fontSize: 32 }]}>{value}</Text>
        </View>

        <Slider
          style={{ width: '100%', height: 48 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={color.primary}
          maximumTrackTintColor={color.surfaceAlt}
          thumbTintColor={color.primary}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>1</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>10</Text>
        </View>

        {LABELS[value] && (
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{LABELS[value]}</Text>
        )}
      </View>
    </View>
  );
}
