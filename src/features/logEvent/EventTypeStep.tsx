import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { EventType, EVENT_TYPE_OPTIONS } from './types';
import { CheckIcon } from '../../components/icons';
import { eventTypeTint } from './eventTypeStyle';

interface EventTypeStepProps {
  value: EventType | null;
  onChange: (type: EventType) => void;
}

export function EventTypeStep({ value, onChange }: EventTypeStepProps) {
  const theme = useTheme();
  const { color, spacing, typography, radii } = theme;

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>What are you logging?</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        Pick the option that best fits this moment.
      </Text>
      <View style={{ gap: spacing.md }}>
        {EVENT_TYPE_OPTIONS.map((option) => {
          const selected = value === option.type;
          const Icon = option.icon;
          return (
            <Pressable
              key={option.type}
              onPress={() => onChange(option.type)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                padding: spacing.xl,
                borderRadius: radii.xl,
                backgroundColor: selected ? color.primary : color.surface,
                borderWidth: 2,
                borderColor: selected ? color.primary : color.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? 'rgba(255,255,255,0.25)' : eventTypeTint(theme, option.type),
                }}
              >
                <Icon size={24} color={selected ? color.textOnPrimary : color.textPrimary} />
              </View>
              <Text
                style={[
                  typography.h3,
                  { color: selected ? color.textOnPrimary : color.textPrimary, flex: 1 },
                ]}
              >
                {option.label}
              </Text>
              {selected && <CheckIcon size={20} color={color.textOnPrimary} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
