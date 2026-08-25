import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from './types';

export function LeafIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20C4 10 12 4 20 4c0 8-6 16-16 16z" fill={color} />
      <Path d="M6 18C10 14 14 10 18 6" stroke="#fff" strokeWidth={1.2} opacity={0.35} fill="none" />
    </Svg>
  );
}

export function PebbleIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 15c0-4 4-6 9-6s9 2 9 6-4 5-9 5-9-1-9-5z" fill={color} />
      <Path d="M8 12c1-1 2.5-1.5 4-1.5" stroke="#fff" strokeWidth={1.2} opacity={0.3} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FlowerIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={6} r={4} fill={color} />
      <Circle cx={17} cy={9} r={4} fill={color} />
      <Circle cx={15} cy={15} r={4} fill={color} />
      <Circle cx={9} cy={15} r={4} fill={color} />
      <Circle cx={7} cy={9} r={4} fill={color} />
      <Circle cx={12} cy={11} r={3} fill="#fff" opacity={0.85} />
    </Svg>
  );
}

export function MushroomIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 12a8 5.5 0 0116 0z" fill={color} />
      <Path d="M10 12h4v7a2 2 0 01-4 0z" fill="#fff" opacity={0.85} />
      <Circle cx={9} cy={9} r={1.1} fill="#fff" opacity={0.6} />
      <Circle cx={15} cy={8} r={1.1} fill="#fff" opacity={0.6} />
      <Circle cx={12} cy={6.5} r={1} fill="#fff" opacity={0.6} />
    </Svg>
  );
}

export function CloudIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 18a4 4 0 01-.5-7.97A5 5 0 0116 9a4.5 4.5 0 01-.5 9h-9z"
        fill={color}
      />
    </Svg>
  );
}

export function TreeIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={9} r={7} fill={color} />
      <Path d="M11 15h2v7h-2z" fill={color} opacity={0.7} />
    </Svg>
  );
}

export function RiverIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6-1"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <Path
        d="M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6-1"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />
      <Path
        d="M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6-1"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
    </Svg>
  );
}
