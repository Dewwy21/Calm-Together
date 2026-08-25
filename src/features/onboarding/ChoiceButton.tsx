import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { CheckIcon } from '../../components/icons';

interface ChoiceButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Large, touch-friendly option button shared by single- and multi-choice
// questions. A checkmark communicates "selected" clearly for both cases,
// whether that means "the" answer or "one of several".
export function ChoiceButton({ label, selected, onPress }: ChoiceButtonProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: selected ? color.primary : color.surface,
        borderWidth: 2,
        borderColor: selected ? color.primary : color.border,
      }}
    >
      <Text style={[typography.bodyEmphasis, { color: selected ? color.textOnPrimary : color.textPrimary, flex: 1 }]}>
        {label}
      </Text>
      {selected && (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: radii.pill,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon size={13} color={color.textOnPrimary} />
        </View>
      )}
    </Pressable>
  );
}
