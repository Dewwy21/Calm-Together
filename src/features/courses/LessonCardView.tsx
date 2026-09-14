import React, { useMemo } from 'react';
import { View, Text, TextInput, Pressable, Image, Linking } from 'react-native';
import { useTheme } from '../../theme';
import { IconBubble } from '../../components/ui';
import { CheckIcon, ArrowRightIcon, StarIcon, ChatIcon, HeadphonesIcon } from '../../components/icons';
import { LessonCard, SequenceCard, MediaCard } from './types';
import { seededShuffle } from '../../utils/seededPick';
import { resolveVideoWatchUrl, resolveVideoThumbnailUrl } from './mediaSources';
import { useLessonMediaAudio } from './useLessonMediaAudio';

const KIND_LABELS: Record<LessonCard['kind'], string> = {
  intro: 'START HERE',
  concept: 'KEY IDEA',
  example: 'REAL LIFE',
  comparison: 'INSTEAD OF / TRY',
  timeline: 'STEP BY STEP',
  decisionTree: 'IF THIS, TRY THAT',
  stat: 'WORTH KNOWING',
  quiz: 'QUICK CHECK',
  reflection: 'REFLECT',
  exercise: 'TRY THIS TODAY',
  scenario: 'WHAT WOULD YOU DO?',
  sequence: 'PUT IN ORDER',
  media: 'WATCH & LISTEN',
};

interface LessonCardViewProps {
  card: LessonCard;
  accentColor: string;
  accentTint: string;
  quizSelection?: number;
  onSelectQuiz?: (index: number) => void;
  reflectionValue?: string;
  onChangeReflection?: (text: string) => void;
  scenarioSelection?: number;
  onSelectScenario?: (index: number) => void;
  sequenceOrder?: number[];
  onTapSequenceItem?: (originalIndex: number) => void;
  onResetSequence?: () => void;
}

