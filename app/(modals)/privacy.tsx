import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton, ConfirmDialog, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsRow } from '../../src/features/settings/SettingsRow';
import { SettingsToggleRow } from '../../src/features/settings/SettingsToggleRow';
import { ShieldIcon, ChartIcon, BookIcon } from '../../src/components/icons';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';

export default function PrivacyScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { preferences, updatePreference } = usePreferencesContext();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Privacy & Data</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AnimatedMascot size={40} motion="idle" propIcon={ShieldIcon} />
          <SpeechBubble text="Your Daily Log stays on this device. A few AI features send message text to our AI provider to generate a response." />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>What leaves this device</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>
            To write Help Bot replies, Parent Replay reconstructions, and Conversation Simulator sessions, the
            message text for that conversation — along with a short, relevant summary of your child's profile and
            recent Daily Log entries — is sent to our AI provider's API to generate the response. Your full Daily Log,
            saved Reflections, and everything else in the app stays on this device and is never sent anywhere.
          </Text>
        </View>

        <SettingsGroup>
          <SettingsToggleRow
            icon={ShieldIcon}
            label="Share Anonymized Data"
            description="Help improve recommendations for other families"
            value={preferences.shareAnonymizedData}
            onValueChange={(shareAnonymizedData) => updatePreference('shareAnonymizedData', shareAnonymizedData)}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={ChartIcon}
            label="Export My Data"
            onPress={() => setNotice('Exporting your Daily Log and profiles as a file is coming soon.')}
          />
          <SettingsRow
            icon={BookIcon}
            label="Privacy Policy"
            onPress={() => setNotice('A full privacy policy is coming soon.')}
          />
        </SettingsGroup>
      </ScrollView>

      <ConfirmDialog
        visible={!!notice}
        title="Coming soon"
        message={notice ?? ''}
        confirmLabel="Got it"
        onConfirm={() => setNotice(null)}
      />
    </SafeAreaView>
  );
}
