import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { IconBubble } from '../../components/ui';
import { LoggedEvent, EVENT_TYPE_OPTIONS } from './types';
import { eventTypeTint } from './eventTypeStyle';
import { firstSentence } from './textUtils';
import { getSubtypeLabel } from './subtypeOptions';

interface EventCardProps {
  event: LoggedEvent;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const theme = useTheme();
  const { color, spacing, typography, radii, shadows } = theme;
  const option = EVENT_TYPE_OPTIONS.find((o) => o.type === event.eventType)!;
  const occurredAt = new Date(event.occurredAtISO);
  const subtypeLabel = getSubtypeLabel(event.eventType, event.subtype);
  const isPositiveMoment = event.eventType === 'positiveMoment';
  const summaryText = isPositiveMoment ? event.meaningfulMoment ?? '' : event.whatHappened;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          gap: spacing.md,
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
        shadows.card,
      ]}
    >
      <IconBubble icon={option.icon} color={eventTypeTint(theme, event.eventType)} size={44} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{option.label}</Text>
            {subtypeLabel && (
              <View style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>{subtypeLabel}</Text>
              </View>
            )}
          </View>
          {!isPositiveMoment && <Text style={[typography.caption, { color: color.textSecondary }]}>{event.intensity}/10</Text>}
        </View>
        <Text style={[typography.caption, { color: color.textSecondary }]}>
          {occurredAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
          {occurredAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </Text>
        <Text style={[typography.bodySmall, { color: color.textPrimary }]} numberOfLines={2}>
          {firstSentence(summaryText)}
        </Text>
      </View>
    </Pressable>
  );
}