export function LessonCardView({
  card,
  accentColor,
  accentTint,
  quizSelection,
  onSelectQuiz,
  reflectionValue,
  onChangeReflection,
  scenarioSelection,
  onSelectScenario,
  sequenceOrder,
  onTapSequenceItem,
  onResetSequence,
}: LessonCardViewProps) {
  const { color, spacing, typography, radii, shadows } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: color.surface,
          borderRadius: radii.xl,
          padding: spacing.xl,
          gap: spacing.lg,
        },
        shadows.card,
      ]}
    >
      <Text style={[typography.caption, { color: accentColor, letterSpacing: 1 }]}>{KIND_LABELS[card.kind]}</Text>

      {card.kind === 'intro' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <IconBubble icon={card.icon} color={accentTint} size={72} />
          <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>{card.title}</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>{card.hook}</Text>
        </View>
      )}

      {card.kind === 'concept' && (
        <View style={{ flex: 1, gap: spacing.lg, justifyContent: 'center' }}>
          <IconBubble icon={card.icon} color={accentTint} size={56} />
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>{card.body}</Text>
        </View>
      )}

      {card.kind === 'example' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          <View style={{ backgroundColor: accentTint, borderRadius: radii.lg, padding: spacing.lg }}>
            <Text style={[typography.body, { color: color.textPrimary, fontStyle: 'italic' }]}>{card.scenario}</Text>
          </View>
          <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>{card.takeaway}</Text>
        </View>
      )}

      {card.kind === 'comparison' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1, backgroundColor: color.surfaceAlt, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs }}>
              <Text style={[typography.caption, { color: color.textSecondary }]}>{card.leftLabel.toUpperCase()}</Text>
              {card.leftItems.map((item, i) => (
                <Text key={i} style={[typography.bodySmall, { color: color.textPrimary }]}>
                  {item}
                </Text>
              ))}
            </View>
            <View style={{ flex: 1, backgroundColor: accentTint, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs }}>
              <Text style={[typography.caption, { color: accentColor }]}>{card.rightLabel.toUpperCase()}</Text>
              {card.rightItems.map((item, i) => (
                <Text key={i} style={[typography.bodySmall, { color: color.textPrimary }]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {card.kind === 'timeline' && (
        <View style={{ flex: 1, gap: spacing.lg, justifyContent: 'center' }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          <View style={{ gap: 0 }}>
            {card.steps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ alignItems: 'center', width: 24 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: radii.pill,
                      backgroundColor: accentColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={[typography.caption, { color: color.textOnPrimary }]}>{i + 1}</Text>
                  </View>
                  {i < card.steps.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: color.border }} />}
                </View>
                <Text style={[typography.body, { color: color.textPrimary, flex: 1, paddingBottom: spacing.md }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {card.kind === 'decisionTree' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          {card.branches.map((branch, i) => (
            <View key={i} style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.lg, padding: spacing.md, gap: 4 }}>
              <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]}>If: {branch.condition}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <ArrowRightIcon size={14} color={accentColor} />
                <Text style={[typography.bodySmall, { color: accentColor, flex: 1 }]}>{branch.action}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {card.kind === 'stat' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <IconBubble icon={card.icon} color={accentTint} size={56} />
          <Text style={[typography.display, { color: accentColor, textAlign: 'center', fontSize: 40 }]}>{card.statText}</Text>
          <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{card.heading}</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>{card.detail}</Text>
        </View>
      )}

      {card.kind === 'quiz' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ChatIcon size={22} color={accentColor} />
            <Text style={[typography.h3, { color: color.textPrimary, flex: 1 }]}>{card.question}</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {card.options.map((option, i) => {
              const isSelected = quizSelection === i;
              const isCorrect = i === card.correctIndex;
              const revealed = quizSelection !== undefined;
              const bg = !revealed
                ? color.surfaceAlt
                : isCorrect
                ? color.success
                : isSelected
                ? color.warning
                : color.surfaceAlt;
              const textColor = revealed && (isCorrect || isSelected) ? color.textOnPrimary : color.textPrimary;
              return (
                <Pressable
                  key={i}
                  disabled={revealed}
                  onPress={() => onSelectQuiz?.(i)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    backgroundColor: bg,
                    borderRadius: radii.md,
                    padding: spacing.md,
                  }}
                >
                  {revealed && isCorrect && <CheckIcon size={16} color={color.textOnPrimary} />}
                  <Text style={[typography.body, { color: textColor, flex: 1 }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          {quizSelection !== undefined && (
            <View style={{ backgroundColor: accentTint, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{card.explanation}</Text>
            </View>
          )}
        </View>
      )}

      {card.kind === 'reflection' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <IconBubble icon={StarIcon} color={accentTint} size={48} />
          <Text style={[typography.h3, { color: color.textPrimary }]}>{card.prompt}</Text>
          <TextInput
            value={reflectionValue ?? ''}
            onChangeText={onChangeReflection}
            placeholder="Jot down whatever comes to mind (optional)..."
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              minHeight: 100,
              backgroundColor: color.surfaceAlt,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
              textAlignVertical: 'top',
            }}
          />
        </View>
      )}

      {card.kind === 'exercise' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <IconBubble icon={CheckIcon} color={accentColor} size={56} />
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.title}</Text>
          <Text style={[typography.body, { color: color.textSecondary }]}>{card.instructions}</Text>
        </View>
      )}

      {card.kind === 'scenario' && (
        <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
          <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
          <View style={{ backgroundColor: accentTint, borderRadius: radii.lg, padding: spacing.lg }}>
            <Text style={[typography.body, { color: color.textPrimary, fontStyle: 'italic' }]}>{card.situation}</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {card.options.map((option, i) => {
              const isSelected = scenarioSelection === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => onSelectScenario?.(i)}
                  style={{
                    backgroundColor: isSelected ? accentColor : color.surfaceAlt,
                    borderRadius: radii.md,
                    padding: spacing.md,
                  }}
                >
                  <Text style={[typography.body, { color: isSelected ? color.textOnPrimary : color.textPrimary }]}>{option.text}</Text>
                </Pressable>
              );
            })}
          </View>
          {scenarioSelection !== undefined && (
            <View style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={[typography.bodySmall, { color: color.textPrimary }]}>{card.options[scenarioSelection].feedback}</Text>
            </View>
          )}
        </View>
      )}

      {card.kind === 'sequence' && (
        <SequenceCardBody
          card={card}
          accentColor={accentColor}
          order={sequenceOrder ?? []}
          onTapItem={onTapSequenceItem}
          onReset={onResetSequence}
        />
      )}

      {card.kind === 'media' && <MediaCardBody card={card} accentColor={accentColor} accentTint={accentTint} />}
    </View>
  );
}

// A video opens externally (Linking.openURL) rather than embedding an
// inline player — this app has no WebView/native video dependency, and
// adding one just for this would be a bigger change than the media system
// itself needs to be. Audio plays inline: expo-audio's useAudioPlayer
// already accepts a remote URL directly (same dependency Calm Corner's
// ambient track already uses), so no new dependency there. Pulled into its
// own component, like SequenceCardBody above, so useLessonMediaAudio's
// hook is only mounted while a media card is actually showing.
function MediaCardBody({ card, accentColor, accentTint }: { card: MediaCard; accentColor: string; accentTint: string }) {
  const { color, spacing, typography, radii } = useTheme();
  const audio = useLessonMediaAudio(card.mediaType === 'audio' ? card.sourceUrl : null);

  if (!card.sourceUrl) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <IconBubble icon={card.mediaType === 'audio' ? HeadphonesIcon : ChatIcon} color={accentTint} size={56} />
        <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{card.title}</Text>
        <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>
          This {card.mediaType} is on its way — check back soon.
        </Text>
      </View>
    );
  }

  if (card.mediaType === 'audio') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <Pressable
          onPress={audio.toggle}
          style={{
            width: 72,
            height: 72,
            borderRadius: radii.pill,
            backgroundColor: accentColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: color.textOnPrimary, fontSize: 26 }}>{audio.isPlaying ? '❙❙' : '▶'}</Text>
        </Pressable>
        <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{card.title}</Text>
        {!!card.caption && <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>{card.caption}</Text>}
      </View>
    );
  }

  const thumbnailUrl = resolveVideoThumbnailUrl(card.sourceUrl);
  return (
    <Pressable
      onPress={() => Linking.openURL(resolveVideoWatchUrl(card.sourceUrl!))}
      style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}
    >
      <View
        style={{
          borderRadius: radii.lg,
          overflow: 'hidden',
          backgroundColor: accentTint,
          aspectRatio: 16 / 9,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {thumbnailUrl && <Image source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%', position: 'absolute' }} />}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radii.pill,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 22, marginLeft: 3 }}>▶</Text>
        </View>
      </View>
      <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{card.title}</Text>
      {!!card.caption && <Text style={[typography.bodySmall, { color: color.textSecondary, textAlign: 'center' }]}>{card.caption}</Text>}
    </Pressable>
  );
}

// A tap-to-order activity needs its own shuffled display order that stays
// stable across re-renders — pulled into its own component (rather than
// calling useMemo inline inside LessonCardView's conditional JSX) so the
// hook is always called unconditionally, only while this card kind is
// actually mounted.
function SequenceCardBody({
  card,
  accentColor,
  order,
  onTapItem,
  onReset,
}: {
  card: SequenceCard;
  accentColor: string;
  order: number[];
  onTapItem?: (originalIndex: number) => void;
  onReset?: () => void;
}) {
  const { color, spacing, typography, radii } = useTheme();
  const shuffledIndices = useMemo(
    () => seededShuffle(card.items.map((_, i) => i), card.id),
    [card.id, card.items]
  );
  const remaining = shuffledIndices.filter((i) => !order.includes(i));
  const revealed = order.length === card.items.length;

  return (
    <View style={{ flex: 1, gap: spacing.md, justifyContent: 'center' }}>
      <Text style={[typography.h2, { color: color.textPrimary }]}>{card.heading}</Text>
      {!!card.instructions && <Text style={[typography.body, { color: color.textSecondary }]}>{card.instructions}</Text>}

      {order.length > 0 && (
        <View style={{ gap: spacing.xs }}>
          {order.map((originalIndex, position) => {
            const isCorrect = originalIndex === position;
            return (
              <View
                key={originalIndex}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: revealed ? (isCorrect ? color.success : color.warning) : color.surfaceAlt,
                  borderRadius: radii.md,
                  padding: spacing.md,
                }}
              >
                <Text style={[typography.bodyEmphasis, { color: revealed ? color.textOnPrimary : accentColor }]}>{position + 1}</Text>
                <Text style={[typography.body, { color: revealed ? color.textOnPrimary : color.textPrimary, flex: 1 }]}>
                  {card.items[originalIndex]}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {!revealed && (
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>Tap in the order you think is right</Text>
          {remaining.map((originalIndex) => (
            <Pressable
              key={originalIndex}
              onPress={() => onTapItem?.(originalIndex)}
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderRadius: radii.md, padding: spacing.md }}
            >
              <Text style={[typography.body, { color: color.textPrimary }]}>{card.items[originalIndex]}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {revealed && (
        <Pressable onPress={onReset} hitSlop={8}>
          <Text style={[typography.bodyEmphasis, { color: accentColor }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
