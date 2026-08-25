import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, BackButton, ConfirmDialog, Chip } from '../../../../src/components/ui';
import { CheckIcon } from '../../../../src/components/icons';
import { CONVERSATION_CATEGORIES, ConversationCategory } from '../../../../src/features/connect/conversationCardsData';
import { useConversationCardsContext } from '../../../../src/features/connect/ConversationCardsProvider';

export default function DeckFormScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const isNew = deckId === 'new';
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const { allDecks, visibleQuestions, addDeck, updateDeck, deleteDeck } = useConversationCardsContext();

  const existing = !isNew ? allDecks.find((d) => d.id === deckId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existing?.questionIds ?? []));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ConversationCategory | 'All'>('All');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visibleQuestions
      .filter((q) => category === 'All' || q.category === category)
      .filter((q) => !query || q.text.toLowerCase().includes(query));
  }, [visibleQuestions, category, search]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canSave = name.trim().length > 0 && selectedIds.size > 0;

  function handleSave() {
    if (!canSave) return;
    const input = { name: name.trim(), description: description.trim(), questionIds: Array.from(selectedIds) };
    if (isNew) {
      addDeck(input);
    } else if (existing) {
      updateDeck(existing.id, input);
    }
    router.back();
  }

  function handleDelete() {
    if (existing) deleteDeck(existing.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>{isNew ? 'Create Deck' : 'Edit Deck'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Deck name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sunday Drives"
            placeholderTextColor={color.textSecondary}
            style={{
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Description (optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's this deck for?"
            placeholderTextColor={color.textSecondary}
            style={{
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Cards in this deck ({selectedIds.size} selected)</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions..."
            placeholderTextColor={color.textSecondary}
            style={{
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            <Chip label="All" active={category === 'All'} onPress={() => setCategory('All')} />
            {CONVERSATION_CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>

          <View style={{ gap: spacing.sm }}>
            {filtered.map((q) => {
              const selected = selectedIds.has(q.id);
              return (
                <Pressable
                  key={q.id}
                  onPress={() => toggleSelected(q.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    backgroundColor: selected ? color.primaryTint : color.surface,
                    borderRadius: radii.md,
                    padding: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: radii.sm,
                      backgroundColor: selected ? color.primary : color.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected && <CheckIcon size={13} color={color.textOnPrimary} />}
                  </View>
                  <Text style={[typography.body, { color: color.textPrimary, flex: 1 }]}>{q.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button label={isNew ? 'Create Deck' : 'Save Changes'} onPress={handleSave} disabled={!canSave} />

        {!isNew && existing && (
          <Button label="Delete Deck" variant="ghost" textColor={color.warning} onPress={() => setConfirmingDelete(true)} />
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this deck?"
        message="The questions themselves stay, only this deck goes away."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </SafeAreaView>
  );
}
