import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { Mascot } from '../../components/Mascot';
import { PencilIcon } from '../../components/icons';
import { QUESTIONS } from './questions';
import { SECTIONS } from './sections';
import { OnboardingAnswers } from './types';
import { resolveAnswerText } from './resolveAnswerText';

interface OnboardingReviewProps {
  answers: OnboardingAnswers;
  onEditQuestion: (questionIndex: number) => void;
}

// A plain, uninterpreted echo of every answer given, grouped by section —
// not a curated "here's what we learned" recap. Tapping any answer jumps
// back to that exact question so it can be changed before submitting.
export function OnboardingReview({ answers, onEditQuestion }: OnboardingReviewProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <View style={{ flex: 1, gap: spacing.xl }}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Mascot size={90} />
        <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>Review your answers</Text>
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
          Tap anything you'd like to change before submitting.
        </Text>
      </View>

      {SECTIONS.map((section) => {
        const rows = section.questionIds
          .map((questionId) => ({ questionId, text: resolveAnswerText(answers, questionId) }))
          .filter((r) => r.text !== null);
        if (rows.length === 0) return null;

        return (
          <View key={section.id} style={{ gap: spacing.sm }}>
            <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>
              SECTION {section.sectionNumber} — {section.title.toUpperCase()}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {rows.map(({ questionId, text }) => {
                const questionIndex = QUESTIONS.findIndex((q) => q.id === questionId);
                const question = QUESTIONS[questionIndex];
                return (
                  <Pressable
                    key={questionId}
                    onPress={() => onEditQuestion(questionIndex)}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: spacing.sm,
                        backgroundColor: color.surface,
                        borderRadius: radii.md,
                        padding: spacing.md,
                      },
                      shadows.card,
                    ]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[typography.caption, { color: color.textSecondary }]}>{question.prompt}</Text>
                      <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{text}</Text>
                    </View>
                    <PencilIcon size={14} color={color.textSecondary} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
