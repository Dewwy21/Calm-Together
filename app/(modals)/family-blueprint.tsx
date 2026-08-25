import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { useBlueprintContext } from '../../src/features/blueprint/BlueprintProvider';
import { BLUEPRINT_SECTION_KEYS } from '../../src/features/blueprint/types';
import { BlueprintOverviewStats } from '../../src/features/blueprint/BlueprintOverviewStats';
import { RecentlyUpdatedTimeline } from '../../src/features/blueprint/RecentlyUpdatedTimeline';
import { TriggersHelpsMap } from '../../src/features/blueprint/TriggersHelpsMap';
import { BlueprintSectionCard } from '../../src/features/blueprint/BlueprintSectionCard';

export default function FamilyBlueprintScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { blueprint, loaded } = useBlueprintContext();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>Family Blueprint</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Everything the AI has learned about your family.</Text>
        </View>
      </View>

      {!loaded ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[typography.body, { color: color.textSecondary }]}>Loading...</Text>
        </View>
      ) : !blueprint ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            Your Blueprint starts building itself right after onboarding, then grows with every log, conversation, and lesson. Nothing
            here yet for this child.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.sm }}>
          <BlueprintOverviewStats blueprint={blueprint} />

          <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>Recently Updated</Text>
            <RecentlyUpdatedTimeline entries={blueprint.recentlyUpdated.slice(0, 8)} />
          </View>

          <TriggersHelpsMap triggers={blueprint.commonTriggers} helps={blueprint.whatUsuallyHelps} />

          {BLUEPRINT_SECTION_KEYS.filter((key) => key !== 'commonTriggers' && key !== 'whatUsuallyHelps').map((key) => (
            <BlueprintSectionCard key={key} sectionKey={key} insights={blueprint[key]} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
