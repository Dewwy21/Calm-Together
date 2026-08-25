import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Chip, CloseButton } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { useDenContext } from '../../src/features/den/DenProvider';
import { EventCard } from '../../src/features/logEvent/EventCard';
import { EventType, EVENT_TYPE_OPTIONS } from '../../src/features/logEvent/types';
import { CurrentChildBadge } from '../../src/features/profiles/CurrentChildBadge';

type FilterKey = 'all' | EventType;
type SortKey = 'newest' | 'oldest' | 'intensity';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Entries' },
  ...EVENT_TYPE_OPTIONS.map((o) => ({ key: o.type, label: o.label })),
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'intensity', label: 'Most intense' },
];

const SEARCHABLE_FIELDS = ['whatHappened', 'before', 'after', 'location', 'whoPresent', 'consequences', 'additionalNotes', 'timeDescription'] as const;

export default function PastLogsScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const den = useDenContext();
  const { sort: initialSort } = useLocalSearchParams<{ sort?: SortKey }>();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>(initialSort ?? 'newest');

  const filteredEvents = useMemo(() => {
    let list = den.events;
    if (filter !== 'all') {
      list = list.filter((e) => e.eventType === filter);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((e) => SEARCHABLE_FIELDS.some((field) => e[field].toLowerCase().includes(query)));
    }
    return [...list].sort((a, b) => {
      if (sort === 'oldest') return a.occurredAtISO.localeCompare(b.occurredAtISO);
      if (sort === 'intensity') return b.intensity - a.intensity;
      return b.occurredAtISO.localeCompare(a.occurredAtISO);
    });
  }, [den.events, filter, search, sort]);

  const hasAnyEntries = den.events.length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Mascot size={32} />
          <Text style={[typography.h1, { color: color.textPrimary }]}>Daily Progress</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <CurrentChildBadge />
          <CloseButton onPress={() => router.back()} />
        </View>
      </View>

      {hasAnyEntries && (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search past entries..."
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
            {FILTER_OPTIONS.map((o) => (
              <Chip key={o.key} label={o.label} active={filter === o.key} onPress={() => setFilter(o.key)} />
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {SORT_OPTIONS.map((o) => (
              <Chip key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} />
            ))}
          </ScrollView>
        </View>
      )}

      {!hasAnyEntries ? (
        <EmptyState onLogPress={() => router.replace('/(modals)/log-event')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          {filteredEvents.length === 0 ? (
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] }]}>
              No entries match your search or filters.
            </Text>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/(modals)/log-detail/${event.id}`)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function EmptyState({ onLogPress }: { onLogPress: () => void }) {
  const { color, spacing, typography } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }}>
      <Mascot size={110} />
      <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>
        Nothing logged yet
      </Text>
      <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
        Once you log a moment, it'll show up here so you can look back on it anytime.
      </Text>
      <Pressable onPress={onLogPress}>
        <Text style={[typography.bodyEmphasis, { color: color.primary }]}>Start your first log →</Text>
      </Pressable>
    </View>
  );
}
