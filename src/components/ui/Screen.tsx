import React from 'react';
import { ScrollView, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

// Safe-area + background wrapper every screen uses so app background/edges
// stay consistent without repeating boilerplate per screen.
export function Screen({ children, scroll = true, edges = ['top', 'bottom'], contentStyle }: ScreenProps) {
  const { color, spacing } = useTheme();

  const content = scroll ? (
    <ScrollView contentContainerStyle={[{ padding: spacing.lg, gap: spacing.xl }, contentStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: spacing.lg }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: color.background }}>
      {content}
    </SafeAreaView>
  );
}
