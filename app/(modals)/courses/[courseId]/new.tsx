import React, { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, BackButton, IconBubble } from '../../../../src/components/ui';
import { AnimatedMascot } from '../../../../src/components/Mascot';
import { ChartIcon, ChatIcon, SwirlIcon, PencilIcon, IconProps } from '../../../../src/components/icons';
import { useDenContext } from '../../../../src/features/den/DenProvider';
import { useProfilesContext } from '../../../../src/features/profiles/ProfilesProvider';
import { useCalmCornerContext } from '../../../../src/features/calmCorner/CalmCornerProvider';
import { useFamilyContextInput } from '../../../../src/features/ai/useFamilyContextInput';
import { getDetectedPatterns } from '../../../../src/features/patterns/patternDetection';
import { DetectedPattern } from '../../../../src/features/patterns/types';
import { usePersonalizedLessonsContext } from '../../../../src/features/personalizedLessons/PersonalizedLessonsProvider';
import { loadAllHelpBotMessages } from '../../../../src/features/helpBot/helpBotStorage';
import { generatePersonalizedLesson } from '../../../../src/features/ai/generatePersonalizedLesson';
import {
  listDailyLogSourceOptions,
  buildDailyLogSituationDescription,
  groupHelpBotConversationsByDay,
  buildHelpBotSituationDescription,
  buildPatternSituationDescription,
  buildPatternTopicSituationDescription,
  buildManualTopicSituationDescription,
  HelpBotConversationOption,
} from '../../../../src/features/personalizedLessons/lessonSources';
import { LessonSource } from '../../../../src/features/personalizedLessons/types';
import { useBlueprintContext } from '../../../../src/features/blueprint/BlueprintProvider';
import { SafetyTriggeredError } from '../../../../src/features/aiEngine/safetyError';
import { getSafetyResponse } from '../../../../src/features/aiEngine/safetyTriage';

type SourceType = 'dailyLog' | 'helpBot' | 'pattern' | 'manual';
type Step = 'chooseSource' | 'chooseItem' | 'generating' | 'error' | 'safety';

const SOURCE_OPTIONS: { type: SourceType; label: string; description: string; icon: ComponentType<IconProps> }[] = [
  { type: 'dailyLog', label: 'A Daily Log Entry', description: 'Build a lesson around something you logged.', icon: ChartIcon },
  { type: 'helpBot', label: 'A Help Bot Conversation', description: 'Build on something you talked through with the otter.', icon: ChatIcon },
  { type: 'pattern', label: 'A Recurring Pattern', description: 'Build a lesson around a trend we noticed in your logs.', icon: SwirlIcon },
  { type: 'manual', label: 'A Topic I Choose', description: 'Type in whatever you want a lesson on.', icon: PencilIcon },
];

