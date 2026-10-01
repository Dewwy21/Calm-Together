import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, ProgressBar, CloseButton } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { useDenContext } from '../../src/features/den/DenProvider';
import { EventTypeStep } from '../../src/features/logEvent/EventTypeStep';
import { SubtypeStep } from '../../src/features/logEvent/SubtypeStep';
import { DateTimeStep } from '../../src/features/logEvent/DateTimeStep';
import { IntensityStep } from '../../src/features/logEvent/IntensityStep';
import { DurationStep } from '../../src/features/logEvent/DurationStep';
import { QuestionStep } from '../../src/features/logEvent/QuestionStep';
import { DailyStressStep } from '../../src/features/logEvent/DailyStressStep';
import { ActSkillStep } from '../../src/features/logEvent/ActSkillStep';
import { ReflectionPrompts } from '../../src/features/logEvent/ReflectionPrompts';
import { QuestionConfig, getQuestionSteps } from '../../src/features/logEvent/questionConfig';
import { EventType, LoggedEvent } from '../../src/features/logEvent/types';
import { ActSkillId, actSkillLabel } from '../../src/features/logEvent/actSkillOptions';
import { createId } from '../../src/features/logEvent/eventStorage';
import { useBlueprintContext } from '../../src/features/blueprint/BlueprintProvider';
import { getSubtypeLabel } from '../../src/features/logEvent/subtypeOptions';
import { assessSafety } from '../../src/features/aiEngine/safetyTriage';

// Positive Moment skips Intensity and Duration entirely (see
// questionConfig.ts) — there's nothing to rate or time about a good moment,
// so its question steps start right after Date/Time instead of after those
// two extra steps.
const QUESTION_START_STEP_CHALLENGE = 5;
const QUESTION_START_STEP_POSITIVE = 3;
const DEFAULT_INTENSITY = 5;

type Answers = Record<QuestionConfig['key'], string>;

const EMPTY_ANSWERS: Answers = {
  whatHappened: '',
  before: '',
  after: '',
  location: '',
  whoPresent: '',
  consequences: '',
  additionalNotes: '',
  meaningfulMoment: '',
  childStrength: '',
  caregiverContribution: '',
  feelingReflection: '',
  memorableDetail: '',
  repeatStrategy: '',
};

