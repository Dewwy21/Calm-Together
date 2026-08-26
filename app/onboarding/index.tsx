import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, ProgressBar } from '../../src/components/ui';
import { ONBOARDING_STEPS } from '../../src/features/onboarding/steps';
import { TOTAL_QUESTIONS } from '../../src/features/onboarding/questions';
import { OnboardingAnswers } from '../../src/features/onboarding/types';
import { OnboardingWelcome } from '../../src/features/onboarding/OnboardingWelcome';
import { OnboardingSectionIntro } from '../../src/features/onboarding/OnboardingSectionIntro';
import { OnboardingProcessing } from '../../src/features/onboarding/OnboardingProcessing';
import { OnboardingReview } from '../../src/features/onboarding/OnboardingReview';
import { OnboardingQuestionCard } from '../../src/features/onboarding/OnboardingQuestionCard';
import { OnboardingDecor } from '../../src/features/onboarding/OnboardingDecor';
import { persistOnboardingAnswers, persistOnboardingStatus } from '../../src/features/onboarding/onboardingStorage';
import { useProfilesContext } from '../../src/features/profiles/ProfilesProvider';
import { childProfileFromOnboardingAnswers } from '../../src/features/profiles/childProfileFromOnboarding';
import { ageRangeLabel, adhdStatusLabel } from '../../src/features/profiles/profileOptions';
import { useBlueprintContext } from '../../src/features/blueprint/BlueprintProvider';
import { buildOnboardingSummary } from '../../src/features/blueprint/onboardingSummary';
import { useBaselineAssessmentContext } from '../../src/features/baselineAssessment/BaselineAssessmentProvider';

export default function OnboardingScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const profiles = useProfilesContext();
  const blueprint = useBlueprintContext();
  const baselineAssessment = useBaselineAssessmentContext();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  // Set when a question is opened for editing from the Review step —
  // pressing Next then returns to Review instead of continuing forward
  // through the remaining questions.
  const [returningToReview, setReturningToReview] = useState(false);

  // Ensures the first child profile exists even if the caregiver skips —
  // Daily Log/Help Bot/progress all need a current child to scope to. Also
  // kicks off the very first Family Blueprint generation, right away
  // rather than waiting for the family to accumulate more history —
  // fire-and-forget so it never blocks getting into the app. Safe to call
  // on a retake too: no-ops (returning the existing child's id) once a
  // profile already exists. Returns the resolved child id synchronously —
  // callers must use this return value rather than `profiles.currentChildId`
  // immediately afterward, since `switchChild` is a state update that
  // hasn't applied to context yet within this same synchronous pass.
  function ensureFirstChild(): string {
    if (profiles.profiles.length > 0) return profiles.currentChildId ?? profiles.profiles[0].id;
    const created = profiles.addChild(childProfileFromOnboardingAnswers(answers));
    profiles.switchChild(created.id);
    const description = `Child: ${created.name}, age range ${ageRangeLabel(created.ageRange)}, ADHD status: ${adhdStatusLabel(created.adhdStatus)}.`;
    blueprint.initializeFromOnboarding(created.id, description, buildOnboardingSummary(answers));
    return created.id;
  }

  const step = ONBOARDING_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const reviewStepIndex = ONBOARDING_STEPS.findIndex((s) => s.kind === 'review');

  function stepIndexForQuestion(questionIndex: number): number {
    return ONBOARDING_STEPS.findIndex((s) => s.kind === 'question' && s.questionIndex === questionIndex);
  }

  function goNext() {
    if (returningToReview) {
      setReturningToReview(false);
      setStepIndex(reviewStepIndex);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function goBack() {
    if (isFirstStep) return;
    setStepIndex((i) => i - 1);
  }

  function handleEditQuestion(questionIndex: number) {
    setReturningToReview(true);
    setStepIndex(stepIndexForQuestion(questionIndex));
  }

  async function handleSkip() {
    await persistOnboardingAnswers(answers);
    await persistOnboardingStatus('skipped');
    ensureFirstChild();
    router.replace('/den');
  }

  async function handleComplete() {
    await persistOnboardingAnswers(answers);
    await persistOnboardingStatus('completed');
    const childId = ensureFirstChild();
    const recordId = await baselineAssessment.submitAssessment(childId, answers);
    router.replace(`/(modals)/assessment-detail/${recordId}?justCompleted=1`);
  }

  function setAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function setOtherText(questionId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [`${questionId}__other`]: text }));
  }

  function setFollowUpNote(questionId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [`${questionId}__note`]: text }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <OnboardingDecor variant={stepIndex} />

      {step.kind === 'question' && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <ProgressBar step={step.questionIndex} totalSteps={TOTAL_QUESTIONS} />
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {step.kind === 'welcome' && <OnboardingWelcome />}
          {step.kind === 'sectionIntro' && <OnboardingSectionIntro section={step.section} />}
          {step.kind === 'processing' && <OnboardingProcessing onDone={goNext} />}
          {step.kind === 'review' && <OnboardingReview answers={answers} onEditQuestion={handleEditQuestion} />}
          {step.kind === 'question' && (
            <OnboardingQuestionCard
              question={step.question}
              value={answers[step.question.id]}
              otherText={(answers[`${step.question.id}__other`] as string) ?? ''}
              followUpNote={(answers[`${step.question.id}__note`] as string) ?? ''}
              onChangeValue={(value) => setAnswer(step.question.id, value)}
              onChangeOtherText={(text) => setOtherText(step.question.id, text)}
              onChangeFollowUpNote={(text) => setFollowUpNote(step.question.id, text)}
            />
          )}
        </ScrollView>

        {step.kind !== 'processing' && (
          <View style={{ padding: spacing.lg, gap: spacing.sm }}>
            {step.kind === 'welcome' && <Button label="Begin" onPress={goNext} />}
            {step.kind === 'sectionIntro' && <Button label="Continue" onPress={goNext} />}
            {step.kind === 'review' && <Button label="Submit" onPress={handleComplete} />}
            {step.kind === 'question' && (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button label="Back" variant="secondary" onPress={goBack} style={{ flex: 1 }} />
                <Button label={returningToReview ? 'Save & Review' : 'Next'} onPress={goNext} style={{ flex: 1 }} />
              </View>
            )}
            {step.kind !== 'review' && (
              <Pressable onPress={handleSkip} style={{ alignSelf: 'center', padding: spacing.sm }}>
                <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Skip for Now</Text>
              </Pressable>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
