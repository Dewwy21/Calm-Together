import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, CloseButton, ToggleChip, ConfirmDialog } from '../../../../src/components/ui';
import { useProfilesContext } from '../../../../src/features/profiles/ProfilesProvider';
import { AnimatedMascot } from '../../../../src/components/Mascot';
import { ChevronLeftIcon, WaveformIcon, TrophyIcon, ChatIcon } from '../../../../src/components/icons';
import { getCourseById, getLessonById } from '../../../../src/features/courses/courseData';
import { getCourseAccent } from '../../../../src/features/courses/courseColors';
import { LessonCardView } from '../../../../src/features/courses/LessonCardView';
import { LessonStoryProgress } from '../../../../src/features/courses/LessonStoryProgress';
import { LessonChatSheet } from '../../../../src/features/courses/LessonChatSheet';
import { cardToSpeechText } from '../../../../src/features/courses/lessonSpeech';
import { useCourseProgressContext } from '../../../../src/features/courses/CourseProgressProvider';
import { usePersonalizedLessonsContext } from '../../../../src/features/personalizedLessons/PersonalizedLessonsProvider';
import { useBlueprintContext } from '../../../../src/features/blueprint/BlueprintProvider';
import { useFamilyContextInput } from '../../../../src/features/ai/useFamilyContextInput';
import { usePreferencesContext } from '../../../../src/features/preferences/PreferencesProvider';
import { useSpeech } from '../../../../src/features/voice/useSpeech';
import { isLessonUnlocked, getUnlockDayForLesson } from '../../../../src/features/courses/coursePath';
import { LessonQuizView } from '../../../../src/features/courses/LessonQuizView';
import { useOpenFaceCamera } from '../../../../src/features/openface/useOpenFaceCamera';
import { predictExpression } from '../../../../src/features/openface/openfaceClient';
import {
  addActiveFrame,
  addBaselineFrame,
  completeSession,
  createSession,
  finalizeBaseline,
  latchTriggerOccurred,
  pauseSensing,
  resumeSensing,
  startActiveSensing,
  startBaselineCollection,
} from '../../../../src/features/openface/sensingSession';
import type { SensingSessionConfig, SensingSessionState } from '../../../../src/features/openface/sensingSession';
import { CameraConsentPrompt } from '../../../../src/features/openface/CameraConsentPrompt';
import { CaregiverCheckInPrompt, CaregiverReflectionResponse } from '../../../../src/features/openface/CaregiverCheckInPrompt';
import type { AcceptanceCheckpointResult } from '../../../../src/features/openface/acceptanceCheckpointTypes';

// Stage 6: the exact, confirmed lesson id for "Acceptance — Week 1" — see
// src/features/courses/lessons/acceptanceLesson1.ts. OpenFace sensing is
// deliberately gated to ONLY this one lesson id — nothing else in the
// 28-day program is affected, per the explicit Stage 6 scope.
const ACCEPTANCE_LESSON_ID = 'acceptance-week1';
const ACCEPTANCE_CHECKPOINT_ID = 'guided-practice-video';
const SENSING_CONFIG: SensingSessionConfig = {
  samplingFps: 5,
  baselineDurationSec: 8,
  rollingWindowDurationSec: 6,
  minValidFaceCoverage: 0.6,
  distanceThreshold: 0.25,
  persistenceDurationSec: 2.5,
};

