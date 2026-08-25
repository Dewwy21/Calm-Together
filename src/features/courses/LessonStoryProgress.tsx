import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';

interface LessonStoryProgressProps {
  total: number;
  current: number;
  accentColor: string;
}

// Instagram-story-style segmented bar: one segment per card, filled up to
// (and including) the current one.
export function LessonStoryProgress({ total, current, accentColor }: LessonStoryProgressProps) {
  const { color, radii } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: radii.pill,
            backgroundColor: i <= current ? accentColor : color.border,
          }}
        />
      ))}
    </View>
  );
}
