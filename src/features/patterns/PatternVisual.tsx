import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { PatternEvidence } from './types';

const TIME_BUCKET_LABELS = ['12–4am', '4–8am', '8am–12', '12–4pm', '4–8pm', '8pm–12'];

function bucketHourCounts(hourCounts: number[]): number[] {
  const buckets = new Array(6).fill(0);
  hourCounts.forEach((count, hour) => {
    buckets[Math.floor(hour / 4)] += count;
  });
  return buckets;
}

export function PatternVisual({ evidence, accentColor }: { evidence: PatternEvidence; accentColor: string }) {
  const { color, spacing, typography, radii } = useTheme();

  if (evidence.kind === 'frequency') {
    const { matchCount, outOfLast, hourCounts } = evidence.data;
    const buckets = bucketHourCounts(hourCounts);
    const maxBucket = Math.max(1, ...buckets);
    const ratio = outOfLast > 0 ? matchCount / outOfLast : 0;

    return (
      <View style={{ gap: spacing.sm }}>
        <View style={{ gap: 4 }}>
          <View style={{ height: 10, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: accentColor }} />
          </View>
          <Text style={[typography.caption, { color: color.textSecondary }]}>
            {matchCount} of {outOfLast} recent logs
          </Text>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>When it tends to happen</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {buckets.map((count, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <View
                  style={{
                    width: '100%',
                    height: 28,
                    borderRadius: radii.sm,
                    backgroundColor: count === 0 ? color.surfaceAlt : accentColor,
                    opacity: count === 0 ? 1 : 0.35 + 0.65 * (count / maxBucket),
                  }}
                />
                <Text style={[typography.caption, { color: color.textSecondary, fontSize: 9 }]}>{TIME_BUCKET_LABELS[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (evidence.kind === 'correlation') {
    const { withActivityAverage, withoutActivityAverage, withActivityDayCount, withoutActivityDayCount, activityLabel } = evidence.data;
    const maxVal = Math.max(withActivityAverage, withoutActivityAverage, 1);

    return (
      <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-end', height: 90 }}>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{withActivityAverage.toFixed(1)}</Text>
          <View style={{ width: '60%', height: (withActivityAverage / maxVal) * 50 + 4, borderRadius: radii.sm, backgroundColor: accentColor }} />
          <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'center' }]}>
            With {activityLabel}{'\n'}({withActivityDayCount} days)
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{withoutActivityAverage.toFixed(1)}</Text>
          <View
            style={{ width: '60%', height: (withoutActivityAverage / maxVal) * 50 + 4, borderRadius: radii.sm, backgroundColor: color.surfaceAlt }}
          />
          <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'center' }]}>
            Without{'\n'}({withoutActivityDayCount} days)
          </Text>
        </View>
      </View>
    );
  }

  const { weeklyAverages } = evidence.data;
  const maxAvg = Math.max(1, ...weeklyAverages.map((w) => w.average ?? 0));

  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 70 }}>
      {weeklyAverages.map((w, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: '100%',
              height: w.average !== null ? Math.max(4, (w.average / maxAvg) * 44) : 4,
              borderRadius: radii.sm,
              backgroundColor: w.average !== null ? accentColor : color.surfaceAlt,
            }}
          />
          <Text style={[typography.caption, { color: color.textSecondary, fontSize: 9, textAlign: 'center' }]} numberOfLines={1}>
            {w.weekLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}
