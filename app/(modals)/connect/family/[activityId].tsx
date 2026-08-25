import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components/ui';
import { Mascot } from '../../../../src/components/Mascot';
import { useTheme } from '../../../../src/theme';
import { ConnectDetailHeader } from '../../../../src/features/connect/ConnectDetailHeader';
import { getFamilyActivityById } from '../../../../src/features/connect/familyActivitiesData';

export default function FamilyActivityDetailScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const activity = getFamilyActivityById(activityId);

  if (!activity) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Activity not found</Text>
        <Button label="Back to Family Activities" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <ConnectDetailHeader onClose={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl }}>
          <Mascot size={120} />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Nice.</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            Moments like this add up more than they feel like they do.
          </Text>
          <Button
            label="Log this as a Positive Moment"
            onPress={() => router.push('/(modals)/log-event?presetType=positiveMoment')}
          />
          <Button label="Done" variant="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <ConnectDetailHeader onClose={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <View style={{ gap: 4 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{activity.title}</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>{activity.description}</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>~{activity.estimatedMinutes} min</Text>
        </View>

        <Section theme={{ color, spacing, typography, radii }} label="What you'll need">
          {activity.materials.map((m, i) => (
            <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
              • {m}
            </Text>
          ))}
        </Section>

        <Section theme={{ color, spacing, typography, radii }} label="How to do it">
          {activity.instructions.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text style={[typography.bodyEmphasis, { color: color.primary }]}>{i + 1}.</Text>
              <Text style={[typography.body, { color: color.textPrimary, flex: 1 }]}>{step}</Text>
            </View>
          ))}
        </Section>

        <View style={{ backgroundColor: color.accentTint, borderRadius: radii.lg, padding: spacing.lg, gap: 4 }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>WHY IT HELPS</Text>
          <Text style={[typography.body, { color: color.textPrimary }]}>{activity.whyItHelps}</Text>
        </View>

        <Button label="We did this" onPress={() => setDone(true)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label,
  theme,
  children,
}: {
  label: string;
  theme: { color: ReturnType<typeof useTheme>['color']; spacing: ReturnType<typeof useTheme>['spacing']; typography: ReturnType<typeof useTheme>['typography']; radii: ReturnType<typeof useTheme>['radii'] };
  children: React.ReactNode;
}) {
  return (
    <View style={{ backgroundColor: theme.color.surface, borderRadius: theme.radii.lg, padding: theme.spacing.lg, gap: theme.spacing.xs }}>
      <Text style={[theme.typography.caption, { color: theme.color.textSecondary }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}