export default function NewPersonalizedLessonScreen() {
  const params = useLocalSearchParams<{ sourceType?: string; topic?: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const den = useDenContext();
  const { currentChildId } = useProfilesContext();
  const calmCorner = useCalmCornerContext();
  const familyContext = useFamilyContextInput();
  const personalized = usePersonalizedLessonsContext();
  const { noteSafetyEvent } = useBlueprintContext();

  // Deterministic only — no need for the AI interpretation layer just to
  // list pattern titles/summaries here, that would be a wasted API call.
  const patterns = useMemo(() => getDetectedPatterns(den.events, calmCorner.usageLog), [den.events, calmCorner.usageLog]);

  const [step, setStep] = useState<Step>('chooseSource');
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [manualTopic, setManualTopic] = useState('');
  const [helpBotConversations, setHelpBotConversations] = useState<HelpBotConversationOption[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [safetyText, setSafetyText] = useState<string | null>(null);
  const [pendingGeneration, setPendingGeneration] = useState<{ source: LessonSource; description: string } | null>(null);

  async function startGeneration(source: LessonSource, description: string) {
    setStep('generating');
    setErrorMessage(null);
    setPendingGeneration({ source, description });
    try {
      const lesson = await generatePersonalizedLesson({ source, situationDescription: description, familyContextInput: familyContext });
      personalized.addLesson(lesson);
      router.replace(`/(modals)/courses/personalized/${lesson.id}`);
    } catch (err) {
      if (err instanceof SafetyTriggeredError) {
        setSafetyText(getSafetyResponse(err.category).text);
        setStep('safety');
        noteSafetyEvent(source.type === 'dailyLog' ? 'dailyLog' : source.type === 'helpBot' ? 'helpBot' : 'lesson', err.category);
        return;
      }
      setErrorMessage("I couldn't build that lesson just now. Mind trying again?");
      setStep('error');
    }
  }

  // Deep-linked straight into generation from a pattern suggestion shown
  // elsewhere (Patterns screen, the personalized course's suggestion cards).
  useEffect(() => {
    if (params.sourceType === 'pattern' && params.topic) {
      startGeneration({ type: 'pattern', label: `Pattern: ${params.topic}` }, buildPatternTopicSituationDescription(params.topic));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sourceType === 'helpBot' && currentChildId && helpBotConversations === null) {
      loadAllHelpBotMessages(currentChildId).then((messages) => {
        setHelpBotConversations(groupHelpBotConversationsByDay(messages));
      });
    }
  }, [sourceType, currentChildId, helpBotConversations]);

  function retry() {
    if (pendingGeneration) startGeneration(pendingGeneration.source, pendingGeneration.description);
  }

  function selectSourceType(type: SourceType) {
    setSourceType(type);
    setStep('chooseItem');
  }

  function selectDailyLogEvent(eventId: string) {
    const event = den.events.find((e) => e.id === eventId);
    if (!event) return;
    startGeneration({ type: 'dailyLog', label: 'From your Daily Log' }, buildDailyLogSituationDescription(event));
  }

  function selectHelpBotConversation(conversation: HelpBotConversationOption) {
    startGeneration({ type: 'helpBot', label: 'From a Help Bot conversation' }, buildHelpBotSituationDescription(conversation));
  }

  function selectPattern(pattern: DetectedPattern) {
    startGeneration({ type: 'pattern', label: `Pattern: ${pattern.title}` }, buildPatternSituationDescription(pattern));
  }

  function submitManualTopic() {
    const trimmed = manualTopic.trim();
    if (!trimmed) return;
    startGeneration({ type: 'manual', label: `Topic: ${trimmed}` }, buildManualTopicSituationDescription(trimmed));
  }

  function goBack() {
    if (step === 'chooseItem') {
      setStep('chooseSource');
      setSourceType(null);
    } else {
      router.back();
    }
  }

  if (step === 'generating' || step === 'error' || step === 'safety') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg }}>
          <BackButton onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          {step === 'generating' && (
            <>
              <AnimatedMascot size={100} motion="sway" />
              <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>Building your lesson...</Text>
              <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>This usually takes a few seconds.</Text>
            </>
          )}
          {step === 'error' && (
            <>
              <AnimatedMascot size={90} motion="idle" />
              <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>{errorMessage}</Text>
              <Button label="Try Again" onPress={retry} />
            </>
          )}
          {step === 'safety' && (
            <>
              <AnimatedMascot size={90} motion="idle" />
              <Text style={[typography.body, { color: color.textPrimary, textAlign: 'center' }]}>{safetyText}</Text>
              <Button label="Back" variant="secondary" onPress={() => router.back()} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={goBack} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>New Lesson</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {step === 'chooseSource' && (
          <>
            <Text style={[typography.body, { color: color.textSecondary }]}>What should this lesson be built from?</Text>
            {SOURCE_OPTIONS.map((option) => (
              <Pressable
                key={option.type}
                onPress={() => selectSourceType(option.type)}
                style={[
                  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md },
                  shadows.card,
                ]}
              >
                <IconBubble icon={option.icon} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: color.textPrimary }]}>{option.label}</Text>
                  <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{option.description}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {step === 'chooseItem' && sourceType === 'dailyLog' && (
          <>
            <Text style={[typography.body, { color: color.textSecondary }]}>Which entry should this lesson focus on?</Text>
            {listDailyLogSourceOptions(den.events).length === 0 ? (
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>No Daily Log entries yet.</Text>
            ) : (
              listDailyLogSourceOptions(den.events).map((option) => (
                <Pressable
                  key={option.eventId}
                  onPress={() => selectDailyLogEvent(option.eventId)}
                  style={[{ backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md, gap: 2 }, shadows.card]}
                >
                  <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{option.label}</Text>
                  <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
                    {option.preview}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}

        {step === 'chooseItem' && sourceType === 'helpBot' && (
          <>
            <Text style={[typography.body, { color: color.textSecondary }]}>Which conversation should this lesson focus on?</Text>
            {helpBotConversations === null ? (
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Loading...</Text>
            ) : helpBotConversations.length === 0 ? (
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>No Help Bot conversations yet.</Text>
            ) : (
              helpBotConversations.map((conversation) => (
                <Pressable
                  key={conversation.dateKey}
                  onPress={() => selectHelpBotConversation(conversation)}
                  style={[{ backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md, gap: 2 }, shadows.card]}
                >
                  <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{conversation.label}</Text>
                  <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
                    {conversation.preview}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}

        {step === 'chooseItem' && sourceType === 'pattern' && (
          <>
            <Text style={[typography.body, { color: color.textSecondary }]}>Which pattern should this lesson focus on?</Text>
            {patterns.length === 0 ? (
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Nothing detected yet — keep logging and check back.</Text>
            ) : (
              patterns.map((pattern) => (
                <Pressable
                  key={pattern.id}
                  onPress={() => selectPattern(pattern)}
                  style={[{ backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md, gap: 2 }, shadows.card]}
                >
                  <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{pattern.title}</Text>
                  <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
                    {pattern.summary}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}

        {step === 'chooseItem' && sourceType === 'manual' && (
          <>
            <Text style={[typography.body, { color: color.textSecondary }]}>What would you like the lesson to be about?</Text>
            <TextInput
              value={manualTopic}
              onChangeText={setManualTopic}
              placeholder="e.g. Getting through grocery store meltdowns"
              placeholderTextColor={color.textSecondary}
              multiline
              style={{
                backgroundColor: color.surface,
                borderRadius: radii.md,
                padding: spacing.md,
                minHeight: 80,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <Button label="Generate Lesson" onPress={submitManualTopic} disabled={!manualTopic.trim()} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
