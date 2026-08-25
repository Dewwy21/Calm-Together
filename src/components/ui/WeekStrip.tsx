import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { CheckIcon } from '../icons';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface WeekStripProps {
  /** index 0-6 (Mon-Sun) of days that have a logged note */
  checkedDays: number[];
  todayIndex: number;
}

export function WeekStrip({ checkedDays, todayIndex }: WeekStripProps) {
  const { color, radii, spacing, typography } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {DAY_LABELS.map((label, i) => {
        const checked = checkedDays.includes(i);
        const isToday = i === todayIndex;
        return (
          <View key={i} style={{ alignItems: 'center', gap: spacing.xs }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: checked ? color.secondary : color.surfaceAlt,
                borderWidth: isToday && !checked ? 2 : 0,
                borderColor: color.primary,
              }}
            >
              {checked ? (
                <CheckIcon size={14} color={color.textOnPrimary} />
              ) : (
                <Text style={[typography.caption, { color: color.textSecondary }]}>{label}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
