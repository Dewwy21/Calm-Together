import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';

// Neutral, dismissible caregiver self-report — shown at most once per
// checkpoint, only after a permitted trigger candidate (see the Acceptance
// lesson player for exactly when "permitted" means). Deliberately never
// names a feeling or claims to have detected one; the caregiver's own
// selection is the only authoritative record. Same Modal pattern as
// ConfirmDialog (src/components/ui/ConfirmDialog.tsx) for a consistent
// look, but with multiple neutral options instead of confirm/cancel.
//
// Kept in src/features/openface/ rather than src/features/courses/ since
// the "lesson controller decides whether to show this, OpenFace/temporal
// analysis never does" architecture (Stage 6 spec) is about responsibility
// separation, not file location — this is sensing-triggered UI, reusable
// by a future lesson exactly as-is, not Acceptance-specific itself.

export type CaregiverReflectionResponse = 'frustration' | 'worry' | 'sadness' | 'physical_tension' | 'something_else' | 'nothing_noticeable';

const OPTIONS: { value: CaregiverReflectionResponse; label: string }[] = [
  { value: 'frustration', label: 'Frustration' },
  { value: 'worry', label: 'Worry' },
  { value: 'sadness', label: 'Sadness' },
  { value: 'physical_tension', label: 'Physical tension' },
  { value: 'something_else', label: 'Something else' },
  { value: 'nothing_noticeable', label: 'Nothing noticeable' },
];

interface CaregiverCheckInPromptProps {
  visible: boolean;
  onRespond: (response: CaregiverReflectionResponse) => void;
  onSkip: () => void;
}

export function CaregiverCheckInPrompt({ visible, onRespond, onSkip }: CaregiverCheckInPromptProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        onPress={onSkip}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            { backgroundColor: color.surface, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 360 },
            shadows.raised,
          ]}
        >
          <Text style={[typography.h2, { color: color.textPrimary }]}>What are you noticing right now?</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            This is just a check-in — whatever you choose (or don't) is fine. Nothing here is tracked as a diagnosis.
          </Text>

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => onRespond(opt.value)}
                style={{
                  backgroundColor: color.surfaceAlt,
                  borderRadius: radii.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                }}
              >
                <Text style={[typography.body, { color: color.textPrimary }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onSkip} style={{ alignItems: 'center', marginTop: spacing.sm, padding: spacing.sm }}>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Skip</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
