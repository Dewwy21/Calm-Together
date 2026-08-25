import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, CloseButton, SpeechBubble } from '../../../../src/components/ui';
import { useTheme } from '../../../../src/theme';
import { Mascot } from '../../../../src/components/Mascot';
import { HeartIcon, EyeOffIcon, CardsIcon, PencilIcon } from '../../../../src/components/icons';
import { CONVERSATION_CATEGORIES, ConversationCategory } from '../../../../src/features/connect/conversationCardsData';
import { useConversationCardsContext } from '../../../../src/features/connect/ConversationCardsProvider';

type CategoryFilter = ConversationCategory | 'All';

export default function ConversationCardsScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const { pickSession, isFavorite, toggleFavorite, toggleHidden, markUsed, allDecks } = useConversationCardsContext();

  const [category, setCategory] = useState<CategoryFilter>('All');
  const [session, setSession] = useState(() => pickSession(deckId ? { deckId } : undefined));
  const [index, setIndex] = useState(0);

  const activeDeck = deckId ? allDecks.find((d) => d.id === deckId) : undefined;

  useEffect(() => {
    if (session[index]) markUsed(session[index].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, index]);

  const question = session[index];
  const isLastInSession = session.length === 0 || index === session.length - 1;

  function newSession(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    setSession(pickSession(nextCategory === 'All' ? undefined : { category: nextCategory }));
    setIndex(0);
  }

  function refreshSession() {
    setSession(pickSession(deckId ? { deckId } : category === 'All' ? undefined : { category }));
    setIndex(0);
  }

  function nextQuestion() {
    if (isLastInSession) {
      refreshSession();
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
        }}
      >
        <Text style={[typography.h1, { color: color.textPrimary }]}>{activeDeck ? activeDeck.name : 'Conversation Cards'}</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg, flexGrow: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
          <Mascot size={56} />
          <View style={{ flex: 1 }}>
            <SpeechBubble text={activeDeck ? activeDeck.description : 'Five questions, picked fresh. No right answers, just a way in.'} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/(modals)/connect/conversation-cards/decks')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.surface, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
          >
            <CardsIcon size={16} color={color.textPrimary} />
            <Text style={[typography.bodySmall, { color: color.textPrimary }]}>My Decks</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(modals)/connect/conversation-cards/create')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.surface, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
          >
            <PencilIcon size={16} color={color.textPrimary} />
            <Text style={[typography.bodySmall, { color: color.textPrimary }]}>New Card</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(modals)/connect/conversation-cards/browse')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.surface, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
          >
            <Text style={[typography.bodySmall, { color: color.textPrimary }]}>Browse All</Text>
          </Pressable>
        </View>

        {!activeDeck && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Chip label="All" active={category === 'All'} onPress={() => newSession('All')} />
            {CONVERSATION_CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => newSession(c)} />
            ))}
          </View>
        )}

        {!question ? (
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>
            {activeDeck ? "This deck doesn't have any visible cards right now." : 'No questions match right now.'}
          </Text>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', gap: spacing.xl }}>
            <Card variant="hero" backgroundColor={color.secondaryTint} style={{ gap: spacing.md, minHeight: 180, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>{question.category.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <Pressable onPress={() => toggleFavorite(question.id)} hitSlop={8}>
                    <HeartIcon size={20} color={isFavorite(question.id) ? color.warning : color.textSecondary} filled={isFavorite(question.id)} />
                  </Pressable>
                  <Pressable onPress={() => toggleHidden(question.id)} hitSlop={8}>
                    <EyeOffIcon size={20} color={color.textSecondary} />
                  </Pressable>
                </View>
              </View>
              <Text style={[typography.h2, { color: color.textPrimary }]}>{question.text}</Text>
              {question.note && (
                <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>{question.note}</Text>
              )}
            </Card>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
              {session.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: radii.pill,
                    backgroundColor: i === index ? color.primary : color.border,
                  }}
                />
              ))}
            </View>

            <Button label={isLastInSession ? 'New set of 5' : 'Next question'} onPress={nextQuestion} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
