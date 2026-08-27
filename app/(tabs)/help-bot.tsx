import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { ToggleChip, Chip, ConfirmDialog } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { WaveformIcon, MicrophoneIcon, ChatIcon, ArrowRightIcon, LanternIcon, PlusIcon, MenuListIcon, HandsIcon } from '../../src/components/icons';
import { useHelpBotContext } from '../../src/features/helpBot/HelpBotProvider';
import { HelpBotMessageBubble } from '../../src/features/helpBot/HelpBotMessageBubble';
import { HelpBotIntro } from '../../src/features/helpBot/HelpBotIntro';
import { ThinkingBubble } from '../../src/features/reflection/MessageBubble';
import { useSpeech } from '../../src/features/voice/useSpeech';
import { CurrentChildBadge } from '../../src/features/profiles/CurrentChildBadge';
import { handleComposerKeyPress } from '../../src/utils/composerKeyPress';

export default function HelpBotScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { messages, isThinking, sendMessage, currentConversation, startNewConversation } = useHelpBotContext();
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showMicNotice, setShowMicNotice] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const speech = useSpeech();

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

  function handleSend(text?: string) {
    const toSend = (text ?? inputText).trim();
    if (!toSend) return;
    sendMessage(toSend);
    setInputText('');
  }

  function handleMicPress() {
    setShowMicNotice(true);
  }

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies = !isThinking && lastMessage?.role === 'assistant' && !!lastMessage.quickReplies?.length;

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          <Mascot size={40} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.h2, { color: color.textPrimary }]} numberOfLines={1}>
              {currentConversation?.title ?? 'Help Bot'}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Your otter companion, always here for you</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable
            onPress={startNewConversation}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.pill,
              backgroundColor: color.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon size={18} color={color.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(modals)/help-bot/conversations')}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.pill,
              backgroundColor: color.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MenuListIcon size={17} color={color.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(modals)/family-blueprint')}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.pill,
              backgroundColor: color.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LanternIcon size={17} color={color.textPrimary} />
          </Pressable>
          <CurrentChildBadge />
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Pressable
          onPress={() => router.push('/(modals)/simulator')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: color.surface,
              borderRadius: radii.lg,
              padding: spacing.md,
            },
            shadows.card,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              backgroundColor: color.primaryTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatIcon size={20} color={color.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>Practice a Conversation</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Rehearse a tough moment with an AI child first</Text>
          </View>
          <ArrowRightIcon size={16} color={color.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/(modals)/act-coach')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: color.surface,
              borderRadius: radii.lg,
              padding: spacing.md,
              marginTop: spacing.sm,
            },
            shadows.card,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              backgroundColor: color.accentTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HandsIcon size={20} color={color.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>ACT Parenting Coach</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Get an ACT-based read on what's going on right now</Text>
          </View>
          <ArrowRightIcon size={16} color={color.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}>
          <ToggleChip
            icon={WaveformIcon}
            active={voiceEnabled}
            onPress={toggleVoice}
            activeLabel="Voice on"
            inactiveLabel="Read aloud"
          />

          {messages.length === 0 ? (
            <HelpBotIntro onPromptPress={(prompt) => handleSend(prompt)} />
          ) : (
            messages.map((message) => <HelpBotMessageBubble key={message.id} message={message} />)
          )}

          {isThinking && <ThinkingBubble />}

          {showQuickReplies && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginLeft: 28 + spacing.xs }}>
              {lastMessage.quickReplies!.map((reply) => (
                <Chip key={reply} label={reply} active={false} onPress={() => handleSend(reply)} />
              ))}
            </View>
          )}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            padding: spacing.lg,
            alignItems: 'flex-end',
          }}
        >
          <Pressable
            onPress={handleMicPress}
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.pill,
              backgroundColor: color.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MicrophoneIcon size={20} color={color.textSecondary} />
          </Pressable>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onKeyPress={(e) => handleComposerKeyPress(e, () => handleSend())}
            placeholder="Talk to the otter..."
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
              backgroundColor: color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: color.textOnPrimary, fontSize: 18 }}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showMicNotice}
        title="Voice input"
        message="Talking to the otter out loud is coming soon. For now, typing works great."
        confirmLabel="Got it"
        onConfirm={() => setShowMicNotice(false)}
      />
    </View>
  );
}
