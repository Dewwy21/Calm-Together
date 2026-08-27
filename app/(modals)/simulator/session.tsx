import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton } from '../../../src/components/ui';
import { AnimatedMascot } from '../../../src/components/Mascot';
import { ThinkingBubble } from '../../../src/features/reflection/MessageBubble';
import { useProfilesContext } from '../../../src/features/profiles/ProfilesProvider';
import { usePreferencesContext } from '../../../src/features/preferences/PreferencesProvider';
import { getScenarioById } from '../../../src/features/simulator/simulatorScenarios';
import { useSimulatorState } from '../../../src/features/simulator/useSimulatorState';
import { SimulatorMessage } from '../../../src/features/simulator/types';
import { MASCOT_POSES } from '../../../src/components/Mascot';
import { DisclaimerNote } from '../../../src/features/aiEngine/DisclaimerNote';
import { handleComposerKeyPress } from '../../../src/utils/composerKeyPress';

export default function SimulatorSessionScreen() {
  const { scenarioId, intensity: intensityParam } = useLocalSearchParams<{ scenarioId: string; intensity: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { currentChild } = useProfilesContext();
  const { preferences } = usePreferencesContext();
  const scrollRef = useRef<ScrollView>(null);

  const scenario = getScenarioById(scenarioId);
  const intensity = Number(intensityParam) || scenario?.defaultIntensity || 6;
  const [inputText, setInputText] = useState('');

  const sim = useSimulatorState(scenario!, currentChild, preferences.therapistMode, intensity);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [sim.messages, sim.status]);

  if (!scenario) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Scenario not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sim.sendMessage(trimmed);
    setInputText('');
  }

  if (sim.status === 'safety') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
          <BackButton onPress={() => router.replace('/(modals)/simulator')} />
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.body, { color: color.textPrimary }]}>{sim.safetyText}</Text>
          <Button label="End Practice Session" variant="secondary" onPress={() => router.replace('/(modals)/simulator')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sim.status === 'coaching' || sim.status === 'finished' || sim.status === 'coachingFailed') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
          <BackButton onPress={() => router.replace('/(modals)/simulator')} />
          <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Coaching</Text>
        </View>

        {sim.status === 'coaching' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
            <AnimatedMascot size={90} motion={MASCOT_POSES.thinking.motion} propIcon={MASCOT_POSES.thinking.propIcon} />
            <Text style={[typography.body, { color: color.textSecondary }]}>Looking back over how that went...</Text>
          </View>
        )}

        {sim.status === 'coachingFailed' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              I'm having trouble putting the coaching together right now. Mind trying again?
            </Text>
            <Button label="Try Again" onPress={sim.endSession} />
          </View>
        )}

        {sim.status === 'finished' && sim.coaching && (
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
            <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
              <Text style={[typography.h3, { color: color.textPrimary }]}>What worked well</Text>
              {sim.coaching.whatWorked.map((item, i) => (
                <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
                  • {item}
                </Text>
              ))}
            </View>

            <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
              <Text style={[typography.h3, { color: color.textPrimary }]}>Try next time</Text>
              {sim.coaching.tryNextTime.map((item, i) => (
                <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
                  • {item}
                </Text>
              ))}
            </View>

            {sim.coaching.framework && (
              <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>
                Based on: {sim.coaching.framework}
              </Text>
            )}

            {sim.coaching.includeDisclaimer && <DisclaimerNote />}

            <Button label="Practice Another Scenario" onPress={() => router.replace('/(modals)/simulator')} />
            <Button label="Done" variant="ghost" onPress={() => router.back()} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BackButton onPress={() => router.back()} />
          <Text style={[typography.h2, { color: color.textPrimary, marginLeft: spacing.sm }]}>{scenario.title}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}>
          {sim.messages.length === 0 && (
            <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
              <AnimatedMascot size={72} motion="idle" />
              <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
                {scenario.scenarioSetup}
                {'\n\n'}Say what you'd actually say to get started.
              </Text>
            </View>
          )}

          {sim.messages.map((message) => (
            <SimulatorBubble key={message.id} message={message} />
          ))}

          {sim.status === 'thinking' && <ThinkingBubble />}

          {sim.status === 'replyFailed' && (
            <View style={{ alignItems: 'flex-start', gap: spacing.xs }}>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
                Couldn't get a reply just now.
              </Text>
              <Pressable onPress={sim.retryReply}>
                <Text style={[typography.bodyEmphasis, { color: color.primary }]}>Try again</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <Button label="End & Get Coaching" variant="secondary" onPress={sim.endSession} disabled={sim.messages.length === 0} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, alignItems: 'flex-end' }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onKeyPress={(e) => handleComposerKeyPress(e, handleSend)}
            placeholder="Say something to your child..."
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              flex: 1,
              maxHeight: 100,
              backgroundColor: color.surface,
              borderRadius: radii.lg,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
          <Pressable
            onPress={handleSend}
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.pill,
              backgroundColor: color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: color.textOnPrimary, fontSize: 18 }}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SimulatorBubble({ message }: { message: SimulatorMessage }) {
  const { color, spacing, typography, organicRadii, shadows } = useTheme();
  const isChild = message.role === 'child';

  return (
    <View style={{ alignItems: isChild ? 'flex-start' : 'flex-end' }}>
      <View
        style={[
          {
            maxWidth: '86%',
            backgroundColor: isChild ? color.surface : color.primary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            ...organicRadii.speechBubble,
          },
          isChild ? shadows.card : null,
        ]}
      >
        <Text style={[typography.body, { color: isChild ? color.textPrimary : color.textOnPrimary }]}>{message.text}</Text>
      </View>
    </View>
  );
}
