import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, ToggleChip, SpeechBubble } from '../../../../src/components/ui';
import { AnimatedMascot } from '../../../../src/components/Mascot';
import { WaveformIcon } from '../../../../src/components/icons';
import { useTheme } from '../../../../src/theme';
import { ConnectDetailHeader } from '../../../../src/features/connect/ConnectDetailHeader';
import { getParentLessonById } from '../../../../src/features/connect/parentLearningData';
import { useSpeech } from '../../../../src/features/voice/useSpeech';
import { MascotMoment } from '../../../../src/features/mascot/MascotMoment';
import { markLessonCompleted } from '../../../../src/features/connect/parentLearningStorage';

export default function ParentLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const speech = useSpeech();
  const [finished, setFinished] = useState(false);

  const lesson = getParentLessonById(lessonId);

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Lesson not found</Text>
        <Button label="Back to Audio Library" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const paragraphs = lesson.script.split('\n\n');

  function toggleReadAloud() {
    if (speech.isSpeaking) {
      speech.stop();
    } else {
      speech.speak(`${lesson!.otterIntro}\n\n${lesson!.script}`, {
        onFinish: () => {
          setFinished(true);
          markLessonCompleted(lesson!.id);
        },
      });
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <ConnectDetailHeader onClose={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <View style={{ gap: 4 }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>
            {lesson.topic.toUpperCase()} · ~{lesson.estimatedMinutes} MIN
          </Text>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{lesson.title}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
          <AnimatedMascot size={40} motion="idle" />
          <View style={{ flex: 1 }}>
            <SpeechBubble text={lesson.otterIntro} />
          </View>
        </View>

        <ToggleChip
          icon={WaveformIcon}
          active={speech.isSpeaking}
          onPress={toggleReadAloud}
          activeLabel="Stop reading"
          inactiveLabel="Read aloud"
        />

        <View style={{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
              {p}
            </Text>
          ))}
        </View>

        <View style={{ backgroundColor: color.secondaryTint, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>Try This</Text>
          {lesson.exercises.map((ex, i) => (
            <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
              {i + 1}. {ex}
            </Text>
          ))}
        </View>

        <View style={{ backgroundColor: color.accentTint, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>Reflect</Text>
          <Text style={[typography.body, { color: color.textPrimary, fontStyle: 'italic' }]}>{lesson.reflection}</Text>
        </View>

        {finished && <MascotMoment motion="celebrate" text="You made it through this whole lesson. That's real time invested in yourself." />}

        {lesson.relatedActivity && (
          <Pressable
            onPress={() => router.push(lesson.relatedActivity!.href)}
            style={{
              backgroundColor: color.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={[typography.bodyEmphasis, { color: color.primary }]}>{lesson.relatedActivity.label}</Text>
            <Text style={[typography.bodyEmphasis, { color: color.primary }]}>→</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
