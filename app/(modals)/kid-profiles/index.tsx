import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { CloseButton, Button } from '../../../src/components/ui';
import { Mascot } from '../../../src/components/Mascot';
import { CheckIcon } from '../../../src/components/icons';
import { useProfilesContext } from '../../../src/features/profiles/ProfilesProvider';
import { ChildAvatar } from '../../../src/features/profiles/ChildAvatar';
import { ageRangeLabel, adhdStatusLabel } from '../../../src/features/profiles/profileOptions';

export default function KidProfilesScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const { activeProfiles, archivedProfiles, currentChildId } = useProfilesContext();

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
          <Text style={[typography.h1, { color: color.textPrimary }]}>Kid Profiles</Text>
        </View>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={[typography.body, { color: color.textSecondary }]}>
          Each child gets their own Daily Log, Help Bot conversations, and progress. Switch between them anytime.
        </Text>

        {activeProfiles.map((profile) => (
          <Pressable
            key={profile.id}
            onPress={() => router.push(`/(modals)/kid-profiles/${profile.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              padding: spacing.md,
              borderRadius: radii.lg,
              backgroundColor: color.surface,
            }}
          >
            <ChildAvatar name={profile.name} avatarUri={profile.avatarUri} avatarColorKey={profile.avatarColorKey} size={48} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{profile.name}</Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                {ageRangeLabel(profile.ageRange)} · ADHD: {adhdStatusLabel(profile.adhdStatus)}
              </Text>
            </View>
            {profile.id === currentChildId && (
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: radii.pill,
                  backgroundColor: color.primaryTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon size={14} color={color.primary} />
              </View>
            )}
          </Pressable>
        ))}

        <Button label="+ Add a Child" variant="secondary" onPress={() => router.push('/(modals)/kid-profiles/new')} />

        {archivedProfiles.length > 0 && (
          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            <Text style={[typography.h3, { color: color.textSecondary }]}>Archived</Text>
            {archivedProfiles.map((profile) => (
              <Pressable
                key={profile.id}
                onPress={() => router.push(`/(modals)/kid-profiles/${profile.id}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radii.lg,
                  backgroundColor: color.surfaceAlt,
                  opacity: 0.7,
                }}
              >
                <ChildAvatar name={profile.name} avatarUri={profile.avatarUri} avatarColorKey={profile.avatarColorKey} size={40} />
                <Text style={[typography.body, { color: color.textPrimary, flex: 1 }]}>{profile.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
