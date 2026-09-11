import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, WeekStrip } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { useTheme } from '../../src/theme';
import { useDenContext } from '../../src/features/den/DenProvider';
import { ProgressStats } from '../../src/features/den/ProgressStats';
import { PrimaryLogButton } from '../../src/features/den/PrimaryLogButton';
import { QuickAccessCard } from '../../src/features/den/QuickAccessCard';
import { CaregiverStrip } from '../../src/features/den/CaregiverStrip';
import { PastLogsButton } from '../../src/features/logEvent/PastLogsButton';
import { timeOfDayGreeting, formattedToday, isMorning } from '../../src/features/den/greeting';
import { LeafIcon, ChartIcon, GearIcon, SwirlIcon, TrophyIcon, LanternIcon, HeartIcon, HandsIcon, ArrowRightIcon } from '../../src/components/icons';
import { CurrentChildBadge } from '../../src/features/profiles/CurrentChildBadge';
import { MascotMoment } from '../../src/features/mascot/MascotMoment';
import { useStreakCelebration } from '../../src/features/mascot/streakMilestones';
import { useCheckInContext } from '../../src/features/checkIn/CheckInProvider';
import { useProfilesContext } from '../../src/features/profiles/ProfilesProvider';
import { useBaselineAssessmentContext } from '../../src/features/baselineAssessment/BaselineAssessmentProvider';
import { getCheckpointStatus, CHECKPOINT_LABELS } from '../../src/features/baselineAssessment/checkpoints';

export default function DenScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const den = useDenContext();
  const checkIn = useCheckInContext();
  const { currentChild } = useProfilesContext();
  const { assessments } = useBaselineAssessmentContext();
  const { shouldCelebrate, milestone, dismiss } = useStreakCelebration(den.streak);

  const day14Status = getCheckpointStatus(currentChild?.interventionStartDateISO, assessments, 'day14');
  const day28Status = getCheckpointStatus(currentChild?.interventionStartDateISO, assessments, 'day28');
  const dueCheckpoint = day14Status.state === 'due' ? 'day14' : day28Status.state === 'due' ? 'day28' : null;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={[typography.display, { color: color.textPrimary, fontSize: 26 }]}>
            {timeOfDayGreeting()}
          </Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>{formattedToday()}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <CaregiverStrip caregivers={den.caregivers} />
          <PastLogsButton />
          <Pressable
            onPress={() => router.push('/(modals)/settings')}
            style={[
              {
                width: 44,
                height: 44,
                borderRadius: radii.sm,
                backgroundColor: color.surface,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <GearIcon size={20} color={color.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <CurrentChildBadge />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AnimatedMascot size={52} motion={isMorning() ? 'wave' : 'idle'} />
        <View style={{ flex: 1 }}>
          <PrimaryLogButton onPress={() => router.push('/(modals)/log-event')} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <QuickAccessCard
          icon={LeafIcon}
          label="Calm Corner"
          tint={color.secondaryTint}
          onPress={() => router.push('/(modals)/calm-corner')}
        />
        <QuickAccessCard
          icon={ChartIcon}
          label="Daily Progress"
          tint={color.accentTint}
          onPress={() => router.push('/(modals)/past-logs')}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <QuickAccessCard
          icon={SwirlIcon}
          label="Patterns"
          tint={color.secondaryTint}
          onPress={() => router.push('/(modals)/patterns')}
        />
        <QuickAccessCard
          icon={TrophyIcon}
          label="Growth Timeline"
          tint={color.accentTint}
          onPress={() => router.push('/(modals)/growth-timeline')}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <QuickAccessCard
          icon={LanternIcon}
          label="Family Blueprint"
          tint={color.secondaryTint}
          onPress={() => router.push('/(modals)/family-blueprint')}
        />
        <QuickAccessCard
          icon={HeartIcon}
          label={checkIn.isDue ? 'Check-In Due' : 'Weekly Check-In'}
          tint={color.accentTint}
          onPress={() => router.push('/(modals)/weekly-check-in')}
        />
      </View>

      {dueCheckpoint && (
        <Pressable
          onPress={() => router.push(`/onboarding?timepoint=${dueCheckpoint}`)}
          style={[
            { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md },
            shadows.card,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              backgroundColor: color.accentTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChartIcon size={20} color={color.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{CHECKPOINT_LABELS[dueCheckpoint]} is ready</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Same questions as before — takes a few minutes</Text>
          </View>
          <ArrowRightIcon size={16} color={color.textSecondary} />
        </Pressable>
      )}

      <Pressable
        onPress={() => router.push('/(modals)/act-check-in')}
        style={[
          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md },
          shadows.card,
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            backgroundColor: color.primaryTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HandsIcon size={20} color={color.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>ACT Parenting Check-In</Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>A guided pause for a specific hard moment</Text>
        </View>
        <ArrowRightIcon size={16} color={color.textSecondary} />
      </Pressable>

      <Card style={{ gap: spacing.lg }}>
        <Text style={[typography.h3, { color: color.textPrimary }]}>This week</Text>
        <WeekStrip checkedDays={den.checkedDays} todayIndex={den.todayIndex} />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={[typography.h3, { color: color.textPrimary }]}>Your progress</Text>
        <ProgressStats
          streak={den.streak}
          totalLogs={den.totalLogs}
          positiveMoments={den.positiveMomentsCount}
        />
      </Card>

      <Modal visible={shouldCelebrate} transparent animationType="fade" onRequestClose={dismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Pressable
            onPress={dismiss}
            style={[{ backgroundColor: color.surface, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 340, alignItems: 'center' }, shadows.raised]}
          >
            <MascotMoment
              motion="celebrate"
              text={`${milestone}-day streak! You've shown up for your family ${milestone} days in a row.`}
              size={72}
            />
            <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>Tap anywhere to keep going.</Text>
          </Pressable>
        </View>
      </Modal>
    </Screen>
  );
}
