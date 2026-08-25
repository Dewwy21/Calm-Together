import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components/ui';
import { Mascot } from '../../../../src/components/Mascot';
import { useTheme } from '../../../../src/theme';
import { ConnectDetailHeader } from '../../../../src/features/connect/ConnectDetailHeader';
import { getRechargeActivityById } from '../../../../src/features/connect/rechargeData';

export default function RechargeDetailScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const activity = getRechargeActivityById(activityId);

  if (!activity) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Activity not found</Text>
        <Button label="Back to Caregiver Recharge" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <ConnectDetailHeader onClose={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl }}>
          <Mascot size={120} />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Good.</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            Taking care of yourself isn't separate from taking care of them.
          </Text>
          <Button label="Return Home" onPress={() => router.replace('/den')} />
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

        <View style={{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: 4 }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>TIP</Text>
          <Text style={[typography.body, { color: color.textPrimary }]}>{activity.tip}</Text>
        </View>

        <Button label="I did this" onPress={() => setDone(true)} />
      </ScrollView>
    </SafeAreaView>
  );
}
