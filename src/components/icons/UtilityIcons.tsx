import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { IconProps } from './types';

export function HomeIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11L12 4l8 7" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={10} y={14} width={4} height={6} rx={1} fill={color} />
    </Svg>
  );
}

export function BackpackIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 9a5 5 0 0110 0v1h0.5a2 2 0 012 2v6a2 2 0 01-2 2h-11a2 2 0 01-2-2v-6a2 2 0 012-2H7V9z"
        fill={color}
      />
      <Rect x={9} y={12} width={6} height={4} rx={1.2} fill="#fff" opacity={0.5} />
      <Path d="M9 9a3 3 0 016 0" fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.5} />
    </Svg>
  );
}

export function HandsIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={12} r={6} fill="none" stroke={color} strokeWidth={2.2} />
      <Circle cx={15} cy={12} r={6} fill="none" stroke={color} strokeWidth={2.2} />
    </Svg>
  );
}

export function ChatIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2V6z"
        fill={color}
      />
    </Svg>
  );
}

export function BookIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 6c-1.5-1-4-1.5-7-1v13c3-.5 5.5 0 7 1V6z" fill={color} />
      <Path d="M12 6c1.5-1 4-1.5 7-1v13c-3-.5-5.5 0-7 1V6z" fill={color} opacity={0.7} />
    </Svg>
  );
}

export function CheckIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function MegaphoneIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 10v4h3l7 4V6l-7 4H3z" fill={color} />
      <Path d="M15 9a4 4 0 010 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function PencilIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 21l1.4-5.4L15 5l4 4-10.6 10.6L3 21z" fill={color} />
      <Path d="M13.2 6.8l4 4" stroke="#fff" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />
    </Svg>
  );
}

export function ChartIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={13} width={4} height={7} rx={1.5} fill={color} opacity={0.55} />
      <Rect x={10} y={8} width={4} height={12} rx={1.5} fill={color} opacity={0.8} />
      <Rect x={16} y={4} width={4} height={16} rx={1.5} fill={color} />
    </Svg>
  );
}

export function WaveformIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={9} width={3} height={6} rx={1.5} fill={color} opacity={0.6} />
      <Rect x={8} y={5} width={3} height={14} rx={1.5} fill={color} />
      <Rect x={14} y={2} width={3} height={20} rx={1.5} fill={color} />
      <Rect x={19} y={7} width={3} height={10} rx={1.5} fill={color} opacity={0.6} />
    </Svg>
  );
}

export function SpeakerIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9v6h4l5 4V5L8 9H4z" fill={color} />
      <Path d="M17 9a4 4 0 010 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M19.5 7a7 7 0 010 10" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function MicrophoneIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={9} y={2} width={6} height={12} rx={3} fill={color} />
      <Path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CardsIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={6} y={4} width={13} height={16} rx={2.5} fill={color} opacity={0.5} transform="rotate(6 12.5 12)" />
      <Rect x={5} y={4} width={13} height={16} rx={2.5} fill={color} />
    </Svg>
  );
}

export function HeadphonesIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 14v-2a8 8 0 0116 0v2" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Rect x={2.5} y={13} width={5} height={7} rx={2} fill={color} />
      <Rect x={16.5} y={13} width={5} height={7} rx={2} fill={color} />
    </Svg>
  );
}

export function PeopleIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={8} cy={8} r={3.2} fill={color} />
      <Circle cx={16.5} cy={9.5} r={2.4} fill={color} opacity={0.6} />
      <Path d="M2.5 20c0-3.6 2.7-6 5.5-6s5.5 2.4 5.5 6" fill={color} />
      <Path d="M14.5 20c0-2.8 1.9-4.6 4-4.6s4 1.8 4 4.6" fill={color} opacity={0.6} />
    </Svg>
  );
}

export function GearIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M19.4 13.5a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.56V19.5a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.04-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1.04H4.5a2 2 0 110-4h.09a1.7 1.7 0 001.56-1.04 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H10.6a1.7 1.7 0 001.04-1.56V4.5a2 2 0 114 0v.09a1.7 1.7 0 001.04 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V10.6a1.7 1.7 0 001.56 1.04h.09a2 2 0 110 4h-.09a1.7 1.7 0 00-1.56 1.04z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PersonIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill={color} />
      <Path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" fill={color} />
    </Svg>
  );
}

export function BellIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 10a6 6 0 0112 0v4l1.5 3h-15L6 14v-4z"
        fill={color}
      />
      <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function MoonIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" fill={color} />
    </Svg>
  );
}

export function GlobeIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M3 12h18M12 3c2.8 2.4 4.2 5.6 4.2 9s-1.4 6.6-4.2 9c-2.8-2.4-4.2-5.6-4.2-9s1.4-6.6 4.2-9z" fill="none" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l8 3.5v6c0 5-3.4 8.8-8 10.5-4.6-1.7-8-5.5-8-10.5v-6L12 2z" fill={color} />
      <Path d="M8.5 12l2.5 2.5L16 9" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </Svg>
  );
}

