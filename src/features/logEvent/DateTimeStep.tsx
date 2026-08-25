import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { Chip } from '../../components/ui';

interface DateTimeStepProps {
  occurredAt: Date;
  onChangeOccurredAt: (date: Date) => void;
  timeDescription: string;
  onChangeTimeDescription: (text: string) => void;
}

const TIME_NUDGES = [
  { label: '-1h', minutes: -60 },
  { label: '-15m', minutes: -15 },
  { label: '+15m', minutes: 15 },
  { label: '+1h', minutes: 60 },
];

function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Auto-captures "now" as the default, then lets the caregiver nudge it with
// large chips instead of a freeform date parser — reliable everywhere
// (including the web preview) with no native date-picker dependency.
export function DateTimeStep({ occurredAt, onChangeOccurredAt, timeDescription, onChangeTimeDescription }: DateTimeStepProps) {
  const { color, spacing, typography, radii } = useTheme();

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isToday = isSameCalendarDay(occurredAt, now);
  const isYesterday = isSameCalendarDay(occurredAt, yesterday);

  function setDay(base: Date) {
    const updated = new Date(occurredAt);
    updated.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
    onChangeOccurredAt(updated);
  }

  function nudgeMinutes(minutes: number) {
    const updated = new Date(occurredAt);
    updated.setMinutes(updated.getMinutes() + minutes);
    onChangeOccurredAt(updated);
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>When did this happen?</Text>

      <View
        style={{
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          alignItems: 'center',
        }}
      >
        <Text style={[typography.display, { color: color.textPrimary, fontSize: 24 }]}>
          {occurredAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
        <Text style={[typography.h2, { color: color.primary }]}>
          {occurredAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Chip label="Yesterday" active={isYesterday} onPress={() => setDay(yesterday)} />
        <Chip label="Today" active={isToday} onPress={() => setDay(now)} />
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Adjust the time</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {TIME_NUDGES.map((n) => (
            <Chip key={n.label} label={n.label} active={false} onPress={() => nudgeMinutes(n.minutes)} />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
          Not sure of the exact time? That's okay, describe it instead.
        </Text>
        <TextInput
          value={timeDescription}
          onChangeText={onChangeTimeDescription}
          placeholder="e.g. during breakfast, right before bed"
          placeholderTextColor={color.textSecondary}
          style={{
            backgroundColor: color.surfaceAlt,
            borderRadius: radii.md,
            padding: spacing.md,
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: color.textPrimary,
          }}
        />
      </View>
    </View>
  );
}
