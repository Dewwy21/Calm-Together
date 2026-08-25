import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme';

interface TrailConnectorProps {
  direction: 'toRight' | 'toLeft';
}

// A short curved segment linking consecutive trail stops, alternating
// direction so the path reads as winding rather than a straight list.
export function TrailConnector({ direction }: TrailConnectorProps) {
  const { color } = useTheme();
  const d = direction === 'toRight' ? 'M20 0 C 20 40, 100 20, 100 70' : 'M100 0 C 100 40, 20 20, 20 70';

  return (
    <Svg width="100%" height={70} viewBox="0 0 120 70">
      <Path d={d} stroke={color.border} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" fill="none" />
    </Svg>
  );
}
