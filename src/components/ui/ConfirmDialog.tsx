import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  /** omit to render a single-button, informational dialog */
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

// React Native Web's Alert.alert() is a no-op (it does nothing at all), so
// anything that relied on it silently failed on web, most notably the
// Delete Entry confirmation. This is a real Modal-based dialog that works
// identically on web, iOS, and Android.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            { backgroundColor: color.surface, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 340 },
            shadows.raised,
          ]}
        >
          <Text style={[typography.h2, { color: color.textPrimary }]}>{title}</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>{message}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            {cancelLabel && onCancel && (
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            )}
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              style={[{ flex: 1 }, destructive ? { backgroundColor: color.warning } : null]}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
