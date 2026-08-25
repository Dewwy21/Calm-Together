import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../../theme';
import { StarIcon, BookIcon } from '../../components/icons';

const STREAK_IMAGE = require('../../../assets/icons/streak.png');

interface ProgressStatsProps {
  streak: number;
  totalLogs: number;
  positiveMoments: number;
}

// The motivating progress system that replaces the old wins jar: three
// glanceable stats rather than a single novelty visual.
export function ProgressStats({ streak, totalLogs, positiveMoments }: ProgressStatsProps) {
  const { color, spacing, typography } = useTheme();

  return (
    <View style={{ flexDirection: 'row' }}>
      <StatTile
        value={streak}
        label="day streak"
        icon={<Image source={STREAK_IMAGE} style={{ width: 26, height: 26, opacity: streak > 0 ? 1 : 0.35 }} resizeMode="contain" />}
      />
      <Divider />
      <StatTile value={totalLogs} label="total logs" icon={<BookIcon size={22} color={color.primary} />} />
      <Divider />
      <StatTile value={positiveMoments} label="positive moments" icon={<StarIcon size={22} color={color.accent} />} />
    </View>
  );

  function Divider() {
    return <View style={{ width: 1, backgroundColor: color.border, marginVertical: spacing.xs }} />;
  }

  function StatTile({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        {icon}
        <Text style={[typography.h2, { color: color.textPrimary }]}>{value}</Text>
        <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'center' }]}>{label}</Text>
      </View>
    );
  }
}
