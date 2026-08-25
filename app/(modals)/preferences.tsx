import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, useThemeSettings, ThemeModePreference } from '../../src/theme';
import { BackButton, Chip, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsToggleRow } from '../../src/features/settings/SettingsToggleRow';
import { TextSizeIcon, BookIcon } from '../../src/components/icons';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { AiVoiceStyle, ReadingSpeed, ReminderFrequency, ReminderTimeOfDay } from '../../src/features/preferences/types';

const THEME_OPTIONS: { value: ThemeModePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match System' },
];

const AI_VOICE_OPTIONS: { value: AiVoiceStyle; label: string }[] = [
  { value: 'warm', label: 'Warm & Friendly' },
  { value: 'calm', label: 'Calm & Steady' },
  { value: 'bright', label: 'Bright & Energetic' },
];

const READING_SPEED_OPTIONS: { value: ReadingSpeed; label: string }[] = [
  { value: 'slower', label: 'Slower' },
  { value: 'normal', label: 'Normal' },
  { value: 'faster', label: 'Faster' },
];

const REMINDER_FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'daily', label: 'Daily' },
  { value: 'fewTimesWeek', label: 'A Few Times a Week' },
  { value: 'weekly', label: 'Weekly' },
];

const REMINDER_TIME_OPTIONS: { value: ReminderTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'evening', label: 'Evening' },
];

export default function PreferencesScreen() {
  const { color, spacing, typography } = useTheme();
  const { preference, setPreference, textScale, setTextScale } = useThemeSettings();
  const { preferences, updatePreference } = usePreferencesContext();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AnimatedMascot size={40} motion="sway" />
          <SpeechBubble text="Make it look and feel exactly right for you." />
        </View>

        <Section title="Appearance">
          <ChipRow>
            {THEME_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={preference === o.value} onPress={() => setPreference(o.value)} />
            ))}
          </ChipRow>
        </Section>

        <SettingsGroup>
          <SettingsToggleRow
            icon={TextSizeIcon}
            label="Larger Text"
            description="Increase text size across the app"
            value={textScale === 'large'}
            onValueChange={(large) => setTextScale(large ? 'large' : 'default')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsToggleRow
            icon={BookIcon}
            label="Therapist Mode"
            description="Show which approach (CBT, PCIT, and so on) is behind each suggestion"
            value={preferences.therapistMode}
            onValueChange={(therapistMode) => updatePreference('therapistMode', therapistMode)}
          />
        </SettingsGroup>

        <Section title="Preferred AI Voice">
          <ChipRow>
            {AI_VOICE_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={preferences.aiVoiceStyle === o.value}
                onPress={() => updatePreference('aiVoiceStyle', o.value)}
              />
            ))}
          </ChipRow>
        </Section>

        <Section title="Reading Speed">
          <ChipRow>
            {READING_SPEED_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={preferences.readingSpeed === o.value}
                onPress={() => updatePreference('readingSpeed', o.value)}
              />
            ))}
          </ChipRow>
        </Section>

        <Section title="Reminder Frequency" subtitle="We'll use this once notifications are enabled">
          <ChipRow>
            {REMINDER_FREQUENCY_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={preferences.reminderFrequency === o.value}
                onPress={() => updatePreference('reminderFrequency', o.value)}
              />
            ))}
          </ChipRow>
        </Section>

        {preferences.reminderFrequency !== 'off' && (
          <Section title="Preferred Time of Day">
            <ChipRow>
              {REMINDER_TIME_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  active={preferences.reminderTimeOfDay === o.value}
                  onPress={() => updatePreference('reminderTimeOfDay', o.value)}
                />
              ))}
            </ChipRow>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { color, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.label, { color: color.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[typography.caption, { color: color.textSecondary, marginTop: -spacing.xs }]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  const { spacing } = useTheme();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{children}</View>;
}
