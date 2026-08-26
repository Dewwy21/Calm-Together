import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Card } from '../../components/ui';
import { RangedScore } from './scoring';

interface BaselinePssScoreCardProps {
  score: RangedScore;
}

// Parental Stress Scale (Berry & Jones, 1995): a single total score, not a
// multi-axis spread, so this is a plain number + position-on-range display
// rather than a chart — matches the instrument's own scoring (sum only,
// one result), with no invented severity bands since none were given.
export function BaselinePssScoreCard({ score }: BaselinePssScoreCardProps) {
  const { color, spacing, typography, radii } = useTheme();
  const ratio = (score.raw - score.min) / (score.max - score.min);

  return (
    <Card>
      <Text style={[typography.h3, { color: color.textPrimary }]}>Parenting Stress Scale</Text>
      <Text style={[typography.caption, { color: color.textSecondary, marginTop: 2 }]}>
        Higher scores indicate a higher level of parental stress.
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md }}>
        <Text style={[typography.h1, { color: color.accent }]}>{score.raw}</Text>
        <Text style={[typography.body, { color: color.textSecondary, marginLeft: 4 }]}>
          / {score.max}
        </Text>
      </View>

      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
        <View style={{ height: 8, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute',
              left: `${Math.max(0, Math.min(100, ratio * 100)) - 1}%`,
              width: 10,
              height: 8,
              borderRadius: radii.pill,
              backgroundColor: color.accent,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>Lower stress</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>Higher stress</Text>
        </View>
      </View>
    </Card>
  );
}
