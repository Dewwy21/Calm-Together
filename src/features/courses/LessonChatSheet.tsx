import React, { useRef, useState } from 'react';
import { Modal, View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { CloseButton, Chip } from '../../components/ui';
import { Mascot } from '../../components/Mascot';
import { ReflectionMessage } from '../logEvent/types';
import { MessageBubble, ThinkingBubble } from '../reflection/MessageBubble';
import { generateLessonChatReply } from '../ai/lessonChatEngine';
import { createId } from '../logEvent/eventStorage';
import { FamilyContextInput } from '../ai/familyContext';
import { BlueprintSourceType } from '../blueprint/types';
import { SafetyCategory } from '../aiEngine/types';
import { Lesson } from './types';

const QUICK_ACTIONS = ['Ask a question', 'Clarify this', 'Give me an example', 'How does this apply to my family?'] as const;

interface LessonChatSheetProps {
  visible: boolean;
  onClose: () => void;
  lesson: Lesson;
  currentCardIndex: number;
  accentColor: string;
  familyContext: FamilyContextInput;
  therapistMode: boolean;
  noteInteraction: (sourceType: BlueprintSourceType, summary: string) => Promise<void>;
  noteSafetyEvent: (sourceType: BlueprintSourceType, category: Exclude<SafetyCategory, 'none'>) => void;
}

// A Modal, not a route — opening this must never lose the lesson player's
// swipe position, satisfying "at any point during a lesson" without
// navigating away from the card the caregiver is on. Chat history is
// ephemeral (reset whenever this closes and reopens); the Family Blueprint
// still gets a durable takeaway via one noteInteraction call on close,
// rather than one per turn, since this is meant to be opened many times
// within a single lesson.
export function LessonChatSheet({
  visible,
  onClose,
  lesson,
  currentCardIndex,
  accentColor,
  familyContext,
  therapistMode,
  noteInteraction,
  noteSafetyEvent,
}: LessonChatSheetProps) {
  const { color, spacing, typography, radii } = useTheme();
  const [messages, setMessages] = useState<ReflectionMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  function summarizeForBlueprint(finalMessages: ReflectionMessage[]): string {
    const lines = finalMessages.map((m) => `${m.role === 'assistant' ? 'AI' : 'Caregiver'}: ${m.text}`);
    return `Asked the AI about the lesson "${lesson.title}":\n${lines.join('\n')}`;
  }

  function handleClose() {
    if (messages.length > 0) {
      noteInteraction('lessonChat', summarizeForBlueprint(messages));
    }
    setMessages([]);
    setInputText('');
    onClose();
  }

  async function handleSend(text?: string) {
    const trimmed = (text ?? inputText).trim();
    if (!trimmed || isThinking) return;

    const userMessage: ReflectionMessage = { id: createId(), role: 'user', text: trimmed, createdAtISO: new Date().toISOString() };
    const historyForEngine = messages.map((m) => ({ role: m.role, content: m.text }));
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    const response = await generateLessonChatReply(lesson, currentCardIndex, historyForEngine, trimmed, familyContext, therapistMode);

    if (response.isSafetyEvent && response.safetyCategory !== 'none') {
      noteSafetyEvent('lessonChat', response.safetyCategory);
    }

    const assistantMessage: ReflectionMessage = {
      id: createId(),
      role: 'assistant',
      text: response.text,
      createdAtISO: new Date().toISOString(),
      framework: response.framework,
      showsDisclaimer: response.includeDisclaimer,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsThinking(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  function handleQuickAction(action: (typeof QUICK_ACTIONS)[number]) {
    if (action === 'Ask a question') {
      inputRef.current?.focus();
      return;
    }
    handleSend(action);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm }}>
          <Mascot size={32} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>Ask about this lesson</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]} numberOfLines={1}>
              {lesson.title}
            </Text>
          </View>
          <CloseButton onPress={handleClose} accessibilityLabel="Close lesson chat" />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}>
            {messages.length === 0 && (
              <Text style={[typography.body, { color: color.textSecondary }]}>
                Ask anything about this lesson — a question, a request for clarification, an example, or how it applies to your family.
              </Text>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isThinking && <ThinkingBubble />}

            {messages.length === 0 && !isThinking && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
                {QUICK_ACTIONS.map((action) => (
                  <Chip key={action} label={action} active={false} onPress={() => handleQuickAction(action)} />
                ))}
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, alignItems: 'flex-end' }}>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about this lesson..."
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
              onPress={() => handleSend()}
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.pill,
                backgroundColor: accentColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: color.textOnPrimary, fontSize: 18 }}>→</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
