import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, BackButton } from '../../../../src/components/ui';
import { PencilIcon } from '../../../../src/components/icons';
import { BUILT_IN_DECKS } from '../../../../src/features/connect/conversationCardsData';
import { useConversationCardsContext } from '../../../../src/features/connect/ConversationCardsProvider';

export default function ConversationDecksScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const { allDecks } = useConversationCardsContext();

  const builtInIds = new Set(BUILT_IN_DECKS.map((d) => d.id));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>My Decks</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {allDecks.map((deck) => {
          const isCustom = !builtInIds.has(deck.id);
          return (
            <Pressable
              key={deck.id}
              onPress={() => router.push(`/(modals)/connect/conversation-cards?deckId=${deck.id}`)}
              style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: 4 }, shadows.card]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[typography.h3, { color: color.textPrimary, flex: 1 }]}>{deck.name}</Text>
                {isCustom && (
                  <Pressable
                    onPress={() => router.push(`/(modals)/connect/conversation-cards/deck-form?deckId=${deck.id}`)}
                    hitSlop={8}
                  >
                    <PencilIcon size={18} color={color.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{deck.description}</Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>{deck.questionIds.length} cards</Text>
            </Pressable>
          );
        })}

        <Button label="+ Create Deck" variant="secondary" onPress={() => router.push('/(modals)/connect/conversation-cards/deck-form?deckId=new')} />
      </ScrollView>
    </SafeAreaView>
  );
}
