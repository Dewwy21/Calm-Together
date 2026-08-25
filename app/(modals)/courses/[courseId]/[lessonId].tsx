import React, { useRef, useState } from 'react';
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
import { Button, CloseButton, ToggleChip } from '../../../../src/components/ui';
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

export default function LessonPlayerScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const theme = useTheme();
  const { color, spacing, typography, radii } = theme;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const speech = useSpeech();
  const progress = useCourseProgressContext();
  const personalizedLessons = usePersonalizedLessonsContext();
  const blueprint = useBlueprintContext();
  const familyContext = useFamilyContextInput();
  const { preferences } = usePreferencesContext();

  const course = getCourseById(courseId);
  const lesson = courseId === 'personalized' ? personalizedLessons.getById(lessonId ?? '') : getLessonById(lessonId);
  const cards = lesson?.cards ?? [];

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

  if (!course || !lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Lesson not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const { accentColor, accentTint } = getCourseAccent(theme, course.id);
  const isLast = index === cards.length - 1;

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

  function finishLesson() {
    persistReflectionIfNeeded();
    progress.completeLesson(lesson!.id);
    speech.stop();
    setFinished(true);
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
          <ToggleChip icon={WaveformIcon} active={voiceEnabled} onPress={toggleVoice} activeLabel="Listening" inactiveLabel="Listen" />
        </View>
        <LessonStoryProgress total={cards.length} current={index} accentColor={accentColor} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentOffset={{ x: initialIndexRef.current * width, y: 0 }}
        style={{ flex: 1 }}
      >
        {cards.map((card) => (
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
          label={isLast ? 'Finish Lesson' : 'Continue'}
          onPress={() => (isLast ? finishLesson() : goToIndex(index + 1))}
          style={{ flex: 1 }}
        />
      </View>

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
    </SafeAreaView>
  );
}
