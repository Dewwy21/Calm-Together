import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { CloseIcon } from '../icons';

interface CloseButtonProps {
  onPress: () => void;
  /** use on a photo/dark backdrop */
  onDark?: boolean;
  /** override for screens where more than one CloseButton can be on screen at once (e.g. a sheet over another modal) */
  accessibilityLabel?: string;
}

// Consistent "dismiss this whole flow" affordance, top-right, on every
// top-level modal screen (log-event, past-logs, calm-corner, reflection).
export function CloseButton({ onPress, onDark = false, accessibilityLabel = 'Close' }: CloseButtonProps) {
  const { color, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={{
        width: 36,
        height: 36,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: onDark ? 'rgba(0,0,0,0.25)' : color.surfaceAlt,
      }}
    >
      <CloseIcon size={16} color={onDark ? '#fff' : color.textSecondary} />
    </Pressable>
  );
}
