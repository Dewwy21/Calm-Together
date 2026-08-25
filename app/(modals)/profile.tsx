import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton, Button, ConfirmDialog } from '../../src/components/ui';
import { ChildAvatar } from '../../src/features/profiles/ChildAvatar';
import { useAuthContext } from '../../src/features/auth/AuthProvider';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';

export default function ProfileScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const auth = useAuthContext();
  const { account } = usePreferencesContext();
  const [confirmingLogOut, setConfirmingLogOut] = useState(false);

  const user = auth.currentUser;

  function handleLogOut() {
    auth.logOut();
    setConfirmingLogOut(false);
    router.replace('/(auth)/welcome');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Profile</Text>
      </View>

      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg }}>
          <ChildAvatar
            name={user?.name ?? '?'}
            avatarUri={account.avatarUri}
            avatarColorKey={account.avatarColorKey}
            size={88}
          />
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.h2, { color: color.textPrimary }]}>{user?.name ?? 'Caregiver'}</Text>
            <Text style={[typography.body, { color: color.textSecondary }]}>{user?.email ?? ''}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
          <View>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Name</Text>
            <Text style={[typography.body, { color: color.textPrimary }]}>{user?.name}</Text>
          </View>
          <View>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Email</Text>
            <Text style={[typography.body, { color: color.textPrimary }]}>{user?.email}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label="Log Out"
          variant="secondary"
          textColor={color.warning}
          onPress={() => setConfirmingLogOut(true)}
        />
      </View>

      <ConfirmDialog
        visible={confirmingLogOut}
        title="Log out?"
        message="You'll need to log back in with your email and password to access your account again."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleLogOut}
        onCancel={() => setConfirmingLogOut(false)}
      />
    </SafeAreaView>
  );
}
