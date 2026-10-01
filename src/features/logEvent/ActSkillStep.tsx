import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { ChoiceButton } from '../onboarding/ChoiceButton';
import { ACT_SKILL_OPTIONS, ActSkillId } from './actSkillOptions';

interface ActSkillStepProps {
  value: ActSkillId[];
  onChange: (value: ActSkillId[]) => void;
}

// Multi-select, but "None Today" is mutually exclusive with every real
// skill — picking it clears the rest, and picking any real skill clears it,
// since "none" and "some" can't both be true at once even though the field
// itself is a list.
export function ActSkillStep({ value, onChange }: ActSkillStepProps) {
  const { color, spacing, typography } = useTheme();

  function toggle(id: ActSkillId) {
    if (id === 'noneToday') {
      onChange(value.includes('noneToday') ? [] : ['noneToday']);
      return;
    }
    const withoutNone = value.filter((v) => v !== 'noneToday');
    onChange(withoutNone.includes(id) ? withoutNone.filter((v) => v !== id) : [...withoutNone, id]);
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>Did you use a skill today?</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>Pick as many as fit — or none at all.</Text>
      <View style={{ gap: spacing.sm }}>
        {ACT_SKILL_OPTIONS.map((option) => (
          <ChoiceButton key={option.id} label={option.label} selected={value.includes(option.id)} onPress={() => toggle(option.id)} />
        ))}
      </View>
    </View>
  );
}
