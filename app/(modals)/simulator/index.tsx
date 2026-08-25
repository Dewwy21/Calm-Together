import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton } from '../../../src/components/ui';
import { AnimatedMascot } from '../../../src/components/Mascot';
import { SIMULATOR_SCENARIOS } from '../../../src/features/simulator/simulatorScenarios';
import { SimulatorScenario } from '../../../src/features/simulator/types';

const INTENSITY_LABELS: Record<number, string> = {
  1: 'Mildly reluctant',
  3: 'A little pushback',
  5: 'Moderate resistance',
  7: 'Escalated, upset',
  10: 'Full meltdown',
};

export default function SimulatorPickerScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<SimulatorScenario | null>(null);
  const [intensity, setIntensity] = useState(6);

  function selectScenario(scenario: SimulatorScenario) {
    setSelected(scenario);
    setIntensity(scenario.defaultIntensity);
  }

  function start() {
    if (!selected) return;
    router.push(`/(modals)/simulator/session?scenarioId=${selected.id}&intensity=${intensity}`);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => (selected ? setSelected(null) : router.back())} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Practice a Conversation</Text>
      </View>

      {!selected ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <AnimatedMascot size={56} motion="idle" />
            <Text style={[typography.body, { color: color.textSecondary, flex: 1 }]}>
              Try a tough conversation with an AI child first, so the real one goes a little easier. Pick a scenario to start.
            </Text>
          </View>

          {SIMULATOR_SCENARIOS.map((scenario) => (
            <Pressable
              key={scenario.id}
              onPress={() => selectScenario(scenario)}
              style={[
                { backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: 4 },
                shadows.card,
              ]}
            >
              <Text style={[typography.h3, { color: color.textPrimary }]}>{scenario.title}</Text>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{scenario.description}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: spacing.lg, gap: spacing.xl }}>
          <View style={{ gap: 4 }}>
            <Text style={[typography.h2, { color: color.textPrimary }]}>{selected.title}</Text>
            <Text style={[typography.body, { color: color.textSecondary }]}>{selected.description}</Text>
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>
              How worked up should the child start out?
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor={color.primary}
              maximumTrackTintColor={color.surfaceAlt}
              thumbTintColor={color.primary}
            />
            <Text style={[typography.body, { color: color.textPrimary, textAlign: 'center' }]}>
              {INTENSITY_LABELS[intensity] ?? `${intensity}/10`}
            </Text>
          </View>

          <Button label="Start Practicing" onPress={start} />
        </View>
      )}
    </SafeAreaView>
  );
}
