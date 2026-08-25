import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { BlueprintUpdateLogEntry } from './types';
import { SOURCE_META } from './blueprintHelpers';

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function RecentlyUpdatedTimeline({ entries }: { entries: BlueprintUpdateLogEntry[] }) {
  const { color, spacing, typography, radii } = useTheme();

  if (entries.length === 0) {
    return (
      <Text style={[typography.bodySmall, { color: color.textSecondary, fontStyle: 'italic' }]}>
        Nothing learned yet — this fills in as you use the app.
      </Text>
    );
  }

  return (
    <View>
      {entries.map((entry, i) => {
        const meta = SOURCE_META[entry.sourceType];
        const isLast = i === entries.length - 1;
        const isSafety = !!entry.isSafetyEvent;
        return (
          <View key={entry.id} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.pill,
                  backgroundColor: isSafety ? color.warning : color.primaryTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <meta.icon size={14} color={isSafety ? color.textOnPrimary : color.primary} />
              </View>
              {!isLast && <View style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: color.border }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: spacing.md }}>
              {isSafety && <Text style={[typography.caption, { color: color.warning }]}>FLAGGED FOR SUPPORT</Text>}
              <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{entry.summary}</Text>
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                {meta.label} · {relativeTime(entry.createdAtISO)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
