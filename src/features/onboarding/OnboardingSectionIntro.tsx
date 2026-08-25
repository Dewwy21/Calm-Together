import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Mascot } from '../../components/Mascot';
import { Card } from '../../components/ui';
import { OnboardingSection } from './types';

interface OnboardingSectionIntroProps {
  section: OnboardingSection;
}

// Shown once before each of the assessment's 5 sections — carries the
// source document's own section title and any section-level
// instructions/citation (Sections 4 and 5 have both; earlier sections just
// have a title). Doubles as pacing/breathing room in the flow.
export function OnboardingSectionIntro({ section }: OnboardingSectionIntroProps) {
  const { color, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, gap: spacing.xl, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Mascot size={90} />
        <Text style={[typography.label, { color: color.primary, letterSpacing: 1 }]}>
          SECTION {section.sectionNumber} OF {section.totalSections}
        </Text>
        <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>{section.title}</Text>
      </View>

      {(section.intro || section.sourceAttribution) && (
        <Card style={{ gap: spacing.sm }}>
          {section.intro && <Text style={[typography.body, { color: color.textPrimary }]}>{section.intro}</Text>}
          {section.sourceAttribution && (
            <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>
              {section.sourceAttribution}
            </Text>
          )}
        </Card>
      )}
    </View>
  );
}
