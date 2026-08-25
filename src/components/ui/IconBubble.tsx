import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { IconProps } from '../icons';

interface IconBubbleProps {
  icon: React.ComponentType<IconProps>;
  color?: string;
  iconColor?: string;
  size?: number;
}

// Colorful rounded icon bubble — used for course list icons, event-type
// icons, etc. Renders custom vector icon art rather than emoji glyphs.
export function IconBubble({ icon: Icon, color, iconColor, size = 48 }: IconBubbleProps) {
  const { color: themeColor } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? themeColor.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.5} color={iconColor ?? themeColor.textPrimary} />
    </View>
  );
}
