import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, IconBubble, BackButton, ConfirmDialog } from '../../../src/components/ui';
import { useDenContext } from '../../../src/features/den/DenProvider';
import { EVENT_TYPE_OPTIONS } from '../../../src/features/logEvent/types';
import { eventTypeTint } from '../../../src/features/logEvent/eventTypeStyle';
import { getSubtypeLabel } from '../../../src/features/logEvent/subtypeOptions';
import { getQuestionSteps } from '../../../src/features/logEvent/questionConfig';
import { MessageBubble } from '../../../src/features/reflection/MessageBubble';

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { color, spacing, typography, radii } = theme;
  const router = useRouter();
  const den = useDenContext();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const event = den.events.find((e) => e.id === id);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Entry not found</Text>
        <Button label="Back to Daily Progress" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const option = EVENT_TYPE_OPTIONS.find((o) => o.type === event.eventType)!;
  const occurredAt = new Date(event.occurredAtISO);
  const subtypeLabel = getSubtypeLabel(event.eventType, event.subtype);

  function confirmDelete() {
    den.deleteEvent(event!.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg }}>
        <BackButton onPress={() => router.back()} />
        <Pressable onPress={() => router.push(`/(modals)/log-event?id=${event.id}`)} hitSlop={12}>
          <Text style={[typography.bodyEmphasis, { color: color.primary }]}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <IconBubble icon={option.icon} color={eventTypeTint(theme, event.eventType)} size={52} />
          <View>
            <Text style={[typography.h2, { color: color.textPrimary }]}>{option.label}</Text>
            {subtypeLabel && (
              <Text style={[typography.bodyEmphasis, { color: color.primary }]}>{subtypeLabel}</Text>
            )}
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
              {occurredAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} ·{' '}
              {occurredAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {event.timeDescription ? <DetailField theme={theme} label="Roughly when" value={event.timeDescription} /> : null}

        {event.eventType !== 'positiveMoment' && (
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <View style={{ flex: 1, backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={[typography.caption, { color: color.textSecondary }]}>Intensity</Text>
              <Text style={[typography.h3, { color: color.textPrimary }]}>{event.intensity}/10</Text>
            </View>
            {event.durationLabel ? (
              <View style={{ flex: 1, backgroundColor: color.surface, borderRadius: radii.md, padding: spacing.md }}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>Duration</Text>
                <Text style={[typography.h3, { color: color.textPrimary }]}>{event.durationLabel}</Text>
              </View>
            ) : null}
          </View>
        )}

        {getQuestionSteps(event.eventType).map((q) =>
          event[q.key] ? <DetailField key={q.key} theme={theme} label={q.title} value={event[q.key] as string} /> : null
        )}

        {event.reflection && (
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>Saved reflection</Text>
            {event.reflection.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </View>
        )}

        {(event.eventType === 'meltdown' || event.eventType === 'parentReaction') && (
          <Button
            label="Replay This Moment"
            variant="secondary"
            onPress={() => router.push(`/(modals)/parent-replay/${event.id}`)}
          />
        )}

        <Button label="Delete entry" variant="secondary" onPress={() => setConfirmingDelete(true)} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this entry?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </SafeAreaView>
  );
}

function DetailField({ theme, label, value }: { theme: ReturnType<typeof useTheme>; label: string; value: string }) {
  const { color, spacing, typography, radii } = theme;
  return (
    <View style={{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.xs }}>
      <Text style={[typography.caption, { color: color.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: color.textPrimary }]}>{value}</Text>
    </View>
  );
}
