import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../../theme';
import { AvatarColorKey } from './types';

interface ChildAvatarProps {
  name: string;
  avatarUri?: string;
  avatarColorKey: AvatarColorKey;
  size?: number;
}

export function ChildAvatar({ name, avatarUri, avatarColorKey, size = 40 }: ChildAvatarProps) {
  const { color, radii, typography } = useTheme();
  const initials = name.trim().slice(0, 1).toUpperCase() || '?';
  const backgroundColor = color[avatarColorKey];

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={{ width: size, height: size, borderRadius: radii.pill }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.pill,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[typography.bodyEmphasis, { color: color.textOnPrimary, fontSize: size * 0.42 }]}>{initials}</Text>
    </View>
  );
}
