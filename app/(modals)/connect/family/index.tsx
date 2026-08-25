import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { ConnectListHeader } from '../../../../src/features/connect/ConnectListHeader';
import { ConnectMascotBubble } from '../../../../src/features/connect/ConnectMascotBubble';
import { ActivityCard } from '../../../../src/features/connect/ActivityCard';
import { FAMILY_ACTIVITIES } from '../../../../src/features/connect/familyActivitiesData';

export default function FamilyActivitiesScreen() {
  const { color, spacing } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <ConnectListHeader title="Family Activities" onClose={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <ConnectMascotBubble text="None of these need to go perfectly. Showing up for them is the whole point." />

        <View style={{ gap: spacing.md }}>
          {FAMILY_ACTIVITIES.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onPress={() => router.push(`/(modals)/connect/family/${activity.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
