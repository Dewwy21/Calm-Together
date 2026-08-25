import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { ChevronLeftIcon } from '../../components/icons';
import { useProfilesContext } from './ProfilesProvider';
import { ChildAvatar } from './ChildAvatar';
import { ChildSwitcherSheet } from './ChildSwitcherSheet';

// A small, always-visible "whose data am I looking at" indicator. Tapping
// it opens the switcher sheet so caregivers never have to leave the screen
// they're on to change which child they're viewing.
export function CurrentChildBadge() {
  const { color, spacing, radii, typography } = useTheme();
  const { currentChild } = useProfilesContext();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!currentChild) return null;

  return (
    <>
      <Pressable
        onPress={() => setSwitcherOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: color.surface,
          borderRadius: radii.pill,
          paddingVertical: 6,
          paddingHorizontal: spacing.sm,
        }}
      >
        <ChildAvatar
          name={currentChild.name}
          avatarUri={currentChild.avatarUri}
          avatarColorKey={currentChild.avatarColorKey}
          size={24}
        />
        <Text style={[typography.caption, { color: color.textPrimary, maxWidth: 80 }]} numberOfLines={1}>
          {currentChild.name}
        </Text>
        <View style={{ transform: [{ rotate: '-90deg' }] }}>
          <ChevronLeftIcon size={12} color={color.textSecondary} />
        </View>
      </Pressable>

      <ChildSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}
