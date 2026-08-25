import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, ProgressBar, ToggleChip, BackButton } from '../../../src/components/ui';
import { AnimatedMascot } from '../../../src/components/Mascot';
import { StarIcon, WaveformIcon, LeafIcon } from '../../../src/components/icons';
import { useCalmCornerContext } from '../../../src/features/calmCorner/CalmCornerProvider';
import { getExerciseById } from '../../../src/features/calmCorner/exerciseData';
import { AmbientAudioToggle } from '../../../src/features/calmCorner/AmbientAudioToggle';
import { useSpeech } from '../../../src/features/voice/useSpeech';

export default function ExerciseRunnerScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const calmCorner = useCalmCornerContext();
  const speech = useSpeech();

  const exercise = getExerciseById(exerciseId);
  const [step, setStep] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    if (exercise) calmCorner.markUsed(exercise.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id]);

  const isComplete = exercise ? step === exercise.steps.length : false;
  const currentStep = exercise && !isComplete ? exercise.steps[step] : null;

  useEffect(() => {
    if (!currentStep) return;
    setRemaining(currentStep.type === 'timer' ? currentStep.durationSeconds ?? null : null);
  }, [step, currentStep]);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      const t = setTimeout(() => setStep((s) => s + 1), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRemaining((r) => (r !== null ? r - 1 : r)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // Meditation-style exercises are often done with eyes closed, so the
  // voice guide reads each step's instruction aloud as it becomes current.
  useEffect(() => {
    if (!voiceEnabled || !currentStep) return;
    speech.speak(currentStep.instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, voiceEnabled, currentStep?.instruction]);

  function toggleVoice() {
    setVoiceEnabled((prev) => {
      if (prev) speech.stop();
      return !prev;
    });
  }

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Exercise not found</Text>
        <Button label="Back to Calm Corner" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isLastContentStep = step === exercise.steps.length - 1;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ height: 150 }}>
        <Image source={exercise.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20,15,10,0.32)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: spacing.sm,
            left: spacing.lg,
            right: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <BackButton onDark onPress={() => router.back()} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.h2, { color: '#fff' }]} numberOfLines={1}>{exercise.title}</Text>
          </View>
          <Pressable
            onPress={() => calmCorner.toggleFavorite(exercise.id)}
            hitSlop={10}
            style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: radii.pill, padding: spacing.xs }}
          >
            <StarIcon size={20} color={calmCorner.isFavorite(exercise.id) ? '#FFD166' : '#fff'} />
          </Pressable>
        </View>
        <View style={{ position: 'absolute', bottom: spacing.md, left: spacing.lg, right: spacing.lg }}>
          {!isComplete && <ProgressBarOnDark step={step} totalSteps={exercise.steps.length} />}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, gap: spacing.xl, justifyContent: 'center', alignItems: 'center' }}>
        {isComplete ? (
          <View style={{ alignItems: 'center', gap: spacing.lg }}>
            <AnimatedMascot size={120} motion="celebrate" propIcon={LeafIcon} />
            <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Nice work</Text>
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              You made it through {exercise.title}.
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', gap: spacing.xl, width: '100%' }}>
            {currentStep?.type === 'timer' && (
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: color.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[typography.display, { color: color.textOnPrimary, fontSize: 36 }]}>{remaining}</Text>
              </View>
            )}
            <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>{currentStep?.instruction}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <ToggleChip
                icon={WaveformIcon}
                active={voiceEnabled}
                onPress={toggleVoice}
                activeLabel="Voice guide on"
                inactiveLabel="Voice guide"
              />
              <AmbientAudioToggle />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg }}>
        {isComplete ? (
          <Button label="Done" onPress={() => router.back()} style={{ flex: 1 }} />
        ) : (
          <>
            <Button
              label="Back"
              variant="secondary"
              onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
              style={{ flex: 1 }}
            />
            <Button
              label={isLastContentStep ? 'Finish' : 'Next'}
              onPress={() => setStep((s) => s + 1)}
              style={{ flex: 1 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function ProgressBarOnDark({ step, totalSteps }: { step: number; totalSteps: number }) {
  const { spacing } = useTheme();
  const ratio = (step + 1) / totalSteps;
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
        <View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: '#fff' }} />
      </View>
    </View>
  );
}
