import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { CloseButton, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { PeopleIcon, PersonIcon, GearIcon, ShieldIcon, MegaphoneIcon, LogOutIcon, ChartIcon, PaletteIcon, MenuListIcon } from '../../src/components/icons';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsRow } from '../../src/features/settings/SettingsRow';
import { useProfilesContext } from '../../src/features/profiles/ProfilesProvider';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { useAuthContext } from '../../src/features/auth/AuthProvider';
import { ChildAvatar } from '../../src/features/profiles/ChildAvatar';
import { loadOnboardingStatus } from '../../src/features/onboarding/onboardingStorage';
import { OnboardingStatus } from '../../src/features/onboarding/types';
import { useBaselineAssessmentContext } from '../../src/features/baselineAssessment/BaselineAssessmentProvider';
import { getCheckpointStatus } from '../../src/features/baselineAssessment/checkpoints';

export default function SettingsScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { activeProfiles, currentChild } = useProfilesContext();
  const { account } = usePreferencesContext();
  const { currentUser } = useAuthContext();
  const { assessments } = useBaselineAssessmentContext();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('not_started');

  useEffect(() => {
    if (!currentUser) return;
    loadOnboardingStatus(currentUser.id).then(setOnboardingStatus);
  }, [currentUser]);

  function checkpointStatusLabel(timepoint: 'day14' | 'day28'): string {
    const status = getCheckpointStatus(currentChild?.interventionStartDateISO, assessments, timepoint);
    switch (status.state) {
      case 'noProgramYet':
        return 'Not started yet';
      case 'upcoming':
        return `Available ${status.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      case 'due':
        return 'Ready';
      case 'completed':
        return `Completed ${new Date(status.completedAtISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
  }

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
        <Text style={[typography.h1, { color: color.textPrimary }]}>Settings</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AnimatedMascot size={44} motion="idle" />
          <SpeechBubble text="Everything about you, your family, and how the app feels lives here." />
        </View>

        <Pressable
          onPress={() => router.push('/(modals)/profile')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
        >
          <ChildAvatar
            name={currentUser?.name ?? 'Caregiver'}
            avatarUri={account.avatarUri}
            avatarColorKey={account.avatarColorKey}
            size={56}
          />
          <View>
            <Text style={[typography.h3, { color: color.textPrimary }]}>{currentUser?.name ?? 'Caregiver'}</Text>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{currentUser?.email ?? ''}</Text>
          </View>
        </Pressable>

        <SettingsGroup>
          <SettingsRow icon={PersonIcon} label="Account" onPress={() => router.push('/(modals)/account')} />
          <SettingsRow
            icon={PeopleIcon}
            label="Kid Profiles"
            value={`${activeProfiles.length}`}
            onPress={() => router.push('/(modals)/kid-profiles')}
          />
          <SettingsRow
            icon={ChartIcon}
            label={onboardingStatus === 'completed' ? 'Retake Baseline Assessment' : 'Complete Baseline Assessment'}
            onPress={() => router.push('/onboarding')}
          />
          <SettingsRow
            icon={ChartIcon}
            label="Day 14 Check-In"
            value={checkpointStatusLabel('day14')}
            onPress={() => router.push('/onboarding?timepoint=day14')}
          />
          <SettingsRow
            icon={ChartIcon}
            label="Day 28 Assessment"
            value={checkpointStatusLabel('day28')}
            onPress={() => router.push('/onboarding?timepoint=day28')}
          />
          <SettingsRow icon={MenuListIcon} label="Assessment History" onPress={() => router.push('/(modals)/assessment-history')} />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon={PaletteIcon} label="Customize Look & Feel" onPress={() => router.push('/(modals)/appearance')} />
          <SettingsRow icon={GearIcon} label="Preferences" onPress={() => router.push('/(modals)/preferences')} />
          <SettingsRow icon={ShieldIcon} label="Privacy & Data" onPress={() => router.push('/(modals)/privacy')} />
          <SettingsRow icon={MegaphoneIcon} label="Help & Support" onPress={() => router.push('/(modals)/support')} />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon={LogOutIcon} label="Log Out" destructive onPress={() => router.push('/(modals)/profile')} />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}
