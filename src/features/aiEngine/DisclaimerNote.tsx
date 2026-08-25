import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { PROFESSIONAL_DISCLAIMER_TEXT } from './disclaimer';

// One shared, subtle rendering of the professional-disclaimer line, used
// everywhere the AI Conversation Engine flags a response as containing
// real advice or psychological guidance. Callers decide *when* to show it
// (see shouldShowDisclaimer) — this component just renders it consistently.
export function DisclaimerNote({ style }: { style?: StyleProp<TextStyle> }) {
  const { color, typography } = useTheme();
  return (
    <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }, style]}>
      {PROFESSIONAL_DISCLAIMER_TEXT}
    </Text>
  );
}