export function LogOutIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 8l4 4-4 4M20 12H9" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TextSizeIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7V5h11v2M9.5 5v14M7.5 19h4" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 12v-1.5h6V12M19 10.5V19M17.7 19h2.6" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color = '#3B2E26', filled = true }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20.5S3.5 15.2 3.5 9.3C3.5 6.4 5.8 4 8.6 4c1.6 0 3 .8 3.9 2 .9-1.2 2.3-2 3.9-2 2.8 0 5.1 2.4 5.1 5.3 0 5.9-8.5 11.2-8.5 11.2z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 2}
      />
    </Svg>
  );
}

export function EyeIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 12c1.8-3.5 5.5-6.5 10-6.5s8.2 3 10 6.5c-1.8 3.5-5.5 6.5-10 6.5S3.8 15.5 2 12z"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} fill={color} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 3l18 18M9.5 9.7a3 3 0 004.2 4.2M6.5 6.7C4.5 8 3 10 2 12c1.8 3.5 5.5 6.5 10 6.5 1.6 0 3-.3 4.3-.9M10.7 5.2A10.6 10.6 0 0112 5c4.5 0 8.2 3 10 6.5-.6 1.1-1.3 2.2-2.2 3.1"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PaletteIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3a9 8 0 100 16c1.1 0 1.6-.7 1.6-1.5 0-.4-.15-.7-.4-1-.25-.3-.4-.6-.4-1 0-.8.65-1.4 1.45-1.4h1.7A3.6 3.6 0 0021 10.9C21 6.6 16.97 3 12 3z"
        fill={color}
      />
      <Circle cx={7.5} cy={10.5} r={1.3} fill="#fff" opacity={0.85} />
      <Circle cx={9.5} cy={7} r={1.3} fill="#fff" opacity={0.85} />
      <Circle cx={13.5} cy={6.3} r={1.3} fill="#fff" opacity={0.85} />
      <Circle cx={16.3} cy={9} r={1.3} fill="#fff" opacity={0.85} />
    </Svg>
  );
}

export function TeacupIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9z" fill={color} />
      <Path d="M17 10h1.5a2.5 2.5 0 010 5H17" fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M7 5.5c.6-.8.6-1.2 0-2M11 5.5c.6-.8.6-1.2 0-2" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

export function LanternIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 2h6v2H9z" fill={color} />
      <Rect x={7} y={5} width={10} height={12} rx={3} fill={color} />
      <Rect x={10.5} y={7} width={3} height={8} rx={1.5} fill="#fff" opacity={0.5} />
      <Path d="M12 17v5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ShellIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3c5 0 9 4.5 9 10 0 .7-.5 1-1 1h-2.5c0-2.5-2-4.5-4.5-4.5S8.5 11.5 8.5 14H6c-.5 0-1-.3-1-1 0-5.5 4-10 7-10z" fill={color} />
      <Path d="M8.5 14c0-1.6.6-3 3.5-3M12 11v3M15.5 14c0-1.6-.6-3-3.5-3" stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.6} />
      <Path d="M4.5 14h15c.5 2.5-1 5-2 6H6.5c-1-1-2.5-3.5-2-6z" fill={color} opacity={0.85} />
    </Svg>
  );
}

export function BatteryIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={7} width={17} height={10} rx={2.5} fill="none" stroke={color} strokeWidth={2} />
      <Rect x={20} y={10} width={2} height={4} rx={1} fill={color} />
      <Path d="M12 9l-3 4h2.5l-1 3 3.5-4.4h-2.5z" fill={color} />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={11} width={14} height={10} rx={2.5} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.6} fill={color} />
    </Svg>
  );
}

export function TrashIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h16" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M9 7V4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 7l1 12.5A2 2 0 009.5 21h5a2 2 0 002-2L17.5 7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

export function CopyIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={8} y={8} width={12} height={13} rx={2.2} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M16 8V5.2A2.2 2.2 0 0013.8 3H5.2A2.2 2.2 0 003 5.2v8.6A2.2 2.2 0 005.2 16H8" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function ArchiveIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={4} width={18} height={5} rx={1.8} fill={color} />
      <Path d="M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M10 13h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function DotsIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={2} fill={color} />
      <Circle cx={12} cy={12} r={2} fill={color} />
      <Circle cx={19} cy={12} r={2} fill={color} />
    </Svg>
  );
}

export function MenuListIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 6h16M4 12h16M4 18h16" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function TrophyIcon({ size = 24, color = '#3B2E26' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4h10v6a5 5 0 01-10 0V4z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M7 6H4.5a1 1 0 00-1 1.3C4 9.5 5.5 11 7 11.3M17 6h2.5a1 1 0 011 1.3C20 9.5 18.5 11 17 11.3" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 14v3" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8.5 20.5h7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M9.5 17.5h5l.7 3h-6.4z" fill={color} />
    </Svg>
  );
}
