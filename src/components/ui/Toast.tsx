import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useTheme } from '../../theme';
import { CheckIcon, CloseIcon } from '../icons';

export interface ToastMessage {
  text: string;
  variant: 'success' | 'error';
}

interface ToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
  /** ms before auto-dismissing, default 3000 */
  duration?: number;
}

// A small, auto-dismissing banner for one-off success/error notifications
// (e.g. "Verification email sent", a login error) — local per-screen state,
// not a global queue, matching how transient messages elsewhere in this app
// (e.g. account.tsx's old comingSoonMessage) are already handled.
export function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onDismiss());
    }, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (!message) return null;

  const isSuccess = message.variant === 'success';
  const tint = isSuccess ? color.success : color.warning;
  const Icon = isSuccess ? CheckIcon : CloseIcon;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: spacing.xl,
          left: spacing.lg,
          right: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: color.surface,
          borderRadius: radii.lg,
          borderLeftWidth: 4,
          borderLeftColor: tint,
          padding: spacing.md,
          opacity,
          zIndex: 50,
        },
        shadows.raised,
      ]}
    >
      <Icon size={16} color={tint} />
      <Text style={[typography.bodySmall, { color: color.textPrimary, flex: 1 }]}>{message.text}</Text>
    </Animated.View>
  );
}
