import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton } from '../../../src/components/ui';
import { AnimatedMascot, Mascot } from '../../../src/components/Mascot';
import { LessonStoryProgress } from '../../../src/features/courses/LessonStoryProgress';
import { getScenarioById } from '../../../src/features/actCheckIn/actContent';
import { ACT_STEP_LABELS } from '../../../src/features/actCheckIn/types';
import { useActCheckInSession } from '../../../src/features/actCheckIn/useActCheckInSession';
import { DisclaimerNote } from '../../../src/features/aiEngine/DisclaimerNote';

export default function ActCheckInScenarioScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();

  const scenario = getScenarioById(scenarioId);
  const [showingSituation, setShowingSituation] = useState(true);

  if (!scenario) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Check-in not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <ActiveScenario
      scenario={scenario}
      showingSituation={showingSituation}
      onBeginBeats={() => setShowingSituation(false)}
      onExit={() => router.back()}
    />
  );
}

function ActiveScenario({
  scenario,
  showingSituation,
  onBeginBeats,
  onExit,
}: {
  scenario: NonNullable<ReturnType<typeof getScenarioById>>;
  showingSituation: boolean;
  onBeginBeats: () => void;
  onExit: () => void;
}) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const session = useActCheckInSession(scenario);
  const [noteFocused, setNoteFocused] = useState(false);

  if (showingSituation) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
          <BackButton onPress={onExit} />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.caption, { color: color.textSecondary, letterSpacing: 1 }]}>SITUATION</Text>
          <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{scenario.situationText}</Text>
          <Button label="Begin" onPress={onBeginBeats} />
          <DisclaimerNote style={{ textAlign: 'center' }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (session.completed) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <AnimatedMascot size={110} motion="celebrate" />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Check-in complete</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            This is saved, and it'll help make future coaching more personal to you and your family.
          </Text>
        </View>
        <View style={{ padding: spacing.lg }}>
          <Button label="Done" onPress={onExit} />
        </View>
      </SafeAreaView>
    );
  }

  const { beat } = session;
  const answer = session.currentAnswer;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <BackButton onPress={session.beatIndex === 0 ? onExit : session.goBack} />
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]} numberOfLines={1}>
            {ACT_STEP_LABELS[beat.step]}
          </Text>
        </View>
        <LessonStoryProgress total={session.totalBeats} current={session.beatIndex} accentColor={color.primary} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
          <Mascot size={32} />
          <View style={[{ flex: 1, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }, shadows.card]}>
            {beat.kind === 'narrative' && <Text style={[typography.body, { color: color.textPrimary }]}>{beat.text}</Text>}

            {beat.kind === 'reflectionList' && (
              <View style={{ gap: spacing.md }}>
                {beat.lists.map((list, i) => (
                  <View key={i} style={{ gap: 6 }}>
                    <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{list.heading}</Text>
                    {list.items.map((item, j) => (
                      <Text key={j} style={[typography.bodySmall, { color: color.textSecondary }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {beat.kind === 'question' && (
              <View style={{ gap: spacing.md }}>
                <Text style={[typography.body, { color: color.textPrimary }]}>{beat.prompt}</Text>
                <View style={{ gap: spacing.sm }}>
                  {beat.options.map((option) => {
                    const selected = answer?.chosen === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => session.chooseOption(option)}
                        style={{
                          backgroundColor: selected ? color.primaryTint : color.surfaceAlt,
                          borderRadius: radii.md,
                          padding: spacing.md,
                          borderWidth: selected ? 1.5 : 0,
                          borderColor: color.primary,
                        }}
                      >
                        <Text style={[typography.bodySmall, { color: selected ? color.primary : color.textPrimary }]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {answer?.chosen && (
                  <View style={{ gap: spacing.sm }}>
                    <Text style={[typography.caption, { color: color.textSecondary }]}>Would you like to tell us more? (optional)</Text>
                    <TextInput
                      value={answer.note}
                      onChangeText={session.setNoteText}
                      onFocus={() => setNoteFocused(true)}
                      editable={!answer.submittedNote}
                      placeholder="Anything you'd like to add..."
                      placeholderTextColor={color.textSecondary}
                      multiline
                      style={{
                        minHeight: 60,
                        backgroundColor: color.surfaceAlt,
                        borderRadius: radii.md,
                        padding: spacing.md,
                        fontFamily: typography.body.fontFamily,
                        fontSize: typography.body.fontSize,
                        color: color.textPrimary,
                        textAlignVertical: 'top',
                      }}
                    />
                    {!answer.submittedNote && answer.note.trim().length > 0 && (
                      <Button label={answer.sending ? 'Sending...' : 'Share'} variant="secondary" onPress={session.submitNote} disabled={answer.sending} />
                    )}

                    {answer.safetyText ? (
                      <View style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.md, padding: spacing.md }}>
                        <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{answer.safetyText}</Text>
                      </View>
                    ) : answer.aiReply ? (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                        <Mascot size={24} />
                        <Text style={[typography.bodySmall, { color: color.textPrimary, flex: 1 }]}>{answer.aiReply}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        <Button label={session.beatIndex === session.totalBeats - 1 ? 'Finish' : 'Continue'} onPress={session.goNext} disabled={!session.canContinue} />
      </View>
    </SafeAreaView>
  );
}
