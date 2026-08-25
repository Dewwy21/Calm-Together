import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton, ConfirmDialog, AvatarPicker, Chip } from '../../src/components/ui';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsToggleRow } from '../../src/features/settings/SettingsToggleRow';
import { BellIcon } from '../../src/components/icons';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { useAuthContext } from '../../src/features/auth/AuthProvider';
import { pickAvatarPhoto } from '../../src/utils/photoPicker';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
];

export default function AccountScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { account, updateAccount } = usePreferencesContext();
  const { currentUser } = useAuthContext();

  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

  async function handlePickPhoto() {
    const uri = await pickAvatarPhoto();
    if (uri) updateAccount({ avatarUri: uri });
  }

  function handleSelectLanguage(code: string) {
    if (code !== 'en') {
      setComingSoonMessage("More languages are on the way. For now, Otter Companion speaks English.");
      return;
    }
    updateAccount({ language: code });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <AvatarPicker
          name={currentUser?.name || 'Caregiver'}
          avatarUri={account.avatarUri}
          avatarColorKey={account.avatarColorKey}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={() => updateAccount({ avatarUri: undefined })}
          onChangeColor={(avatarColorKey) => updateAccount({ avatarColorKey })}
        />

        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Language</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {LANGUAGES.map((l) => (
              <Chip key={l.code} label={l.label} active={account.language === l.code} onPress={() => handleSelectLanguage(l.code)} />
            ))}
          </View>
        </View>

        <SettingsGroup>
          <SettingsToggleRow
            icon={BellIcon}
            label="Notifications"
            description="Allow the app to notify you"
            value={account.notificationsEnabled}
            onValueChange={(notificationsEnabled) => updateAccount({ notificationsEnabled })}
          />
        </SettingsGroup>

        <Text style={[typography.caption, { color: color.textSecondary }]}>
          To view your name and email, or to log out, see your Profile.
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={!!comingSoonMessage}
        title="Coming soon"
        message={comingSoonMessage ?? ''}
        confirmLabel="Got it"
        onConfirm={() => setComingSoonMessage(null)}
      />
    </SafeAreaView>
  );
}
