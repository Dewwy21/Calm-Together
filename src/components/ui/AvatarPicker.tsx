import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTheme } from '../../theme';

type AvatarColorKey = 'primary' | 'secondary' | 'accent' | 'warning';

const COLOR_KEYS: AvatarColorKey[] = ['primary', 'secondary', 'accent', 'warning'];

interface AvatarPickerProps {
  name: string;
  avatarUri?: string;
  avatarColorKey: AvatarColorKey;
  onPickPhoto: () => void;
  onRemovePhoto?: () => void;
  onChangeColor: (key: AvatarColorKey) => void;
}

// Shared by the Account screen and Kid Profile form: a big preview circle
// (photo if set, else colored initials), a "Change Photo" action, and a
// fallback color swatch row for when no photo is set.
export function AvatarPicker({ name, avatarUri, avatarColorKey, onPickPhoto, onRemovePhoto, onChangeColor }: AvatarPickerProps) {
  const { color, radii, spacing, typography } = useTheme();
  const initials = name.trim().slice(0, 1).toUpperCase() || '?';
  const size = 88;

  return (
    <View style={{ alignItems: 'center', gap: spacing.sm }}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={{ width: size, height: size, borderRadius: radii.pill }} />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radii.pill,
            backgroundColor: color[avatarColorKey],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.display, { color: color.textOnPrimary, fontSize: 34 }]}>{initials}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Pressable onPress={onPickPhoto}>
          <Text style={[typography.bodyEmphasis, { color: color.primary }]}>
            {avatarUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </Pressable>
        {avatarUri && onRemovePhoto && (
          <Pressable onPress={onRemovePhoto}>
            <Text style={[typography.bodyEmphasis, { color: color.textSecondary }]}>Remove</Text>
          </Pressable>
        )}
      </View>

      {!avatarUri && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {COLOR_KEYS.map((key) => (
            <Pressable
              key={key}
              onPress={() => onChangeColor(key)}
              style={{
                width: 28,
                height: 28,
                borderRadius: radii.pill,
                backgroundColor: color[key],
                borderWidth: key === avatarColorKey ? 2 : 0,
                borderColor: color.textPrimary,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