export default function LessonPlayerScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const theme = useTheme();
  const { color, spacing, typography, radii } = theme;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const speech = useSpeech();
  const progress = useCourseProgressContext();
  const profiles = useProfilesContext();
  const personalizedLessons = usePersonalizedLessonsContext();
  const blueprint = useBlueprintContext();
  const familyContext = useFamilyContextInput();
  const { preferences } = usePreferencesContext();

  const course = getCourseById(courseId);
  const lesson = courseId === 'personalized' ? personalizedLessons.getById(lessonId ?? '') : getLessonById(lessonId);
  const cards = lesson?.cards ?? [];
  // Real enforcement, not just a disabled row on the list screen — a
  // locked lesson can't be played even via a direct/stale navigation.
  const unlocked = lesson
    ? isLessonUnlocked(lesson.id, profiles.currentChild?.interventionStartDateISO, preferences.unlockAllLessons)
    : true;
  const unlockDay = lesson ? getUnlockDayForLesson(lesson.id) : null;

  const scrollRef = useRef<ScrollView>(null);
  const initialIndexRef = useRef(Math.min(Math.max(progress.getCardIndex(lessonId ?? ''), 0), Math.max(cards.length - 1, 0)));

  const [index, setIndex] = useState(initialIndexRef.current);
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [scenarioSelections, setScenarioSelections] = useState<Record<string, number>>({});
  const [sequenceOrders, setSequenceOrders] = useState<Record<string, number[]>>({});
  const [reflectionText, setReflectionText] = useState(progress.getLessonProgress(lessonId ?? '')?.reflectionAnswer ?? '');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [showInterventionStart, setShowInterventionStart] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Stage 6 — OpenFace sensing, Acceptance lesson only. Reuses the exact
  // same camera hook and sensingSession.ts reducers as the researcher
  // OpenFace Testing panel (Stage 4/5) — no second camera pipeline, no
  // second temporal-analysis implementation.
  const isAcceptanceLesson = lesson?.id === ACCEPTANCE_LESSON_ID;
  const camera = useOpenFaceCamera();
  const [sensingConsent, setSensingConsent] = useState<'undecided' | 'enabled' | 'declined'>('undecided');
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  const [sensingState, setSensingState] = useState<SensingSessionState | null>(null);
  const sensingStateRef = useRef<SensingSessionState | null>(null);
  sensingStateRef.current = sensingState;
  // Latched separately from sensingState.trigger.triggerCandidate, which
  // Stage 5's own logic can reset back to false if the distance later
  // recovers below threshold (see sensingSession.ts). This flag answers
  // "did a valid trigger happen at ANY point during this checkpoint" and,
  // once true, is never reset until a new checkpoint/session begins — so a
  // trigger early in the video is still honored at video-end even though
  // the live trigger state may have long since reset.
  const [triggerOccurredThisCheckpoint, setTriggerOccurredThisCheckpoint] = useState(false);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const [checkpointResult, setCheckpointResult] = useState<AcceptanceCheckpointResult | null>(null);
  const sensingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sensingBaselineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensingInFlightRef = useRef(false);

  useEffect(() => {
    setTriggerOccurredThisCheckpoint((prev) => latchTriggerOccurred(prev, !!sensingState?.trigger.triggerCandidate));
  }, [sensingState?.trigger.triggerCandidate]);

  // Ask for consent once, when the guided-practice video card becomes the
  // visible card — computed fresh here (not via an outer videoCardIndex
  // const) so this effect can sit before the early-return guards below,
  // same as every other hook in this component. Skipped for an
  // already-completed lesson, matching the existing "just let them
  // rewatch" convention elsewhere in this screen.
  useEffect(() => {
    if (!isAcceptanceLesson || !lesson) return;
    const videoIdx = cards.findIndex((c) => c.kind === 'media' && c.mediaType === 'video');
    if (index === videoIdx && sensingConsent === 'undecided' && !progress.isLessonCompleted(lesson.id)) {
      setShowConsentPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isAcceptanceLesson, sensingConsent]);

  // Release camera resources and stop any sensing timers on unmount,
  // regardless of how the lesson screen was left (navigating away,
  // closing, Stage 6 requirement #11).
  useEffect(() => {
    return () => {
      stopSensingTickLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopSensingTickLoop() {
    if (sensingIntervalRef.current) clearInterval(sensingIntervalRef.current);
    if (sensingBaselineTimerRef.current) clearTimeout(sensingBaselineTimerRef.current);
    sensingIntervalRef.current = null;
    sensingBaselineTimerRef.current = null;
  }

  async function runSensingCaptureTick() {
    sensingInFlightRef.current = true;
    try {
      const blob = await camera.captureBlobFromVideo();
      if (!blob) return;
      const result = await predictExpression(blob);
      const rawFrame = {
        timestamp: performance.now(),
        faceDetected: result.ok ? result.data.faceDetected : false,
        expressionProbabilities: result.ok ? result.data.expressionProbabilities : null,
      };
      setSensingState((prev) => {
        if (!prev) return prev;
        if (prev.mode === 'BASELINE') return addBaselineFrame(prev, rawFrame);
        if (prev.mode === 'ACTIVE') return addActiveFrame(prev, rawFrame);
        return prev;
      });
    } finally {
      sensingInFlightRef.current = false;
    }
  }

  function startSensingTickLoop() {
    const intervalMs = 1000 / SENSING_CONFIG.samplingFps;
    sensingIntervalRef.current = setInterval(() => {
      if (camera.cameraStatusRef.current !== 'active') {
        stopSensingTickLoop();
        return;
      }
      if (sensingInFlightRef.current) return; // skip this tick — previous capture still in flight, never queue
      runSensingCaptureTick();
    }, intervalMs);
  }

  async function handleEnableSensing() {
    setShowConsentPrompt(false);
    setSensingConsent('enabled');
    await camera.startCamera();
    if (camera.cameraStatusRef.current !== 'active') return; // permission denied / unavailable — video plays normally regardless, nothing further to do

    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let state = createSession(sessionId, ACCEPTANCE_CHECKPOINT_ID, SENSING_CONFIG);
    state = startBaselineCollection(state, performance.now());
    setSensingState(state);
    setTriggerOccurredThisCheckpoint(false);
    sensingInFlightRef.current = false;
    startSensingTickLoop();
    sensingBaselineTimerRef.current = setTimeout(() => {
      stopSensingTickLoop();
      setSensingState((prev) => (prev && prev.mode === 'BASELINE' ? finalizeBaseline(prev) : prev));
    }, SENSING_CONFIG.baselineDurationSec * 1000);
  }

  function handleDeclineSensing() {
    setShowConsentPrompt(false);
    setSensingConsent('declined');
  }

  function handleVideoPlay() {
    if (!isAcceptanceLesson || sensingConsent !== 'enabled') return;
    const current = sensingStateRef.current;
    if (!current) return;

    // Resume-after-pause: this is a SEPARATE transition from the initial
    // BASELINE->ACTIVE start below — startActiveSensing() only accepts a
    // BASELINE-mode state, so calling it here would silently no-op and
    // sensing would never resume. (Found during Stage 6 re-verification —
    // this was the actual bug: PAUSED was never handled at all.)
    if (current.mode === 'PAUSED') {
      setSensingState((prev) => (prev ? resumeSensing(prev) : prev));
      sensingInFlightRef.current = false;
      startSensingTickLoop();
      return;
    }

    if (current.mode !== 'BASELINE' || !current.baselineVector) return; // no valid baseline — video plays, sensing just never activates
    setSensingState((prev) => (prev ? startActiveSensing(prev) : prev));
    sensingInFlightRef.current = false;
    startSensingTickLoop();
  }

  function handleVideoPause() {
    if (!isAcceptanceLesson) return;
    stopSensingTickLoop();
    setSensingState((prev) => (prev && prev.mode === 'ACTIVE' ? pauseSensing(prev) : prev));
  }

  // Opening any lesson, for the first time ever, starts the 28-day
  // intervention window that Day 14/28 Baseline Assessment checkpoints are
  // calculated from (see checkpoints.ts) — the caregiver confirms via this
  // one-time heads-up rather than the clock starting silently. Re-prompts
  // on the next lesson open if they dismiss without confirming.
  useEffect(() => {
    if (profiles.loaded && profiles.currentChild && !profiles.currentChild.interventionStartDateISO && unlocked) {
      setShowInterventionStart(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles.loaded, profiles.currentChild, unlocked]);

  function confirmInterventionStart() {
    if (profiles.currentChildId) {
      profiles.updateChild(profiles.currentChildId, { interventionStartDateISO: new Date().toISOString() });
    }
    setShowInterventionStart(false);
  }

  if (!course || !lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Lesson not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
        <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Not available yet</Text>
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
          {unlockDay ? `This lesson unlocks on Day ${unlockDay} of the program.` : "This lesson isn't available yet."}
        </Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const { accentColor, accentTint } = getCourseAccent(theme, course.id);
  const isLast = index === cards.length - 1;
  const hasQuiz = !!lesson.quiz;
  // Lets a caregiver rewatch the lesson's video any time — from the
  // finished screen, from the quiz results screen, or just by reopening a
  // completed lesson — without it forcing them back through the quiz.
  const videoCardIndex = cards.findIndex((c) => c.kind === 'media' && c.mediaType === 'video');
  const hasVideo = videoCardIndex !== -1;

  function persistReflectionIfNeeded() {
    const currentCard = cards[index];
    if (currentCard.kind === 'reflection' && reflectionText.trim()) {
      progress.saveReflectionAnswer(lesson!.id, reflectionText);
    }
  }

  function goToIndex(next: number) {
    const clamped = Math.min(Math.max(next, 0), cards.length - 1);
    persistReflectionIfNeeded();
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
    progress.setCardIndex(lesson!.id, clamped);
    if (voiceEnabled) speech.speak(cardToSpeechText(cards[clamped]));
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) {
      persistReflectionIfNeeded();
      setIndex(newIndex);
      progress.setCardIndex(lesson!.id, newIndex);
      if (voiceEnabled) speech.speak(cardToSpeechText(cards[newIndex]));
    }
  }

  function proceedPastVideo() {
    if (isLast) {
      if (hasQuiz) setShowQuiz(true);
      else finishLesson();
    } else {
      goToIndex(index + 1);
    }
  }

  function handleVideoEnded() {
    // Already completed once before (rewatching from the finished screen,
    // the quiz results screen, or just reopening a done lesson) — just let
    // them watch, no forced re-navigation into the quiz or finish screen.
    if (progress.isLessonCompleted(lesson!.id)) {
      if (sensingState && (sensingState.mode === 'ACTIVE' || sensingState.mode === 'PAUSED')) {
        stopSensingTickLoop();
        setSensingState((prev) => (prev ? completeSession(prev, performance.now()) : prev));
      }
      return;
    }

    let finalSensing = sensingState;
    if (sensingState && (sensingState.mode === 'ACTIVE' || sensingState.mode === 'PAUSED')) {
      stopSensingTickLoop();
      finalSensing = completeSession(sensingState, performance.now());
      setSensingState(finalSensing);
    }

    // In-memory checkpoint record (Stage 6 §10) — never persisted, held
    // only as local component state, discarded when this screen unmounts.
    const result: AcceptanceCheckpointResult = {
      anonymousParticipantId: null,
      sessionId: finalSensing?.sessionId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lessonId: lesson!.id,
      checkpointId: ACCEPTANCE_CHECKPOINT_ID,
      baselineExpressionProbabilities: finalSensing?.baselineVector ?? null,
      activeExpressionProbabilities: finalSensing?.activeWindow?.meanProbabilities ?? null,
      postExpressionProbabilities: null, // deferred — see final report §9
      faceValidRatio: finalSensing?.activeWindow?.validFaceCoverage ?? null,
      stateDistance: finalSensing?.distanceScore ?? null,
      triggerCandidate: triggerOccurredThisCheckpoint,
      promptShown: false,
      promptDismissed: false,
      userReportedState: null,
      userReportedIntensity: null,
      lessonCompleted: false,
      timestamp: new Date().toISOString(),
    };

    // triggerOccurredThisCheckpoint can only ever be true if Stage 5's own
    // addActiveFrame() set it during a reliable, valid-baseline window —
    // reliability is already a precondition baked into that logic, so no
    // separate reliability re-check is needed here. At most one prompt per
    // checkpoint (§6), and only while sensing was actually enabled.
    const promptPermitted = sensingConsent === 'enabled' && triggerOccurredThisCheckpoint;

    if (promptPermitted) {
      setCheckpointResult({ ...result, promptShown: true });
      setShowReflectionPrompt(true);
      return; // never interrupts playback (already ended) — just defers the quiz/next-card transition until the prompt is answered or skipped
    }

    setCheckpointResult(result);
    proceedPastVideo();
  }

  function handleReflectionResponse(response: CaregiverReflectionResponse) {
    setShowReflectionPrompt(false);
    setCheckpointResult((prev) => (prev ? { ...prev, userReportedState: response } : prev));
    proceedPastVideo();
  }

  function handleReflectionSkip() {
    setShowReflectionPrompt(false);
    setCheckpointResult((prev) => (prev ? { ...prev, userReportedState: 'skipped', promptDismissed: true } : prev));
    proceedPastVideo();
  }

  function watchVideoAgain() {
    if (!hasVideo) return;
    setFinished(false);
    setShowQuiz(false);
    goToIndex(videoCardIndex);
  }

  function finishLesson() {
    persistReflectionIfNeeded();
    progress.completeLesson(lesson!.id);
    speech.stop();
    setFinished(true);
    setCheckpointResult((prev) => (prev ? { ...prev, lessonCompleted: true } : prev));
    blueprint.noteInteraction('lesson', `Completed the lesson "${lesson!.title}" (${course!.title}): ${lesson!.summary}`);
  }

  function tapSequenceItem(cardId: string, originalIndex: number) {
    setSequenceOrders((prev) => {
      const current = prev[cardId] ?? [];
      if (current.includes(originalIndex)) return prev;
      return { ...prev, [cardId]: [...current, originalIndex] };
    });
  }

  function resetSequence(cardId: string) {
    setSequenceOrders((prev) => ({ ...prev, [cardId]: [] }));
  }

  function toggleVoice() {
    setVoiceEnabled((prev) => {
      if (prev) {
        speech.stop();
      } else {
        speech.speak(cardToSpeechText(cards[index]));
      }
      return !prev;
    });
  }

  function openChat() {
    speech.stop();
    setChatVisible(true);
  }

  if (finished) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <AnimatedMascot size={120} motion="celebrate" propIcon={TrophyIcon} />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Lesson complete</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            You made it through {lesson.title}.
          </Text>
          {progress.streak > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: accentTint, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
              <TrophyIcon size={16} color={accentColor} />
              <Text style={[typography.bodySmall, { color: accentColor }]}>{progress.streak}-day learning streak</Text>
            </View>
          )}
        </View>
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {hasVideo && <Button label="Watch Video Again" variant="secondary" onPress={watchVideoAgain} />}
          <Button label="Back to Path" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <CloseButton onPress={() => router.back()} />
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          {!showQuiz && (
            <Pressable
              onPress={openChat}
              hitSlop={8}
              accessibilityLabel="Ask about this lesson"
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.pill,
                backgroundColor: color.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon size={17} color={color.textPrimary} />
            </Pressable>
          )}
          {!showQuiz && (
            <ToggleChip icon={WaveformIcon} active={voiceEnabled} onPress={toggleVoice} activeLabel="Listening" inactiveLabel="Listen" />
          )}
        </View>
        {!showQuiz && <LessonStoryProgress total={cards.length} current={index} accentColor={accentColor} />}
      </View>

      {showQuiz && lesson.quiz ? (
        <LessonQuizView
          quiz={lesson.quiz}
          lessonId={lesson.id}
          accentColor={accentColor}
          accentTint={accentTint}
          onFinish={finishLesson}
          onWatchVideoAgain={hasVideo ? watchVideoAgain : undefined}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            contentOffset={{ x: initialIndexRef.current * width, y: 0 }}
            style={{ flex: 1 }}
          >
            {cards.map((card, cardIndex) => (
              <View key={card.id} style={{ width, padding: spacing.lg }}>
                <LessonCardView
                  card={card}
                  accentColor={accentColor}
                  accentTint={accentTint}
                  quizSelection={quizSelections[card.id]}
                  onSelectQuiz={(i) => setQuizSelections((prev) => ({ ...prev, [card.id]: i }))}
                  reflectionValue={reflectionText}
                  onChangeReflection={setReflectionText}
                  scenarioSelection={scenarioSelections[card.id]}
                  onSelectScenario={(i) => setScenarioSelections((prev) => ({ ...prev, [card.id]: i }))}
                  sequenceOrder={sequenceOrders[card.id] ?? []}
                  onTapSequenceItem={(originalIndex) => tapSequenceItem(card.id, originalIndex)}
                  onResetSequence={() => resetSequence(card.id)}
                  isActiveCard={cardIndex === index}
                  onVideoEnded={handleVideoEnded}
                  onVideoPlay={isAcceptanceLesson ? handleVideoPlay : undefined}
                  onVideoPause={isAcceptanceLesson ? handleVideoPause : undefined}
                />
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg }}>
            <Pressable
              onPress={() => (index === 0 ? router.back() : goToIndex(index - 1))}
              style={{
                width: 48,
                height: 48,
                borderRadius: radii.pill,
                backgroundColor: color.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeftIcon size={18} color={color.textPrimary} />
            </Pressable>
            <Button
              label={isLast ? (hasQuiz ? 'Continue to Quiz' : 'Finish Lesson') : 'Continue'}
              onPress={() => (isLast ? (hasQuiz ? setShowQuiz(true) : finishLesson()) : goToIndex(index + 1))}
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}

      <LessonChatSheet
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        lesson={lesson}
        currentCardIndex={index}
        accentColor={accentColor}
        familyContext={familyContext}
        therapistMode={preferences.therapistMode}
        noteInteraction={blueprint.noteInteraction}
        noteSafetyEvent={blueprint.noteSafetyEvent}
      />

      <ConfirmDialog
        visible={showInterventionStart}
        title="Starting Your 4-Week Program"
        message="This works alongside a 28-day (4 week) program — a new suggested lesson each day in Courses, with check-in assessments at Day 14 and Day 28 to track progress. Ready to begin?"
        confirmLabel="Let's Begin"
        cancelLabel="Not Yet"
        onConfirm={confirmInterventionStart}
        onCancel={() => setShowInterventionStart(false)}
      />

      {isAcceptanceLesson && (
        <>
          <CameraConsentPrompt visible={showConsentPrompt} onEnable={handleEnableSensing} onDecline={handleDeclineSensing} />
          <CaregiverCheckInPrompt visible={showReflectionPrompt} onRespond={handleReflectionResponse} onSkip={handleReflectionSkip} />

          {/* Visible sensing indicator (Stage 6 §3) — no live self-view preview is rendered (camera.containerRef is intentionally never attached to the DOM here), matching "indicator, not a live video" for lesson use. */}
          {sensingConsent === 'enabled' && camera.cameraStatus === 'active' && (
            <View
              style={{
                position: 'absolute',
                top: spacing.md,
                right: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                backgroundColor: color.surface,
                borderRadius: radii.pill,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.success }} />
              <Text style={[typography.caption, { color: color.textSecondary }]}>Sensing active</Text>
            </View>
          )}

          {/* Researcher-only diagnostic strip (Stage 6 §12, expanded per this turn's request) — reuses the existing researcher-mode flag from Preferences rather than inventing a new gate; never shown in the normal caregiver experience. One labeled line per requested field, no inferred/ambiguous combined states. */}
          {preferences.researchMode === 'test' && sensingConsent === 'enabled' && (
            <View
              style={{
                position: 'absolute',
                bottom: spacing.md,
                left: spacing.md,
                right: spacing.md,
                backgroundColor: color.surface,
                borderRadius: radii.md,
                padding: spacing.sm,
                gap: 2,
              }}
            >
              <Text style={[typography.caption, { color: color.textPrimary, fontWeight: '700' }]}>
                OpenFace diagnostic (researcher only) — checkpoint: {ACCEPTANCE_CHECKPOINT_ID}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>Camera connection: {camera.cameraStatus}</Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>Sensing mode: {sensingState?.mode ?? 'none'}</Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Baseline validity: {!sensingState?.baselineWindow ? 'collecting...' : sensingState.baselineVector ? 'valid' : 'invalid'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Valid-face %:{' '}
                {sensingState?.mode === 'ACTIVE' || sensingState?.mode === 'PAUSED'
                  ? sensingState?.activeWindow
                    ? `${(sensingState.activeWindow.validFaceCoverage * 100).toFixed(0)}% (active window)`
                    : 'n/a'
                  : sensingState?.baselineWindow
                    ? `${(sensingState.baselineWindow.validFaceCoverage * 100).toFixed(0)}% (baseline)`
                    : 'n/a'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Distance score: {sensingState?.distanceScore !== null && sensingState?.distanceScore !== undefined ? sensingState.distanceScore.toFixed(3) : 'n/a'}
                {'  ·  '}Threshold (experimental): {SENSING_CONFIG.distanceThreshold.toFixed(2)}
                {'  ·  '}Persistence: {SENSING_CONFIG.persistenceDurationSec}s
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Trigger candidate (live): {sensingState?.trigger.triggerCandidate ? 'TRUE' : 'FALSE'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Trigger latched this checkpoint: {triggerOccurredThisCheckpoint ? 'TRUE' : 'FALSE'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Reflection prompt pending: {triggerOccurredThisCheckpoint && !checkpointResult?.promptShown ? 'TRUE (will show at video end)' : 'FALSE'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Reflection prompt shown: {checkpointResult?.promptShown ? 'TRUE' : 'FALSE'}
              </Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Caregiver response:{' '}
                {checkpointResult?.userReportedState === null || checkpointResult?.userReportedState === undefined
                  ? 'not yet answered'
                  : checkpointResult.userReportedState === 'skipped'
                    ? 'skipped'
                    : `answered: ${checkpointResult.userReportedState}`}
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
