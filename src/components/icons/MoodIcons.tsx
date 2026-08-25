import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { IconProps } from './types';

export function WaveIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 15c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <Path
        d="M3 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

export function ThoughtIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9a8 6 0 1116 0 8 6 0 01-16 0z" fill={color} />
      <Circle cx={6} cy={17} r={2} fill={color} />
      <Circle cx={4} cy={20.5} r={1} fill={color} />
    </Svg>
  );
}

export function StarIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z" fill={color} />
    </Svg>
  );
}

export function SwirlIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 12c0-3 3-5 5-3s1 6-2 6-4-3-2-5 5-2 6 1"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BurstIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={3.5} fill={color} />
      <Line x1={12} y1={2} x2={12} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={18} x2={12} y2={22} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={2} y1={12} x2={6} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18} y1={12} x2={22} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={5} y1={5} x2={7.5} y2={7.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16.5} y1={16.5} x2={19} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={19} y1={5} x2={16.5} y2={7.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={7.5} y1={16.5} x2={5} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function BubbleIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={13} r={6} fill={color} opacity={0.85} />
      <Circle cx={17} cy={8} r={3} fill={color} opacity={0.6} />
      <Circle cx={19.5} cy={4.5} r={1.4} fill={color} opacity={0.4} />
    </Svg>
  );
}

export function FlameIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c1 3-3 4-3 8a3 3 0 006 0c1 1 1.5 2.5 1.5 4a4.5 4.5 0 01-9 0C7.5 9 12 7 12 2z"
        fill={color}
      />
    </Svg>
  );
}
