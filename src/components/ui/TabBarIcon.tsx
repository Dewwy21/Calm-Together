import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../icons';

interface TabBarIconProps {
  icon: React.ComponentType<IconProps>;
  focused: boolean;
}

export function TabBarIcon({ icon: Icon, focused }: TabBarIconProps) {
  const { color, radii } = useTheme();
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? color.primaryTint : 'transparent',
      }}
    >
      <Icon size={20} color={focused ? color.primary : color.textSecondary} />
    </View>
  );
}
