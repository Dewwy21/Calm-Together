import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { IconBubble } from '../../components/ui';
import { IconProps } from '../../components/icons';

interface SettingsToggleRowProps {
  icon: React.ComponentType<IconProps>;
  iconBg?: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingsToggleRow({ icon, iconBg, label, description, value, onValueChange }: SettingsToggleRowProps) {
  const { color, spacing, typography } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
      <IconBubble icon={icon} size={36} color={iconBg} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.body, { color: color.textPrimary }]}>{label}</Text>
        {description && <Text style={[typography.caption, { color: color.textSecondary }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: color.surfaceAlt, true: color.primary }}
        thumbColor={color.white}
      />
    </View>
  );
}
