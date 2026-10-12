import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui';

// Shown once, before baseline collection starts, when the Acceptance
// lesson's video card becomes visible. Same Modal pattern as
// ConfirmDialog/CaregiverCheckInPrompt. Declining never blocks the video —
// see the Acceptance lesson player for how "Continue Without Camera" just
// skips straight past all sensing.

interface CameraConsentPromptProps {
  visible: boolean;
  onEnable: () => void;
  onDecline: () => void;
}

export function CameraConsentPrompt({ visible, onEnable, onDecline }: CameraConsentPromptProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <View style={[{ backgroundColor: color.surface, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 380 }, shadows.raised]}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>Use your camera during this exercise?</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>
            If you'd like, the app can use your camera to notice changes in your facial-expression patterns while you
            watch this guided practice. This is completely optional.
          </Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            The camera can't tell what you're actually feeling — only you know that. No video or images are ever
            saved. You can stop this at any time, and the exercise works exactly the same either way.
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Button label="Enable Camera Sensing" onPress={onEnable} />
            <Pressable onPress={onDecline} style={{ alignItems: 'center', padding: spacing.sm }}>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Continue Without Camera</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
