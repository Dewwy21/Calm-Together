import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';

interface DailyStressStepProps {
  value: number | null;
  onChange: (value: number) => void;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7];

// The Single-Item Daily Parenting Stress Measure — a discrete 1-7 tap
// scale (not a slider) specifically so "not answered yet" is a real state
// the wizard can gate Save on, rather than a slider always resting on some
// default value.
export function DailyStressStep({ value, onChange }: DailyStressStepProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>
        Overall, how stressful were your parenting experiences with your child today?
      </Text>

      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {SCALE.map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: radii.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? color.primary : color.surface,
                borderWidth: 2,
                borderColor: selected ? color.primary : color.border,
              }}
            >
              <Text style={[typography.bodyEmphasis, { color: selected ? color.textOnPrimary : color.textPrimary }]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[typography.caption, { color: color.textSecondary }]}>1 · Not stressful</Text>
        <Text style={[typography.caption, { color: color.textSecondary }]}>7 · Extremely stressful</Text>
      </View>
    </View>
  );
}
