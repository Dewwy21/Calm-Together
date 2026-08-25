import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Chip, CloseButton } from '../../../src/components/ui';
import { ConnectMascotBubble } from '../../../src/features/connect/ConnectMascotBubble';
import { LISTEN_SCRIPTS } from '../../../src/features/connect/listenScriptsData';
import { PARENT_LESSONS, PARENT_LEARNING_CATEGORIES } from '../../../src/features/connect/parentLearningData';

type Collection = 'listen' | 'learning';

const ALL_FILTER = 'All';

const COLLECTION_BUBBLE_TEXT: Record<Collection, string> = {
  listen: 'Good for car rides, before bed, or whenever you want something calm to share.',
  learning: 'Short coaching sessions, just for you, whenever you have a few minutes to yourself.',
};

export default function AudioLibraryScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();

  const [collection, setCollection] = useState<Collection>('listen');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(ALL_FILTER);

  const listenTopics = useMemo(() => Array.from(new Set(LISTEN_SCRIPTS.map((s) => s.topic))), []);
  const categoryOptions = collection === 'listen' ? listenTopics : PARENT_LEARNING_CATEGORIES;

  function selectCollection(next: Collection) {
    setCollection(next);
    setCategory(ALL_FILTER);
  }

  const filteredEpisodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return LISTEN_SCRIPTS.filter((e) => category === ALL_FILTER || e.topic === category).filter(
      (e) => !query || e.title.toLowerCase().includes(query) || e.topic.toLowerCase().includes(query)
    );
  }, [category, search]);

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PARENT_LESSONS.filter((l) => category === ALL_FILTER || l.topic === category).filter(
      (l) => !query || l.title.toLowerCase().includes(query) || l.topic.toLowerCase().includes(query)
    );
  }, [category, search]);

  const resultCount = collection === 'listen' ? filteredEpisodes.length : filteredLessons.length;

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
        <Text style={[typography.h1, { color: color.textPrimary }]}>Audio Library</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <ConnectMascotBubble text={COLLECTION_BUBBLE_TEXT[collection]} />

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: color.surfaceAlt,
            borderRadius: radii.pill,
            padding: 4,
          }}
        >
          <SegmentButton label="Listen Together" active={collection === 'listen'} onPress={() => selectCollection('listen')} />
          <SegmentButton label="Parent Learning Series" active={collection === 'learning'} onPress={() => selectCollection('learning')} />
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={collection === 'listen' ? 'Search stories...' : 'Search lessons...'}
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
          <Chip label={ALL_FILTER} active={category === ALL_FILTER} onPress={() => setCategory(ALL_FILTER)} />
          {categoryOptions.map((topic) => (
            <Chip key={topic} label={topic} active={category === topic} onPress={() => setCategory(topic)} />
          ))}
        </ScrollView>

        {resultCount === 0 ? (
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>
            Nothing matches your search or filter yet.
          </Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            {collection === 'listen'
              ? filteredEpisodes.map((episode) => (
                  <Pressable
                    key={episode.id}
                    onPress={() => router.push(`/(modals)/connect/listen/${episode.id}`)}
                    style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: 2 }, shadows.card]}
                  >
                    <Text style={[typography.caption, { color: color.textSecondary }]}>{episode.topic.toUpperCase()}</Text>
                    <Text style={[typography.h3, { color: color.textPrimary }]}>{episode.title}</Text>
                    <Text style={[typography.caption, { color: color.textSecondary }]}>~{episode.estimatedMinutes} min</Text>
                  </Pressable>
                ))
              : filteredLessons.map((lesson) => (
                  <Pressable
                    key={lesson.id}
                    onPress={() => router.push(`/(modals)/connect/learn/${lesson.id}`)}
                    style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: 2 }, shadows.card]}
                  >
                    <Text style={[typography.caption, { color: color.textSecondary }]}>{lesson.topic.toUpperCase()}</Text>
                    <Text style={[typography.h3, { color: color.textPrimary }]}>{lesson.title}</Text>
                    <Text style={[typography.caption, { color: color.textSecondary }]}>~{lesson.estimatedMinutes} min</Text>
                  </Pressable>
                ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { color, spacing, typography, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
        backgroundColor: active ? color.primary : 'transparent',
      }}
    >
      <Text
        numberOfLines={1}
        style={[typography.bodySmall, { color: active ? color.textOnPrimary : color.textSecondary, fontFamily: typography.bodyEmphasis.fontFamily }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
