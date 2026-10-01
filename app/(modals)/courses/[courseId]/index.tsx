import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, BackButton, IconBubble } from '../../../../src/components/ui';
import { AnimatedMascot } from '../../../../src/components/Mascot';
import { CheckIcon, LockIcon, TrophyIcon } from '../../../../src/components/icons';
import { getCourseById, getLessonsForCourse } from '../../../../src/features/courses/courseData';
import { getCourseAccent } from '../../../../src/features/courses/courseColors';
import { TrailConnector } from '../../../../src/features/courses/TrailConnector';
import { useCourseProgressContext } from '../../../../src/features/courses/CourseProgressProvider';
import { usePersonalizedLessonsContext } from '../../../../src/features/personalizedLessons/PersonalizedLessonsProvider';
import { usePatternInsights } from '../../../../src/features/patterns/usePatternInsights';
import { useProfilesContext } from '../../../../src/features/profiles/ProfilesProvider';
import { isLessonUnlocked, getUnlockDayForLesson } from '../../../../src/features/courses/coursePath';
import { usePreferencesContext } from '../../../../src/features/preferences/PreferencesProvider';

export default function CoursePathScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const theme = useTheme();
  const { color, spacing, typography, radii, shadows } = theme;
  const router = useRouter();
  const progress = useCourseProgressContext();
  const { currentChild } = useProfilesContext();
  const { preferences } = usePreferencesContext();

  const course = getCourseById(courseId);

  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Course not found</Text>
      </SafeAreaView>
    );
  }

  const { accentColor, accentTint } = getCourseAccent(theme, course.id);

  if (course.id === 'personalized') {
    return <PersonalizedCourseScreen course={course} accentColor={accentColor} accentTint={accentTint} />;
  }

  const lessons = getLessonsForCourse(course.id);
  const stats = progress.courseStats(course.id);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{course.title}</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{course.subtitle}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{ height: 8, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ width: `${stats.percent * 100}%`, height: '100%', backgroundColor: accentColor }} />
        </View>
        <Text style={[typography.caption, { color: color.textSecondary, marginTop: spacing.xs }]}>
          {stats.completed} of {stats.total} lessons complete
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {lessons.map((lesson, i) => {
          const completed = progress.isLessonCompleted(lesson.id);
          const unlocked = isLessonUnlocked(lesson.id, currentChild?.interventionStartDateISO, preferences.unlockAllLessons);
          const locked = !completed && !unlocked;
          const isCurrent = !completed && !locked;
          const alignRight = i % 2 === 1;
          const unlockDay = getUnlockDayForLesson(lesson.id);

          return (
            <View key={lesson.id}>
              {i > 0 && <TrailConnector direction={i % 2 === 1 ? 'toRight' : 'toLeft'} />}
              <View style={{ alignItems: alignRight ? 'flex-end' : 'flex-start' }}>
                <Pressable
                  disabled={locked}
                  onPress={() => router.push(`/(modals)/courses/${course.id}/${lesson.id}`)}
                  style={[
                    {
                      width: '82%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      backgroundColor: color.surface,
                      borderRadius: radii.lg,
                      padding: spacing.md,
                      opacity: locked ? 0.55 : 1,
                      borderWidth: isCurrent ? 2 : 0,
                      borderColor: accentColor,
                    },
                    shadows.card,
                  ]}
                >
                  {locked ? (
                    <IconBubble icon={LockIcon} color={color.surfaceAlt} iconColor={color.textSecondary} size={44} />
                  ) : completed ? (
                    <IconBubble icon={CheckIcon} color={accentColor} iconColor={color.textOnPrimary} size={44} />
                  ) : (
                    <IconBubble icon={lesson.icon} color={accentTint} iconColor={accentColor} size={44} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h3, { color: color.textPrimary }]}>{lesson.title}</Text>
                    <Text style={[typography.bodySmall, { color: color.textSecondary }]} numberOfLines={2}>
                      {locked ? (unlockDay ? `Unlocks on Day ${unlockDay}` : 'Not available yet') : lesson.summary}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          );
        })}

        {stats.completed === stats.total && stats.total > 0 && (
          <View style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, padding: spacing.lg, backgroundColor: accentTint, borderRadius: radii.lg }}>
            <TrophyIcon size={28} color={accentColor} />
            <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>Course complete!</Text>
            <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>
              You've finished every lesson in {course.title}.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// "My Personalized Lessons" isn't a fixed, lockstep sequence like the other
// four courses — it's an accumulating library the caregiver (and the
// pattern detector) build over time, so it gets its own layout: a way to
// start generating, suggestions worth acting on, and whatever's already
// been made.
function PersonalizedCourseScreen({
  course,
  accentColor,
  accentTint,
}: {
  course: ReturnType<typeof getCourseById>;
  accentColor: string;
  accentTint: string;
}) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const progress = useCourseProgressContext();
  const personalized = usePersonalizedLessonsContext();
  const { patterns, interpretationFor } = usePatternInsights();

  if (!course) return null;

  const generatedTopics = new Set(personalized.lessons.map((l) => l.source.label));
  const suggestions = patterns
    .map((p) => ({ pattern: p, topic: interpretationFor(p.id)?.suggestedLessonTopic ?? p.suggestedLessonTopic }))
    .filter(
      (s): s is { pattern: (typeof patterns)[number]; topic: string } =>
        !!s.topic && !personalized.dismissedSuggestionTopics.includes(s.topic) && !generatedTopics.has(s.topic)
    )
    .slice(0, 3);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{course.title}</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{course.subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.sm }}>
        <Button label="+ Generate a New Lesson" onPress={() => router.push('/(modals)/courses/personalized/new')} />

        {suggestions.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>Suggested for you</Text>
            {suggestions.map(({ pattern, topic }) => (
              <View key={pattern.id} style={[{ backgroundColor: accentTint, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm }]}>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{pattern.title}</Text>
                <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{pattern.summary}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Pressable
                    onPress={() => router.push(`/(modals)/courses/personalized/new?sourceType=pattern&topic=${encodeURIComponent(topic)}`)}
                    style={{ backgroundColor: accentColor, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
                  >
                    <Text style={[typography.bodySmall, { color: color.textOnPrimary }]}>Generate lesson</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => personalized.dismissSuggestionTopic(topic)}
                    style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
                  >
                    <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Dismiss</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>Your lessons</Text>

          {personalized.lessons.length === 0 ? (
            <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
              <AnimatedMascot size={80} motion="idle" />
              <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
                Nothing generated yet. Pick a log entry, a Help Bot conversation, a pattern, or your own topic to build your first one.
              </Text>
            </View>
          ) : (
            personalized.lessons.map((lesson) => {
              const completed = progress.isLessonCompleted(lesson.id);
              return (
                <Pressable
                  key={lesson.id}
                  onPress={() => router.push(`/(modals)/courses/${course.id}/${lesson.id}`)}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md },
                    shadows.card,
                  ]}
                >
                  <IconBubble
                    icon={completed ? CheckIcon : lesson.icon}
                    color={completed ? accentColor : accentTint}
                    iconColor={completed ? color.textOnPrimary : accentColor}
                    size={44}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h3, { color: color.textPrimary }]}>{lesson.title}</Text>
                    <Text style={[typography.caption, { color: color.textSecondary }]} numberOfLines={1}>
                      {lesson.source.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
