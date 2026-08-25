import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { ConfirmDialog } from '../../components/ui';
import { Caregiver } from './useDenState';

interface CaregiverStripProps {
  caregivers: Caregiver[];
}

// Mocked shared-caregiver avatar strip — UI only for this pass, no real
// invite/auth flow yet. Establishes the "shared Den" concept visually.
export function CaregiverStrip({ caregivers }: CaregiverStripProps) {
  const { color, radii, spacing, typography } = useTheme();
  const [showInviteNotice, setShowInviteNotice] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      {caregivers.map((c, i) => (
        <View
          key={c.id}
          style={{
            width: 32,
            height: 32,
            borderRadius: radii.pill,
            backgroundColor: c.color,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: i === 0 ? 0 : -10,
            borderWidth: 2,
            borderColor: color.background,
          }}
        >
          <Text style={[typography.caption, { color: color.textOnPrimary, fontSize: 10 }]}>
            {c.initials.slice(0, 2)}
          </Text>
        </View>
      ))}
      <Pressable
        onPress={() => setShowInviteNotice(true)}
        style={{
          marginLeft: spacing.xs,
          paddingVertical: 6,
          paddingHorizontal: spacing.md,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: color.border,
        }}
      >
        <Text style={[typography.caption, { color: color.textSecondary }]}>+ Invite</Text>
      </Pressable>

      <ConfirmDialog
        visible={showInviteNotice}
        title="Invite a caregiver"
        message="Sharing the Den with co-parents and family is coming soon."
        confirmLabel="Got it"
        onConfirm={() => setShowInviteNotice(false)}
      />
    </View>
  );
}
