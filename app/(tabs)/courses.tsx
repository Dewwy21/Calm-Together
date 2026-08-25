import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, IconBubble } from '../../src/components/ui';
import { useTheme } from '../../src/theme';
import { TrophyIcon } from '../../src/components/icons';
import { COURSES } from '../../src/features/courses/courseData';
import { getCourseAccent } from '../../src/features/courses/courseColors';
import { useCourseProgressContext } from '../../src/features/courses/CourseProgressProvider';

export default function CoursesScreen() {
  const theme = useTheme();
  const { color, spacing, typography, radii, shadows } = theme;
  const router = useRouter();
  const progress = useCourseProgressContext();

  return (
    <Screen>
      <Text style={[typography.h1, { color: color.textPrimary }]}>Courses</Text>
      <Text style={[typography.body, { color: color.textSecondary, marginTop: -12 }]}>
        A learning library, at your own pace.
      </Text>

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
