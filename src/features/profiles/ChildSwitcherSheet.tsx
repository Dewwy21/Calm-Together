import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { CheckIcon } from '../../components/icons';
import { useProfilesContext } from './ProfilesProvider';
import { ChildAvatar } from './ChildAvatar';

interface ChildSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ChildSwitcherSheet({ visible, onClose }: ChildSwitcherSheetProps) {
  const { color, spacing, radii, typography, shadows } = useTheme();
  const router = useRouter();
  const { activeProfiles, currentChildId, switchChild } = useProfilesContext();

  function handleSwitch(id: string) {
    switchChild(id);
    onClose();
  }

  function handleManage() {
    onClose();
    router.push('/(modals)/kid-profiles');
  }

  function handleAddChild() {
    onClose();
    router.push('/(modals)/kid-profiles/new');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              backgroundColor: color.surface,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              padding: spacing.xl,
              gap: spacing.sm,
              maxHeight: '70%',
            },
            shadows.raised,
          ]}
        >
          <Text style={[typography.h3, { color: color.textPrimary, marginBottom: spacing.xs }]}>Switch child</Text>

          <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: spacing.sm }}>
            {activeProfiles.map((profile) => (
              <Pressable
                key={profile.id}
                onPress={() => handleSwitch(profile.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radii.lg,
                  backgroundColor: profile.id === currentChildId ? color.primaryTint : color.surfaceAlt,
                }}
              >
                <ChildAvatar name={profile.name} avatarUri={profile.avatarUri} avatarColorKey={profile.avatarColorKey} size={36} />
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]}>{profile.name}</Text>
                {profile.id === currentChildId && <CheckIcon size={18} color={color.primary} />}
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={handleAddChild}
            style={{ paddingVertical: spacing.md, alignItems: 'center' }}
          >
            <Text style={[typography.bodyEmphasis, { color: color.primary }]}>+ Add a Child</Text>
          </Pressable>

          <Pressable onPress={handleManage} style={{ paddingVertical: spacing.sm, alignItems: 'center' }}>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Manage Profiles</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
