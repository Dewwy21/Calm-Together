import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, ToggleChip, CloseButton } from '../../src/components/ui';
import { AnimatedMascot, MASCOT_POSES } from '../../src/components/Mascot';
import { WaveformIcon } from '../../src/components/icons';
import { useDenContext } from '../../src/features/den/DenProvider';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { useFamilyContextInput } from '../../src/features/ai/useFamilyContextInput';
import { useBlueprintContext } from '../../src/features/blueprint/BlueprintProvider';
import { ReflectionMessage } from '../../src/features/logEvent/types';
import { generateInitialReflection, generateReflectionReply } from '../../src/features/ai/aiReflectionEngine';
import { eventTypeReflectionTitle, resolveSuggestion } from '../../src/features/reflection/reflectionSuggestions';
import { MessageBubble, ThinkingBubble } from '../../src/features/reflection/MessageBubble';
import { useSpeech } from '../../src/features/voice/useSpeech';
import { createId } from '../../src/features/logEvent/eventStorage';
import { SafetyTriggeredError } from '../../src/features/aiEngine/safetyError';
import { getSafetyResponse } from '../../src/features/aiEngine/safetyTriage';
import { handleComposerKeyPress } from '../../src/utils/composerKeyPress';

const HERO_IMAGE = require('../../assets/calm/bridge.jpg');

