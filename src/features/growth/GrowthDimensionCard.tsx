import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { GrowthDimension } from './types';

const TREND_LABEL: Record<GrowthDimension['trend'], string> = {
  improving: 'Trending up',
  declining: 'Trending down',
  steady: 'Holding steady',
  notEnoughData: 'Not enough data yet',
};

export function GrowthDimensionCard({ dimension }: { dimension: GrowthDimension }) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const trendColor =
    dimension.trend === 'improving' ? color.success : dimension.trend === 'declining' ? color.warning : color.textSecondary;

  // Defaults to the most recent week with real data, but a caregiver can
  // tap any bar to see that specific week's real number instead of having
  // to guess what a given bar height means — there's no hover on a phone,
  // so tap is the equivalent "explain this data point" affordance.
  const lastIndexWithData = [...dimension.weeklyPoints].map((p, i) => (p.score !== null ? i : -1)).filter((i) => i >= 0).pop();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(lastIndexWithData ?? null);
  const selectedPoint = selectedIndex !== null ? dimension.weeklyPoints[selectedIndex] : null;

  return (
    <View style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }, shadows.card]}>
      <View>
        <Text style={[typography.h3, { color: color.textPrimary }]}>{dimension.label}</Text>
        <Text style={[typography.bodySmall, { color: color.textSecondary, marginTop: 2 }]}>{dimension.description}</Text>
      </View>

      {dimension.overallScore !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginTop: spacing.xs }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{dimension.overallScore}</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>out of 100 (last 4 weeks)</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: trendColor }} />
        <Text style={[typography.caption, { color: trendColor, fontWeight: '600' }]}>{TREND_LABEL[dimension.trend]}</Text>
      </View>

      {/* The one line every trend/score on this card is required to have:
          what actually changed, in this dimension's own real units — never
          just a badge or a bare number left for the caregiver to interpret. */}
      <Text style={[typography.bodySmall, { color: color.textPrimary }]}>
        {dimension.trendExplanation ??
          "Not enough logged activity yet to show a real trend here — this will fill in as you keep using the app."}
      </Text>

      {dimension.overallScore !== null && (
        <>
          <Text style={[typography.caption, { color: color.textSecondary, marginTop: spacing.xs }]}>
            One bar per week · taller is better · tap a bar for that week's real number
          </Text>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 60 }}>
            {dimension.weeklyPoints.map((point, i) => (
              <Pressable
                key={i}
                onPress={() => point.score !== null && setSelectedIndex(i)}
                disabled={point.score === null}
                style={{ flex: 1, alignItems: 'center', gap: 2 }}
              >
                <View
                  style={{
                    width: '100%',
                    height: point.score !== null ? Math.max(4, (point.score / 100) * 44) : 4,
                    borderRadius: radii.sm,
                    backgroundColor: point.score === null ? color.surfaceAlt : i === selectedIndex ? color.secondary : color.primary,
                  }}
                />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[typography.caption, { color: color.textSecondary, fontSize: 9 }]}>
              {dimension.weeklyPoints[0]?.weekLabel}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary, fontSize: 9 }]}>This week</Text>
          </View>

          {selectedPoint && (
            <View style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }}>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                {selectedPoint.weekLabel}: {selectedPoint.rawStat}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
