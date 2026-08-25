import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { IconBubble } from '../../components/ui';
import { IconProps, ChevronLeftIcon } from '../../components/icons';

interface SettingsRowProps {
  icon: React.ComponentType<IconProps>;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsRow({ icon, iconBg, label, value, onPress, destructive }: SettingsRowProps) {
  const { color, spacing, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <IconBubble icon={icon} size={36} color={iconBg} iconColor={destructive ? color.warning : color.textPrimary} />
      <Text style={[typography.body, { color: destructive ? color.warning : color.textPrimary, flex: 1 }]}>{label}</Text>
      {value && (
        <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && (
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <ChevronLeftIcon size={16} color={color.textSecondary} />
        </View>
      )}
    </Pressable>
  );
}
