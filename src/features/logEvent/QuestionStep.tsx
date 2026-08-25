import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../theme';

interface QuestionStepProps {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function QuestionStep({ title, placeholder, value, onChange }: QuestionStepProps) {
  const { color, spacing, typography, radii } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>{title}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={color.textSecondary}
        multiline
        style={{
          minHeight: 140,
          textAlignVertical: 'top',
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          color: color.textPrimary,
        }}
      />
    </View>
  );
}
