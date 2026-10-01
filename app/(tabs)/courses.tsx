import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, IconBubble } from '../../src/components/ui';
import { useTheme } from '../../src/theme';
import { TrophyIcon, ArrowRightIcon } from '../../src/components/icons';
import { COURSES } from '../../src/features/courses/courseData';
import { getCourseAccent } from '../../src/features/courses/courseColors';
import { useCourseProgressContext } from '../../src/features/courses/CourseProgressProvider';
import { useProfilesContext } from '../../src/features/profiles/ProfilesProvider';
import { getSuggestedLessonForDay, isLessonUnlocked, getWeekForDay } from '../../src/features/courses/coursePath';
import { getInterventionDayNumber, TOTAL_INTERVENTION_DAYS } from '../../src/features/baselineAssessment/checkpoints';

export default function CoursesScreen() {
  const theme = useTheme();
  const { color, spacing, typography, radii, shadows } = theme;
  const router = useRouter();
  const progress = useCourseProgressContext();
  const { currentChild } = useProfilesContext();

  const interventionStart = currentChild?.interventionStartDateISO;
  const dayNumber = interventionStart ? getInterventionDayNumber(interventionStart) : null;
  const week = dayNumber ? getWeekForDay(dayNumber) : null;

  // "Next lesson" is the earliest unlocked-but-not-yet-completed lesson —
  // not simply "today's", so falling a day behind still points at the
  // right one to pick up rather than skipping ahead to today's slot.
  let nextLesson = null;
  if (dayNumber) {
    for (let d = 1; d <= dayNumber; d++) {
      const candidate = getSuggestedLessonForDay(d);
      if (candidate && !progress.isLessonCompleted(candidate.id)) {
        nextLesson = candidate;
        break;
      }
    }
  }
  const day1Lesson = getSuggestedLessonForDay(1);

  return (
    <Screen>
      <Text style={[typography.h1, { color: color.textPrimary }]}>Courses</Text>
      <Text style={[typography.body, { color: color.textSecondary, marginTop: -12 }]}>
        Your 28-day program, one lesson a day.
      </Text>

      {!interventionStart && day1Lesson && (
        <Pressable
          onPress={() => router.push(`/(modals)/courses/${day1Lesson.courseId}/${day1Lesson.id}`)}
          style={[
            { backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
            shadows.card,
          ]}
        >
          <Text style={[typography.h3, { color: color.textPrimary }]}>Ready to begin?</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            A new lesson unlocks automatically every day for 28 days. Start with Day 1 whenever you're ready.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
            <Text style={[typography.bodyEmphasis, { color: color.primary }]}>Start Day 1: {day1Lesson.title}</Text>
            <ArrowRightIcon size={16} color={color.primary} />
          </View>
        </Pressable>
      )}

      {interventionStart && dayNumber && week && (
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={[typography.h2, { color: color.textPrimary }]}>
              Day {dayNumber} of {TOTAL_INTERVENTION_DAYS}
            </Text>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Week {week} of 4</Text>
          </View>
          <View style={{ height: 8, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${(dayNumber / TOTAL_INTERVENTION_DAYS) * 100}%`, height: '100%', backgroundColor: color.primary }} />
          </View>

          {nextLesson ? (
            <Pressable
              onPress={() => router.push(`/(modals)/courses/${nextLesson.courseId}/${nextLesson.id}`)}
              style={[
                { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.xs },
                shadows.card,
              ]}
            >
              <IconBubble icon={nextLesson.icon} color={color.accentTint} iconColor={color.accent} size={48} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>Next lesson</Text>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{nextLesson.title}</Text>
              </View>
              <ArrowRightIcon size={16} color={color.textSecondary} />
            </Pressable>
          ) : (
            <View style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.xs }}>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
                {dayNumber >= TOTAL_INTERVENTION_DAYS
                  ? "You're all caught up — the 28-day program is complete!"
                  : "You're all caught up for today. The next lesson unlocks tomorrow."}
              </Text>
            </View>
          )}
        </View>
      )}

      {progress.streak > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            alignSelf: 'flex-start',
            backgroundColor: color.surfaceAlt,
            borderRadius: radii.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          <TrophyIcon size={16} color={color.warning} />
          <Text style={[typography.bodySmall, { color: color.textPrimary }]}>
            {progress.streak}-day learning streak
          </Text>
        </View>
      )}

      <View style={{ gap: spacing.md }}>
        {COURSES.map((course) => {
          const { accentColor, accentTint } = getCourseAccent(theme, course.id);
          const stats = progress.courseStats(course.id);
          const started = stats.completed > 0;

          return (
            <Pressable
              key={course.id}
              onPress={() => router.push(`/(modals)/courses/${course.id}`)}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  backgroundColor: color.surface,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                },
                shadows.card,
              ]}
            >
              <IconBubble icon={course.icon} color={accentTint} iconColor={accentColor} size={56} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[typography.h3, { color: color.textPrimary }]}>{course.title}</Text>
                <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
                  {course.subtitle}
                </Text>
                <View style={{ height: 6, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden', marginTop: 4 }}>
                  <View style={{ width: `${stats.percent * 100}%`, height: '100%', backgroundColor: accentColor }} />
                </View>
                <Text style={[typography.caption, { color: color.textSecondary }]}>
                  {stats.completed === stats.total && stats.total > 0
                    ? 'Complete'
                    : started
                    ? `${stats.completed} of ${stats.total} lessons`
                    : `${stats.total} lessons`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
