import { Lesson, LessonCard } from './types';

// A complete, plain-text rendering of one card for the AI to reference —
// deliberately more thorough than lessonSpeech.ts's cardToSpeechText
// (which is spoken aloud and stays terse/spoiler-free, e.g. it withholds a
// quiz's correct answer). Here the AI is meant to have the full picture,
// including things like a quiz's explanation or a scenario's per-option
// feedback, since it's reference material rather than narration.
function cardToReferenceText(card: LessonCard): string {
  switch (card.kind) {
    case 'intro':
      return `[Intro] ${card.title}: ${card.hook}`;
    case 'concept':
      return `[Key idea: ${card.heading}] ${card.body}`;
    case 'example':
      return `[Example: ${card.heading}] ${card.scenario} Takeaway: ${card.takeaway}`;
    case 'comparison':
      return `[Comparison: ${card.heading}] ${card.leftLabel}: ${card.leftItems.join('; ')}. ${card.rightLabel}: ${card.rightItems.join('; ')}.`;
    case 'timeline':
      return `[Steps: ${card.heading}] ${card.steps.map((s, i) => `${i + 1}. ${s}`).join(' ')}`;
    case 'decisionTree':
      return `[If/then: ${card.heading}] ${card.branches.map((b) => `If ${b.condition}, try: ${b.action}.`).join(' ')}`;
    case 'stat':
      return `[Worth knowing: ${card.heading}] ${card.statText} — ${card.detail}`;
    case 'quiz':
      return `[Quick check] ${card.question} Correct answer: "${card.options[card.correctIndex]}". Why: ${card.explanation}`;
    case 'reflection':
      return `[Reflection prompt] ${card.prompt}`;
    case 'exercise':
      return `[Try this] ${card.title}: ${card.instructions}`;
    case 'scenario':
      return `[Scenario: ${card.heading}] ${card.situation} Options and what tends to happen with each: ${card.options
        .map((o) => `"${o.text}" — ${o.feedback}`)
        .join(' | ')}`;
    case 'sequence':
      return `[Correct order: ${card.heading}] ${card.instructions ?? ''} ${card.items.map((s, i) => `${i + 1}. ${s}`).join(' ')}`;
    default: {
      const _exhaustive: never = card;
      return _exhaustive;
    }
  }
}

// Flattens an entire lesson into plain text for the in-lesson AI chat to
// use as its primary reference material — this always reads whatever the
// live `Lesson` object contains, so swapping in new lesson content later
// (see the content-authoring contract in types.ts) needs no changes here
// or in the AI prompt that consumes it.
export function serializeLessonForAi(lesson: Lesson, currentCardIndex: number): string {
  const lines = [`Lesson: "${lesson.title}" — ${lesson.summary}`, ''];
  lesson.cards.forEach((card, i) => {
    const marker = i === currentCardIndex ? ' <- the caregiver is currently looking at this card' : '';
    lines.push(`Card ${i + 1} of ${lesson.cards.length}${marker}: ${cardToReferenceText(card)}`);
  });
  return lines.join('\n');
}

// A plain `Omit<LessonCard, 'id'>` collapses the union to its shared keys
// only (keyof over a union is an intersection of keys), which would erase
// per-kind fields like `heading` or `question`. A conditional type only
// distributes over a naked *type parameter*, not a direct reference to the
// union — hence the indirection through `DistributiveOmit<T, K>` here.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type CardWithoutId = DistributiveOmit<LessonCard, 'id'>;

/** Lets lesson data omit per-card `id`s — they're derived from the lesson id + position instead. */
export function buildLesson(base: Omit<Lesson, 'cards'> & { cards: CardWithoutId[] }): Lesson {
  return {
    ...base,
    cards: base.cards.map((c, i) => ({ ...c, id: `${base.id}-${i}` })) as LessonCard[],
  };
}
