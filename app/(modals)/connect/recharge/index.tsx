import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { ConnectListHeader } from '../../../../src/features/connect/ConnectListHeader';
import { ConnectMascotBubble } from '../../../../src/features/connect/ConnectMascotBubble';
import { ActivityCard } from '../../../../src/features/connect/ActivityCard';
import { RECHARGE_ACTIVITIES } from '../../../../src/features/connect/rechargeData';

export default function RechargeScreen() {
  const { color, spacing } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <ConnectListHeader title="Caregiver Recharge" onClose={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <ConnectMascotBubble text="This one's just for you. You're allowed to take it." />

        <View style={{ gap: spacing.md }}>
          {RECHARGE_ACTIVITIES.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onPress={() => router.push(`/(modals)/connect/recharge/${activity.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
