import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { EventType } from './types';
import { SUBTYPE_OPTIONS } from './subtypeOptions';

interface SubtypeStepProps {
  eventType: EventType;
  value: string | null;
  onChange: (value: string | null) => void;
}

// Optional deeper categorization, skippable via Next without a selection.
export function SubtypeStep({ eventType, value, onChange }: SubtypeStepProps) {
  const { color, spacing, typography, radii } = useTheme();
  const options = SUBTYPE_OPTIONS[eventType];

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>Want to categorize it further?</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        Optional. This helps patterns show up more clearly over time.
      </Text>
      <View style={{ gap: spacing.md }}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(selected ? null : option.value)}
              style={{
                padding: spacing.lg,
                borderRadius: radii.lg,
                backgroundColor: selected ? color.primary : color.surface,
                borderWidth: 2,
                borderColor: selected ? color.primary : color.border,
                gap: 2,
              }}
            >
              <Text style={[typography.bodyEmphasis, { color: selected ? color.textOnPrimary : color.textPrimary }]}>
                {option.label}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: selected ? color.textOnPrimary : color.textSecondary, opacity: selected ? 0.9 : 1 },
                ]}
              >
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
