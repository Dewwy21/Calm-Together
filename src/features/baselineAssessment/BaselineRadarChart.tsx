import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line } from 'react-native-svg';
import { useTheme } from '../../theme';
import { PaqSubscaleScore } from './scoring';

interface BaselineRadarChartProps {
  subscales: PaqSubscaleScore[];
}

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 78;
const RINGS = [0.25, 0.5, 0.75, 1];
const LABEL_RADIUS = RADIUS + 48;
// Label boxes grow outward from their axis point rather than being
// centered on it (see `left` below), so the canvas needs generous
// horizontal/vertical margin beyond the hexagon itself to avoid clipping
// the widest labels.
const CANVAS_WIDTH = SIZE + 260;
const CANVAS_HEIGHT = SIZE + 60;
const VIEW_MIN_X = -130;
const VIEW_MIN_Y = -20;

function point(angle: number, fraction: number) {
  return {
    x: CENTER + RADIUS * fraction * Math.cos(angle),
    y: CENTER + RADIUS * fraction * Math.sin(angle),
  };
}

function ringPoints(angles: number[], fraction: number) {
  return angles.map((angle) => point(angle, fraction)).map(({ x, y }) => `${x},${y}`).join(' ');
}

// A hand-drawn hexagon "spread" chart — same general shape as a 6-PAQ
// psychological-flexibility radar (six axes, one per subscale, percentage
// per axis) but scored on this app's own instrument convention: higher %
// means MORE difficulty in that domain (per the 6-PAQ's own scoring —
// raw subscale sums measure inflexibility, not flexibility), so this is
// deliberately not framed as a "higher is better" chart.
export function BaselineRadarChart({ subscales }: BaselineRadarChartProps) {
  const { color, spacing, typography } = useTheme();
  const count = subscales.length;
  const angles = subscales.map((_, i) => -Math.PI / 2 + i * ((2 * Math.PI) / count));
  const percents = subscales.map((s) => Math.round(((s.raw - s.min) / (s.max - s.min)) * 100));
  const dataPoints = angles.map((angle, i) => point(angle, percents[i] / 100)).map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} viewBox={`${VIEW_MIN_X} ${VIEW_MIN_Y} ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
          {RINGS.map((f) => (
            <Polygon key={f} points={ringPoints(angles, f)} fill="none" stroke={color.border} strokeWidth={1} />
          ))}
          {angles.map((angle, i) => {
            const { x, y } = point(angle, 1);
            return <Line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={color.border} strokeWidth={1} />;
          })}
          <Polygon points={dataPoints} fill={color.accentTint} stroke={color.accent} strokeWidth={2} />
        </Svg>

        {subscales.map((s, i) => {
          const { x, y } = point(angles[i], LABEL_RADIUS / RADIUS);
          // Screen-space coordinates within this View — the SVG's viewBox
          // starts at (VIEW_MIN_X, VIEW_MIN_Y), so chart-space (x, y) must
          // be shifted by that same offset to land in the right spot.
          const screenX = x - VIEW_MIN_X;
          const screenY = y - VIEW_MIN_Y;
          const isLeft = x < CENTER - 10;
          const isRight = x > CENTER + 10;
          // Anchor the label box so it grows outward from the axis point —
          // a symmetric box centered on the anchor would let a right-side
          // label's left half creep back in over the chart itself.
          const left = isRight ? screenX : isLeft ? screenX - 140 : screenX - 70;
          return (
            <View
              key={s.id}
              style={{
                position: 'absolute',
                left,
                top: screenY - 16,
                width: 140,
                alignItems: isLeft ? 'flex-end' : isRight ? 'flex-start' : 'center',
              }}
            >
              <Text style={[typography.caption, { color: color.textPrimary, textAlign: isLeft ? 'right' : isRight ? 'left' : 'center' }]}>
                {s.label}
              </Text>
              <Text style={[typography.bodySmall, { color: color.accent, fontWeight: '700' }]}>{percents[i]}%</Text>
            </View>
          );
        })}
      </View>

      <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
        Higher % = more difficulty in that area right now.
      </Text>
    </View>
  );
}
