import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui';
import { AnimatedMascot } from '../../components/Mascot';
import { CheckIcon, CloseIcon } from '../../components/icons';
import { LessonStoryProgress } from './LessonStoryProgress';
import { useLessonQuizState } from './useLessonQuizState';
import { LessonQuiz } from './quizTypes';

interface LessonQuizViewProps {
  quiz: LessonQuiz;
  lessonId: string;
  accentColor: string;
  accentTint: string;
  /** Called once the caregiver taps "Continue" from the results screen — the lesson player treats this the same as its normal Finish Lesson action. */
  onFinish: () => void;
  /** When provided, shows a "Watch Video Again" option on the results screen — omit if the lesson has no video card. */
  onWatchVideoAgain?: () => void;
}

// A self-contained "Check Your Understanding" quiz — question by question,
// an explanation per answer choice (not just one shared explanation),
// results, and a full review. Drop this into any lesson that has a
// `quiz` (see quizTypes.ts) with no other wiring needed; useLessonQuizState
// handles saving the attempt to the child's history and marking the
// lesson complete.
export function LessonQuizView({ quiz, lessonId, accentColor, accentTint, onFinish, onWatchVideoAgain }: LessonQuizViewProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const quizState = useLessonQuizState(quiz, lessonId);

  if (quizState.phase === 'results') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
        <AnimatedMascot size={110} motion="celebrate" />
        <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>{quiz.title} — done!</Text>
        <View
          style={[
            { backgroundColor: accentTint, borderRadius: radii.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
          ]}
        >
          <Text style={[typography.h1, { color: accentColor, textAlign: 'center' }]}>
            {quizState.correctCount} / {quizState.totalQuestions}
          </Text>
        </View>
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
          {quizState.correctCount === quizState.totalQuestions
            ? 'Every answer, right on target.'
            : 'Take a look back at any question, any time.'}
        </Text>
        <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.md }}>
          <Button label="Review Answers" variant="secondary" onPress={quizState.goToReview} />
          {onWatchVideoAgain && <Button label="Watch Video Again" variant="secondary" onPress={onWatchVideoAgain} />}
          <Button label="Continue" onPress={onFinish} />
        </View>
      </View>
    );
  }

  if (quizState.phase === 'review') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>Review</Text>
          {quiz.questions.map((q, i) => {
            const picked = quizState.selections[q.id];
            const isCorrect = picked === q.correctIndex;
            return (
              <View key={q.id} style={[{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm }, shadows.card]}>
                <Text style={[typography.caption, { color: color.textSecondary }]}>QUESTION {i + 1}</Text>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{q.question}</Text>
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isRight = oi === q.correctIndex;
                  if (!isPicked && !isRight) return null;
                  return (
                    <View key={oi} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      {isRight ? <CheckIcon size={14} color={color.success} /> : <CloseIcon size={14} color={color.warning} />}
                      <Text style={[typography.bodySmall, { color: isRight ? color.success : color.warning, flex: 1 }]}>{opt.text}</Text>
                    </View>
                  );
                })}
                <Text style={[typography.caption, { color: color.textSecondary }]}>{q.options[picked]?.explanation}</Text>
                {!isCorrect && (
                  <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>
                    {q.options[q.correctIndex].explanation}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
        <View style={{ padding: spacing.lg }}>
          <Button label="Back to Results" onPress={quizState.backToResults} />
        </View>
      </View>
    );
  }

  const { question, selectedIndex } = quizState;
  const answered = selectedIndex !== undefined;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.xs }}>
        <Text style={[typography.caption, { color: color.textSecondary }]}>
          Question {quizState.questionIndex + 1} of {quizState.totalQuestions}
        </Text>
        <LessonStoryProgress total={quizState.totalQuestions} current={quizState.questionIndex} accentColor={accentColor} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, flexGrow: 1 }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AnimatedMascot size={64} motion={answered ? 'idle' : 'sway'} />
          <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{question.question}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          {question.options.map((option, i) => {
            const isSelected = selectedIndex === i;
            const isCorrectOption = i === question.correctIndex;
            const bg = !answered ? color.surfaceAlt : isCorrectOption ? color.success : isSelected ? color.warning : color.surfaceAlt;
            const textColor = answered && (isCorrectOption || isSelected) ? color.textOnPrimary : color.textPrimary;

            return (
              <Pressable
                key={i}
                disabled={answered}
                onPress={() => quizState.selectOption(i)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: bg, borderRadius: radii.md, padding: spacing.md }}
              >
                {answered && isCorrectOption && <CheckIcon size={16} color={color.textOnPrimary} />}
                {answered && isSelected && !isCorrectOption && <CloseIcon size={16} color={color.textOnPrimary} />}
                <Text style={[typography.body, { color: textColor, flex: 1 }]}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>

        {answered && (
          <View style={[{ backgroundColor: accentTint, borderRadius: radii.md, padding: spacing.md, gap: 4 }]}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>
              {selectedIndex === question.correctIndex ? 'Correct!' : 'Not quite'}
            </Text>
            <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{question.options[selectedIndex].explanation}</Text>
          </View>
        )}
      </ScrollView>

      {answered && (
        <View style={{ padding: spacing.lg }}>
          <Button
            label={quizState.questionIndex === quizState.totalQuestions - 1 ? 'See Results' : 'Next Question'}
            onPress={quizState.goToNextQuestion}
          />
        </View>
      )}
    </View>
  );
}
