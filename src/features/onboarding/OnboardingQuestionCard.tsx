import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { ChoiceButton } from './ChoiceButton';
import { OnboardingQuestion } from './types';

const OTHER_VALUE = '__other__';

interface OnboardingQuestionCardProps {
  question: OnboardingQuestion;
  value: string | string[] | undefined;
  otherText: string;
  followUpNote: string;
  onChangeValue: (value: string | string[]) => void;
  onChangeOtherText: (text: string) => void;
  onChangeFollowUpNote: (text: string) => void;
}

export function OnboardingQuestionCard({
  question,
  value,
  otherText,
  followUpNote,
  onChangeValue,
  onChangeOtherText,
  onChangeFollowUpNote,
}: OnboardingQuestionCardProps) {
  const { color, spacing, typography, radii } = useTheme();
  const isMulti = question.type === 'multi';
  const selectedValues = isMulti ? ((value as string[]) ?? []) : value ? [value as string] : [];
  const atMaxSelections = isMulti && !!question.maxSelections && selectedValues.length >= question.maxSelections;

  function toggle(optionValue: string) {
    if (isMulti) {
      const current = (value as string[]) ?? [];
      if (current.includes(optionValue)) {
        onChangeValue(current.filter((v) => v !== optionValue));
        return;
      }
      if (question.maxSelections && current.length >= question.maxSelections) return;
      onChangeValue([...current, optionValue]);
    } else {
      onChangeValue(optionValue);
    }
  }

  const otherSelected = selectedValues.includes(OTHER_VALUE);
  const otherBlockedByMax = isMulti && !otherSelected && atMaxSelections;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>{question.prompt}</Text>
        {question.helperText && (
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{question.helperText}</Text>
        )}
        {question.maxSelections && (
          <Text style={[typography.caption, { color: atMaxSelections ? color.primary : color.textSecondary }]}>
            {atMaxSelections ? `You've selected ${question.maxSelections}` : `Select up to ${question.maxSelections}`}
          </Text>
        )}
      </View>

      {(question.type === 'single' || question.type === 'multi') && (
        <View style={{ gap: spacing.sm }}>
          {question.options.map((option) => {
            const selected = selectedValues.includes(option.value);
            const blocked = isMulti && !selected && atMaxSelections;
            return (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={selected}
                onPress={() => !blocked && toggle(option.value)}
              />
            );
          })}
          {question.allowOther && (
            <ChoiceButton label="Other" selected={otherSelected} onPress={() => !otherBlockedByMax && toggle(OTHER_VALUE)} />
          )}
        </View>
      )}

      {(question.type === 'shortText' || question.type === 'longText') && (
        <TextInput
          value={(value as string) ?? ''}
          onChangeText={onChangeValue}
          placeholder={question.placeholder}
          placeholderTextColor={color.textSecondary}
          multiline={question.type === 'longText'}
          style={{
            minHeight: question.type === 'longText' ? 140 : undefined,
            textAlignVertical: question.type === 'longText' ? 'top' : 'center',
            backgroundColor: color.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: color.textPrimary,
          }}
        />
      )}

      {question.allowOther && otherSelected && (
        <TextInput
          value={otherText}
          onChangeText={onChangeOtherText}
          placeholder="Tell me a bit more..."
          placeholderTextColor={color.textSecondary}
          style={{
            backgroundColor: color.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: color.textPrimary,
          }}
        />
      )}

      {question.followUpText && (
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{question.followUpText.helperText}</Text>
          <TextInput
            value={followUpNote}
            onChangeText={onChangeFollowUpNote}
            placeholder={question.followUpText.placeholder}
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              minHeight: 70,
              textAlignVertical: 'top',
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>
      )}
    </View>
  );
}

export { OTHER_VALUE };