export default function LogEventScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { id, presetType } = useLocalSearchParams<{ id?: string; presetType?: string }>();
  const den = useDenContext();
  const blueprint = useBlueprintContext();

  const existingEvent = id ? den.events.find((e) => e.id === id) : undefined;
  const isEditing = Boolean(existingEvent);
  const validPresetType: EventType | null =
    !isEditing && (presetType === 'meltdown' || presetType === 'parentReaction' || presetType === 'positiveMoment')
      ? presetType
      : null;

  // A preset type (e.g. "Log this as a Positive Moment" from a Family
  // Activity) skips straight past the type-selection step.
  const [step, setStep] = useState(validPresetType ? 1 : 0);
  const [eventType, setEventType] = useState<EventType | null>(existingEvent?.eventType ?? validPresetType);
  const [subtype, setSubtype] = useState<string | null>(existingEvent?.subtype ?? null);
  const [occurredAt, setOccurredAt] = useState(() => (existingEvent ? new Date(existingEvent.occurredAtISO) : new Date()));
  const [timeDescription, setTimeDescription] = useState(existingEvent?.timeDescription ?? '');
  const [intensity, setIntensity] = useState(existingEvent?.intensity ?? 5);
  const [durationLabel, setDurationLabel] = useState(existingEvent?.durationLabel ?? '');
  // The four standardized daily check-in questions — asked at the end of
  // every entry regardless of eventType, in addition to the type-specific
  // fields above (see types.ts's comment on these fields for why they're
  // kept separate rather than merged into any existing field).
  const [dailyStressScore, setDailyStressScore] = useState<number | null>(existingEvent?.dailyStressScore ?? null);
  const [dailyNote, setDailyNote] = useState(existingEvent?.dailyNote ?? '');
  const [actSkillsUsed, setActSkillsUsed] = useState<ActSkillId[]>(existingEvent?.actSkillsUsed ?? []);
  const [valuesAlignedMoment, setValuesAlignedMoment] = useState(existingEvent?.valuesAlignedMoment ?? '');
  const [answers, setAnswers] = useState<Answers>(
    existingEvent
      ? {
          ...EMPTY_ANSWERS,
          whatHappened: existingEvent.whatHappened,
          before: existingEvent.before,
          after: existingEvent.after,
          location: existingEvent.location,
          whoPresent: existingEvent.whoPresent,
          consequences: existingEvent.consequences,
          additionalNotes: existingEvent.additionalNotes,
          meaningfulMoment: existingEvent.meaningfulMoment ?? '',
          childStrength: existingEvent.childStrength ?? '',
          caregiverContribution: existingEvent.caregiverContribution ?? '',
          feelingReflection: existingEvent.feelingReflection ?? '',
          memorableDetail: existingEvent.memorableDetail ?? '',
          repeatStrategy: existingEvent.repeatStrategy ?? '',
        }
      : EMPTY_ANSWERS
  );

  // Positive Moment runs a shorter, differently-focused flow: no
  // Intensity/Duration steps, and a different set of questions (see
  // questionConfig.ts). Everything below derives from that one flag instead
  // of hardcoding step counts, so the wizard adapts to whichever type is
  // selected on step 0.
  const isPositiveMoment = eventType === 'positiveMoment';
  const questionSteps = getQuestionSteps(eventType ?? 'meltdown');
  const questionStartStep = isPositiveMoment ? QUESTION_START_STEP_POSITIVE : QUESTION_START_STEP_CHALLENGE;
  // The four daily check-in steps always come last, after whichever
  // type-specific questions this eventType asks.
  const dailyStepStart = questionStartStep + questionSteps.length;
  const totalFormSteps = dailyStepStart + 4;
  const requiredQuestionKey = questionSteps.find((q) => q.requiredForSave)?.key;

  const canProceedFromStep0 = eventType !== null;
  const canSave =
    eventType !== null &&
    !!requiredQuestionKey &&
    answers[requiredQuestionKey].trim().length > 0 &&
    dailyStressScore !== null;
  const isLastFormStep = step === totalFormSteps - 1;

  function updateAnswer(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleBack() {
    if (step === 0) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleNext() {
    setStep((s) => Math.min(s + 1, totalFormSteps - 1));
  }

  function dailyLogSummary(event: LoggedEvent): string {
    const subtypeLabel = getSubtypeLabel(event.eventType, event.subtype);
    let lines: string[];
    if (event.eventType === 'positiveMoment') {
      lines = [
        `Logged a Positive Moment${subtypeLabel ? ` (${subtypeLabel})` : ''}.`,
        `What made it meaningful: ${event.meaningfulMoment}`,
      ];
      if (event.childStrength) lines.push(`What the child did well: ${event.childStrength}`);
      if (event.caregiverContribution) lines.push(`What the caregiver did to help create it: ${event.caregiverContribution}`);
      if (event.repeatStrategy) lines.push(`How to create more moments like this: ${event.repeatStrategy}`);
    } else {
      lines = [
        `Logged a ${event.eventType}${subtypeLabel ? ` (${subtypeLabel})` : ''}, intensity ${event.intensity}/10.`,
        `What happened: ${event.whatHappened}`,
      ];
      if (event.before) lines.push(`Right before: ${event.before}`);
      if (event.consequences) lines.push(`What happened next: ${event.consequences}`);
    }

    // The four standardized daily check-in answers, called out as their own
    // clearly-labeled block — these are the consistent, comparable answers
    // (asked the same way on every entry) that AI features reading Family
    // Blueprint history should track for intervention progress, distinct
    // from the type-specific narrative above.
    lines.push('--- Daily check-in ---');
    lines.push(`Overall daily stress (1-7): ${event.dailyStressScore ?? 'not answered'}`);
    if (event.dailyNote) lines.push(`Anything come up today: ${event.dailyNote}`);
    lines.push(`ACT skill(s) used: ${event.actSkillsUsed?.length ? event.actSkillsUsed.map(actSkillLabel).join(', ') : 'none logged'}`);
    if (event.valuesAlignedMoment) lines.push(`Values-aligned moment: ${event.valuesAlignedMoment}`);

    return lines.join('\n');
  }

  // Always saves the entry itself regardless of what's found — a
  // caregiver's own Daily Log is always theirs to keep. The Blueprint
  // write-back is what branches: a flagged entry becomes a marked safety
  // event instead of a routine memory note, same triage every AI-facing
  // write in the app goes through. Scans every free-text field regardless
  // of which flow produced the entry, since only one set is ever populated.
  function noteBlueprintForSave(event: LoggedEvent) {
    const safety = assessSafety(
      [
        event.whatHappened,
        event.before,
        event.after,
        event.consequences,
        event.additionalNotes,
        event.meaningfulMoment,
        event.childStrength,
        event.caregiverContribution,
        event.feelingReflection,
        event.memorableDetail,
        event.repeatStrategy,
        event.dailyNote,
        event.valuesAlignedMoment,
      ]
        .filter(Boolean)
        .join(' ')
    );
    if (safety.isSafetyEvent) {
      blueprint.noteSafetyEvent('dailyLog', safety.category);
    } else {
      blueprint.noteInteraction('dailyLog', dailyLogSummary(event));
    }
  }

  function handleSave() {
    if (!eventType || !canSave) return;

    // Positive Moment never collects Intensity/Duration — these are
    // stored as harmless, hidden defaults rather than made optional on
    // LoggedEvent, so nothing elsewhere in the app that assumes a number
    // has to add null-checks for a value that was never meaningful for
    // this type in the first place.
    const resolvedIntensity = isPositiveMoment ? DEFAULT_INTENSITY : intensity;
    const resolvedDuration = isPositiveMoment ? '' : durationLabel;

    if (isEditing && existingEvent) {
      const updated: LoggedEvent = {
        ...existingEvent,
        eventType,
        subtype: subtype ?? undefined,
        occurredAtISO: occurredAt.toISOString(),
        timeDescription,
        intensity: resolvedIntensity,
        durationLabel: resolvedDuration,
        ...answers,
        dailyStressScore: dailyStressScore ?? undefined,
        dailyNote,
        actSkillsUsed,
        valuesAlignedMoment,
      };
      den.updateEvent(existingEvent.id, updated);
      noteBlueprintForSave(updated);
      router.back();
      return;
    }

    const event: LoggedEvent = {
      id: createId(),
      eventType,
      subtype: subtype ?? undefined,
      occurredAtISO: occurredAt.toISOString(),
      timeDescription,
      intensity: resolvedIntensity,
      durationLabel: resolvedDuration,
      ...answers,
      dailyStressScore: dailyStressScore ?? undefined,
      dailyNote,
      actSkillsUsed,
      valuesAlignedMoment,
      createdAtISO: new Date().toISOString(),
    };
    // The AI Reflection is generated the first time the reflection screen
    // actually opens for this event (see reflection.tsx) — a real AI call
    // can't happen synchronously here without blocking the save itself.
    den.addEvent(event);
    noteBlueprintForSave(event);
    // Replace (not push) so the wizard isn't left on the back stack behind
    // the reflection screen.
    router.replace(`/(modals)/reflection?eventId=${event.id}`);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
        }}
      >
        <Mascot size={36} />
        <View style={{ flex: 1, gap: 4 }}>
          {isEditing && <Text style={[typography.caption, { color: color.primary }]}>Editing entry</Text>}
          <ProgressBar step={step} totalSteps={totalFormSteps} />
        </View>
        <CloseButton onPress={() => router.back()} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, flexGrow: 1 }}>{renderStep()}</ScrollView>
      </KeyboardAvoidingView>

      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg }}>
        <Button label="Back" variant="secondary" onPress={handleBack} style={{ flex: 1 }} />
        {isLastFormStep ? (
          <Button
            label={isEditing ? 'Save changes' : 'Save'}
            onPress={handleSave}
            disabled={!canSave}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            label="Next"
            onPress={handleNext}
            disabled={step === 0 && !canProceedFromStep0}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );

  function renderStep() {
    if (step === 0) {
      return <EventTypeStep value={eventType} onChange={setEventType} />;
    }
    if (step === 1) {
      return eventType ? (
        <SubtypeStep eventType={eventType} value={subtype} onChange={setSubtype} />
      ) : null;
    }
    if (step === 2) {
      return (
        <DateTimeStep
          occurredAt={occurredAt}
          onChangeOccurredAt={setOccurredAt}
          timeDescription={timeDescription}
          onChangeTimeDescription={setTimeDescription}
        />
      );
    }
    if (!isPositiveMoment && step === 3) {
      return <IntensityStep value={intensity} onChange={setIntensity} />;
    }
    if (!isPositiveMoment && step === 4) {
      return <DurationStep value={durationLabel} onChange={setDurationLabel} />;
    }

    if (step < dailyStepStart) {
      const question = questionSteps[step - questionStartStep];
      return (
        <QuestionStep
          title={question.title}
          placeholder={question.placeholder}
          value={answers[question.key]}
          onChange={(value) => updateAnswer(question.key, value)}
        />
      );
    }

    // The four standardized daily check-in steps — always last, always the
    // same regardless of eventType (see types.ts's comment on these fields).
    const dailyStep = step - dailyStepStart;
    return (
      <View style={{ gap: spacing.xl }}>
        {dailyStep === 0 && <DailyStressStep value={dailyStressScore} onChange={setDailyStressScore} />}
        {dailyStep === 1 && (
          <QuestionStep
            title="Anything come up today you want to note?"
            placeholder="A hard moment, a win, gratitude, or something that felt different..."
            value={dailyNote}
            onChange={setDailyNote}
          />
        )}
        {dailyStep === 2 && <ActSkillStep value={actSkillsUsed} onChange={setActSkillsUsed} />}
        {dailyStep === 3 && (
          <QuestionStep
            title="Was there a moment today you responded in a way that matched what matters to you, even if it was hard?"
            placeholder="Describe the moment, if one comes to mind..."
            value={valuesAlignedMoment}
            onChange={setValuesAlignedMoment}
          />
        )}
        {isLastFormStep && <ReflectionPrompts eventType={eventType} />}
      </View>
    );
  }
}
