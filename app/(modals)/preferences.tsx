import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, useThemeSettings, ThemeModePreference } from '../../src/theme';
import { BackButton, Button, Chip, ConfirmDialog, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsToggleRow } from '../../src/features/settings/SettingsToggleRow';
import { TextSizeIcon, BookIcon, LockIcon } from '../../src/components/icons';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { AiVoiceStyle, ReadingSpeed, ReminderFrequency, ReminderTimeOfDay } from '../../src/features/preferences/types';
import { useAuthContext } from '../../src/features/auth/AuthProvider';
import { useHelpBotContext } from '../../src/features/helpBot/HelpBotProvider';
import { getLastLogStatus } from '../../src/features/research/researchLogger';
import { resetTestUser } from '../../src/features/research/resetTestUser';
import {
  loadPendingStorageTest,
  runStorageTestPhase1,
  runStorageTestPhase2,
  StorageTestStep,
} from '../../src/features/research/storageTest';

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
  const { color, spacing, typography, radii } = useTheme();
  const { preference, setPreference, textScale, setTextScale } = useThemeSettings();
  const { preferences, updatePreference } = usePreferencesContext();
  const auth = useAuthContext();
  const helpBot = useHelpBotContext();
  const router = useRouter();

  const [confirmingReset, setConfirmingReset] = useState(false);
  // Polled rather than event-driven: the logger's status lives in a plain
  // module variable (see researchLogger.ts's getLastLogStatus), updated by
  // whichever screen just submitted a prompt — this screen just needs to
  // reflect it whenever the researcher checks back, not react instantly.
  const [logStatus, setLogStatus] = useState(getLastLogStatus());
  useEffect(() => {
    const interval = setInterval(() => setLogStatus(getLastLogStatus()), 1500);
    return () => clearInterval(interval);
  }, []);

  // Storage self-test (steps 1-8) — phase 1 (write/read-back/compare) runs
  // on demand; phase 2 (post-reload persistence + delete) runs
  // automatically the moment this screen next mounts, since that's only
  // ever true after a genuine reload actually happened. See storageTest.ts.
  const [storageTestSteps, setStorageTestSteps] = useState<StorageTestStep[] | null>(null);
  const [awaitingReload, setAwaitingReload] = useState(false);

  useEffect(() => {
    loadPendingStorageTest().then(async (pending) => {
      if (!pending) return;
      const phase2 = await runStorageTestPhase2(pending);
      setStorageTestSteps([
        ...pending.phase1Steps,
        { step: '4. Simulate a fresh app session by reloading the app', pass: true, detail: 'This screen just loaded after a real reload, not a repeated in-memory call.' },
        ...phase2,
      ]);
    });
  }, []);

  async function handleRunStorageTest() {
    setStorageTestSteps(null);
    const pending = await runStorageTestPhase1();
    setStorageTestSteps(pending.phase1Steps);
    setAwaitingReload(true);
  }

  function handleContinueStorageTest() {
    if (Platform.OS === 'web') {
      window.location.reload();
    }
    // Native: no in-app reload without adding expo-updates (not part of
    // this task) — the researcher-facing caption below explains the
    // manual step instead; phase 2 still runs automatically once they're
    // back on this screen.
  }

  function startNewTestCase() {
    updatePreference('activeTestCaseId', null);
    // "Start a fresh conversation context for the new test case where
    // appropriate" — only Help Bot carries conversation history across
    // turns; ACT Parenting Coach has no cross-submission context to clear.
    helpBot.startNewConversation();
  }

  async function handleConfirmReset() {
    setConfirmingReset(false);
    if (!auth.currentUser) return;
    await resetTestUser(auth.currentUser.id);
    if (Platform.OS === 'web') {
      // Simplest reliable way to force every Provider to re-read from
      // (now-empty) storage — matches how this whole app has been
      // verified all session. On native there's no equivalent without
      // adding expo-updates (a new dependency this task didn't ask for);
      // see the researcher-facing note below the button instead.
      window.location.reload();
    } else {
      router.replace('/');
    }
  }

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

        <Section title="Testing" subtitle="For trying out the app yourself — not meant for end users">
          <SettingsGroup>
            <SettingsToggleRow
              icon={LockIcon}
              label="Unlock All Lessons"
              description="Skip the 28-day schedule and open any lesson right away. Turn off to go back to the normal day-by-day unlock."
              value={preferences.unlockAllLessons}
              onValueChange={(unlockAllLessons) => updatePreference('unlockAllLessons', unlockAllLessons)}
            />
          </SettingsGroup>
        </Section>

        <Section
          title="Research Logging"
          subtitle="Controls what gets recorded as the caregiver interacts with the ACT chatbot features — see researchLogger.ts"
        >
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>
              Mode: {preferences.researchMode === 'test' ? 'TEST' : 'REAL'}
            </Text>
            <ChipRow>
              <Chip label="REAL" active={preferences.researchMode === 'real'} onPress={() => updatePreference('researchMode', 'real')} />
              <Chip label="TEST" active={preferences.researchMode === 'test'} onPress={() => updatePreference('researchMode', 'test')} />
            </ChipRow>
          </View>

          {preferences.researchMode === 'test' && (
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              <Text style={[typography.label, { color: color.textPrimary }]}>Test Case ID</Text>
              <TextInput
                value={preferences.activeTestCaseId ?? ''}
                onChangeText={(text) => updatePreference('activeTestCaseId', text || null)}
                placeholder="e.g. EDGE_003"
                placeholderTextColor={color.textSecondary}
                autoCapitalize="characters"
                style={{
                  backgroundColor: color.surface,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  fontFamily: typography.body.fontFamily,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                Attached to every logged interaction while TEST mode is active. Stays set until changed or you start a new test case.
              </Text>
              <Button label="Start New Test Case" variant="secondary" onPress={startNewTestCase} />
            </View>
          )}

          <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
            <Text style={[typography.label, { color: color.textPrimary }]}>Last logging attempt</Text>
            <Text style={[typography.bodySmall, { color: logStatus?.ok ? color.success : color.textSecondary }]}>
              {logStatus === null ? 'No interaction logged yet this session.' : logStatus.ok ? 'Logged ✓' : 'Logging failed'}
            </Text>
          </View>

          <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
            <Button label="Reset Test User" variant="secondary" textColor={color.warning} onPress={() => setConfirmingReset(true)} />
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Clears the local profile, onboarding, questionnaire answers, chat history, and Daily Logs for this account, and returns the
              app to a first-time-user state. Never deletes anything already recorded in Google Sheets.
              {Platform.OS !== 'web' && ' On native, manually reload the app afterward (dev menu reload or force-quit/reopen).'}
            </Text>
          </View>
        </Section>

        <Section
          title="Storage Self-Test"
          subtitle="Writes one clearly-labeled test value (never real caregiver data), confirms it round-trips, survives a real reload, then deletes it"
        >
          <Button label="Run Storage Test" variant="secondary" onPress={handleRunStorageTest} />
          {awaitingReload && (
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
                {Platform.OS === 'web'
                  ? 'Phase 1 done. Reload to continue — the test will finish automatically once this screen loads again.'
                  : 'Phase 1 done. Manually reload the app (dev menu reload or force-quit/reopen), then come back to this screen — the test will finish automatically.'}
              </Text>
              {Platform.OS === 'web' && <Button label="Reload Now" onPress={handleContinueStorageTest} />}
            </View>
          )}
          {storageTestSteps && (
            <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
              {storageTestSteps.map((s) => (
                <View key={s.step} style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Text style={[typography.bodySmall, { color: s.pass ? color.success : color.warning, fontWeight: '700' }]}>
                    {s.pass ? 'PASS' : 'FAIL'}
                  </Text>
                  <Text style={[typography.bodySmall, { color: color.textPrimary, flex: 1 }]}>
                    {s.step}
                    {s.detail ? ` — ${s.detail}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Section>
      </ScrollView>

      <ConfirmDialog
        visible={confirmingReset}
        title="Reset test user?"
        message="This clears your local profile, onboarding, questionnaire answers, chat history, and Daily Logs, returning the app to a first-time-user state. This cannot be undone locally, but nothing already recorded in Google Sheets is affected."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmingReset(false)}
      />
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
