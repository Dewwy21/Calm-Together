import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Mascot } from '../../components/Mascot';
import { Card } from '../../components/ui';

// Front matter reproduced from the source document ("Calm Together —
// Parent Baseline Questionnaire / Pre-Intervention Assessment"): Purpose,
// Confidentiality, and Estimated completion time. "Parent name" and "Date
// completed" are paper-form fields the app already has real data for (the
// signed-in account, the record's own timestamp) and are filled in
// automatically rather than asked here.
export function OnboardingWelcome() {
  const { color, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
      <Mascot size={110} />
      <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>Baseline Assessment</Text>
      <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>
        Pre-Intervention Assessment
      </Text>

      <Card style={{ gap: spacing.md, width: '100%' }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Purpose</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            This questionnaire collects your baseline scores before you begin using the app. The same questionnaire will be
            completed again after the intervention period. The difference between your scores will be used to measure whether
            the app improved parenting stress and psychological flexibility.
          </Text>
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Confidentiality</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            Your responses are confidential and will be used only for research purposes and to personalize your experience
            with the app.
          </Text>
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Estimated completion time</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>10–15 minutes</Text>
        </View>
      </Card>
    </View>
  );
}
