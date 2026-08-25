import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { BackButton, Chip } from '../../../../src/components/ui';
import { HeartIcon, EyeOffIcon } from '../../../../src/components/icons';
import { CONVERSATION_CATEGORIES, ConversationCategory, ConversationQuestion } from '../../../../src/features/connect/conversationCardsData';
import { useConversationCardsContext } from '../../../../src/features/connect/ConversationCardsProvider';

type Tab = 'all' | 'favorites' | 'recent' | 'hidden';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'recent', label: 'Recently Used' },
  { key: 'hidden', label: 'Hidden' },
];

export default function BrowseConversationCardsScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const { visibleQuestions, favoriteQuestions, recentlyUsedQuestions, hiddenQuestions, isFavorite, isHidden, toggleFavorite, toggleHidden } =
    useConversationCardsContext();

  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ConversationCategory | 'All'>('All');

  const baseList: ConversationQuestion[] =
    tab === 'favorites' ? favoriteQuestions : tab === 'recent' ? recentlyUsedQuestions : tab === 'hidden' ? hiddenQuestions : visibleQuestions;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return baseList
      .filter((q) => category === 'All' || q.category === category)
      .filter((q) => !query || q.text.toLowerCase().includes(query) || q.category.toLowerCase().includes(query));
  }, [baseList, category, search]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Browse Cards</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
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
          {TABS.map((t) => (
            <Chip key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <Chip label="All" active={category === 'All'} onPress={() => setCategory('All')} />
          {CONVERSATION_CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] }]}>
          Nothing here yet.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
          {filtered.map((q) => (
            <View
              key={q.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: color.surface,
                borderRadius: radii.lg,
                padding: spacing.md,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>{q.category.toUpperCase()}</Text>
                <Text style={[typography.body, { color: color.textPrimary }]}>{q.text}</Text>
                {q.note && <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>{q.note}</Text>}
              </View>
              <Pressable onPress={() => toggleFavorite(q.id)} hitSlop={8}>
                <HeartIcon size={20} color={isFavorite(q.id) ? color.warning : color.textSecondary} filled={isFavorite(q.id)} />
              </Pressable>
              <Pressable onPress={() => toggleHidden(q.id)} hitSlop={8}>
                <EyeOffIcon size={20} color={isHidden(q.id) ? color.primary : color.textSecondary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
