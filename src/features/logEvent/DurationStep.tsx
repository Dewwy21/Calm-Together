import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { Chip } from '../../components/ui';

interface DurationStepProps {
  value: string;
  onChange: (value: string) => void;
}

const QUICK_OPTIONS = ['Under 5 min', '5-15 min', '15-30 min', '30+ min'];

export function DurationStep({ value, onChange }: DurationStepProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>About how long did it last?</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {QUICK_OPTIONS.map((option) => (
          <Chip key={option} label={option} active={value === option} onPress={() => onChange(option)} />
        ))}
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Or type your own, e.g. about 10 minutes"
        placeholderTextColor={color.textSecondary}
        style={{
          backgroundColor: color.surfaceAlt,
          borderRadius: radii.md,
          padding: spacing.md,
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          color: color.textPrimary,
        }}
      />
    </View>
  );
}