export default function ReflectionScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const den = useDenContext();
  const { preferences } = usePreferencesContext();
  const familyContext = useFamilyContextInput();
  const { noteInteraction, noteSafetyEvent } = useBlueprintContext();
  const scrollRef = useRef<ScrollView>(null);
  const speech = useSpeech();

  const event = den.events.find((e) => e.id === eventId);

  const [messages, setMessages] = useState<ReflectionMessage[]>(event?.reflection?.messages ?? []);
  const [savedMessageCount, setSavedMessageCount] = useState(messages.length);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'safety'>(
    event?.reflection?.messages.length ? 'ready' : 'loading'
  );
  const [safetyText, setSafetyText] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Every log gets exactly one AI Reflection, generated the first time this
  // screen opens for it (not eagerly at save time — that would mean a real
  // API call blocking the Daily Log save flow). Once generated, it's saved
  // onto the event, so revisiting this screen never regenerates it.
  useEffect(() => {
    if (!event || event.reflection?.messages.length) return;
    let cancelled = false;
    setStatus('loading');
    generateInitialReflection(event, familyContext, preferences.therapistMode)
      .then((response) => {
        if (cancelled) return;
        const message: ReflectionMessage = {
          id: createId(),
          role: 'assistant',
          text: response.reply,
          createdAtISO: new Date().toISOString(),
          framework: response.framework,
          showsDisclaimer: response.includeDisclaimer,
        };
        setMessages([message]);
        setSavedMessageCount(1);
        setStatus('ready');
        den.updateEvent(event.id, { ...event, reflection: { messages: [message], savedAtISO: new Date().toISOString() } });
        const loggedSummary = event.eventType === 'positiveMoment' ? event.meaningfulMoment : event.whatHappened;
        noteInteraction('aiReflection', `Reflected on a logged ${event.eventType}: ${loggedSummary}\n\nReflection given: ${response.reply}`);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof SafetyTriggeredError) {
          setSafetyText(getSafetyResponse(err.category).text);
          setStatus('safety');
          noteSafetyEvent('dailyLog', err.category);
          return;
        }
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, attempt]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!voiceEnabled) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) speech.speak(lastAssistant.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled, messages]);

  function toggleVoice() {
    setVoiceEnabled((prev) => {
      if (prev) speech.stop();
      return !prev;
    });
  }

  async function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || !event) return;
    const userMessage: ReflectionMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
      createdAtISO: new Date().toISOString(),
    };
    const historyForEngine = messages.map((m) => ({ role: m.role, content: m.text }));
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await generateReflectionReply(event.eventType, historyForEngine, trimmed, familyContext, preferences.therapistMode);
      const assistantMessage: ReflectionMessage = {
        id: createId(),
        role: 'assistant',
        text: response.reply,
        createdAtISO: new Date().toISOString(),
        framework: response.framework,
        showsDisclaimer: response.includeDisclaimer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof SafetyTriggeredError) {
        const text = getSafetyResponse(err.category).text;
        setMessages((prev) => [...prev, { id: createId(), role: 'assistant', text, createdAtISO: new Date().toISOString() }]);
        noteSafetyEvent('aiReflection', err.category);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'assistant',
            text: "I'm having a little trouble connecting right now. Mind trying that again in a moment?",
            createdAtISO: new Date().toISOString(),
          },
        ]);
      }
    }
    setIsThinking(false);
  }

  function handleSaveReflection() {
    if (!event) return;
    den.updateEvent(event.id, { ...event, reflection: { messages, savedAtISO: new Date().toISOString() } });
    setSavedMessageCount(messages.length);
  }

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Entry not found</Text>
        <Button label="Return Home" onPress={() => router.replace('/den')} />
      </SafeAreaView>
    );
  }

  const hasUnsavedFollowUps = messages.length > savedMessageCount;
  const suggestion = resolveSuggestion(event, den.events);
  const suggestionHref = suggestion?.href ?? '/(modals)/calm-corner';
  const isDifficult = event.eventType !== 'positiveMoment' && event.intensity >= 7;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ height: 110 }}>
        <Image source={HERO_IMAGE} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20,15,10,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.h1, { color: '#fff', textAlign: 'center' }]}>
            {eventTypeReflectionTitle(event.eventType)}
          </Text>
        </View>
        <View style={{ position: 'absolute', top: spacing.sm, right: spacing.lg }}>
          <CloseButton onDark onPress={() => router.replace('/den')} />
        </View>
      </View>
      <View
        style={[
          {
            alignSelf: 'center',
            marginTop: -28,
            width: 56,
            height: 56,
            borderRadius: radii.pill,
            backgroundColor: color.surface,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadows.card,
        ]}
      >
        <AnimatedMascot size={44} motion={isDifficult ? 'encourage' : event.eventType === 'positiveMoment' ? 'celebrate' : 'idle'} />
      </View>

      {status === 'loading' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AnimatedMascot size={90} motion={MASCOT_POSES.thinking.motion} propIcon={MASCOT_POSES.thinking.propIcon} />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            Putting together a reflection on this...
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            I'm having trouble putting a reflection together right now. Your entry is already saved — mind trying again?
          </Text>
          <Button label="Try Again" onPress={() => setAttempt((n) => n + 1)} />
          <Button label="Return Home" variant="ghost" onPress={() => router.replace('/den')} />
        </View>
      )}

      {status === 'safety' && safetyText && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={[typography.body, { color: color.textPrimary }]}>{safetyText}</Text>
          <Button label="Return Home" variant="secondary" onPress={() => router.replace('/den')} />
        </ScrollView>
      )}

      {status === 'ready' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center' }}
          >
            <ToggleChip
              icon={WaveformIcon}
              active={voiceEnabled}
              onPress={toggleVoice}
              activeLabel="Voice on"
              inactiveLabel="Read aloud"
            />

            {messages.map((message, i) => (
              <React.Fragment key={message.id}>
                <MessageBubble message={message} />
                {i === 0 && (
                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    <Button
                      label={hasUnsavedFollowUps ? 'Save conversation' : 'Conversation saved'}
                      variant="secondary"
                      disabled={!hasUnsavedFollowUps}
                      onPress={handleSaveReflection}
                    />
                    <Button
                      label={suggestion ? `Try: ${suggestion.title}` : 'Explore Calm Corner'}
                      variant="secondary"
                      onPress={() => router.push(suggestionHref)}
                    />
                    {(event.eventType === 'meltdown' || event.eventType === 'parentReaction') && (
                      <Button
                        label="Replay This Moment"
                        variant="secondary"
                        onPress={() => router.push(`/(modals)/parent-replay/${event.id}`)}
                      />
                    )}
                    <Button label="Return Home" variant="ghost" onPress={() => router.replace('/den')} />
                  </View>
                )}
              </React.Fragment>
            ))}

            {isThinking && <ThinkingBubble />}
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              padding: spacing.lg,
              alignItems: 'flex-end',
              maxWidth: 560,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onKeyPress={(e) => handleComposerKeyPress(e, handleSend)}
              placeholder="Ask a follow-up or add a thought..."
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
                borderRadius: 22,
                backgroundColor: color.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: color.textOnPrimary, fontSize: 18 }}>→</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
