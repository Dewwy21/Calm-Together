import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { BookIcon } from '../../components/icons';

// A simple square, rounded-corner button placed off to the side of the
// daily-logging screen so caregivers can always find their history without
// it competing with the primary "log what happened" action.
export function PastLogsButton() {
  const router = useRouter();
  const { color, radii, shadows } = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/(modals)/past-logs')}
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: radii.sm,
          backgroundColor: color.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadows.card,
      ]}
    >
      <BookIcon size={20} color={color.textPrimary} />
    </Pressable>
  );
}
