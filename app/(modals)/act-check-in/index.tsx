import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton, IconBubble } from '../../../src/components/ui';
import { ACT_CATEGORIES, getScenariosForCategory } from '../../../src/features/actCheckIn/actContent';

export default function ActCheckInSelectionScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>ACT Parenting Check-In</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            A guided pause for a specific hard moment — starting with you, not your child.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingTop: spacing.sm }}>
        <Text style={[typography.body, { color: color.textSecondary }]}>
          Which of these feels closest to what's going on right now?
        </Text>

        {ACT_CATEGORIES.map((category) => {
          const scenarios = getScenariosForCategory(category.id);
          const isExpanded = expandedId === category.id;

          return (
            <View key={category.id} style={[{ backgroundColor: color.surface, borderRadius: radii.lg, overflow: 'hidden' }, shadows.card]}>
              <Pressable
                onPress={() => setExpandedId(isExpanded ? null : category.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}
              >
                <IconBubble icon={category.icon} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: color.textPrimary }]}>{category.title}</Text>
                  {!!category.tagline && (
                    <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={isExpanded ? undefined : 1}>
                      {category.tagline}
                    </Text>
                  )}
                </View>
              </Pressable>

              {isExpanded && (
                <View style={{ padding: spacing.md, paddingTop: 0, gap: spacing.md }}>
                  {category.commonParentThoughts.length > 0 && (
                    <View style={{ gap: 4 }}>
                      <Text style={[typography.caption, { color: color.textSecondary }]}>YOU MIGHT BE THINKING</Text>
                      {category.commonParentThoughts.map((thought, i) => (
                        <Text key={i} style={[typography.bodySmall, { color: color.textPrimary, fontStyle: 'italic' }]}>
                          "{thought}"
                        </Text>
                      ))}
                    </View>
                  )}

                  {scenarios.length > 0 ? (
                    scenarios.map((scenario) => (
                      <Button
                        key={scenario.id}
                        label={`Begin: ${scenario.title}`}
                        onPress={() => router.push(`/(modals)/act-check-in/${scenario.id}`)}
                      />
                    ))
                  ) : (
                    <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
                      A guided check-in for this category is coming soon.
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
