import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../icons/types';

export interface ActionSheetItem {
  label: string;
  icon: React.ComponentType<IconProps>;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetModalProps {
  visible: boolean;
  title?: string;
  actions: ActionSheetItem[];
  onCancel: () => void;
}

// A single reusable "•••" menu — used for both per-conversation and
// per-message actions in Help Bot so Delete/Rename/Archive/Copy always look
// and behave the same way. Follows ConfirmDialog's Modal + backdrop pattern.
export function ActionSheetModal({ visible, title, actions, onCancel }: ActionSheetModalProps) {
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
            { backgroundColor: color.surface, borderRadius: radii.xl, padding: spacing.sm, width: '100%', maxWidth: 340, overflow: 'hidden' },
            shadows.raised,
          ]}
        >
          {!!title && (
            <Text
              style={[
                typography.caption,
                { color: color.textSecondary, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {actions.map((action, index) => {
            const Icon = action.icon;
            const tint = action.destructive ? color.warning : color.textPrimary;
            return (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderRadius: radii.md,
                    backgroundColor: pressed ? color.surfaceAlt : 'transparent',
                  },
                  index > 0 ? { marginTop: 2 } : null,
                ]}
              >
                <Icon size={18} color={tint} />
                <Text style={[typography.body, { color: tint }]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
