import { LessonCard } from './types';

/** Flattens any card kind into a single string for the "Listen" read-aloud toggle. */
export function cardToSpeechText(card: LessonCard): string {
  switch (card.kind) {
    case 'intro':
      return `${card.title}. ${card.hook}`;
    case 'concept':
      return `${card.heading}. ${card.body}`;
    case 'example':
      return `${card.heading}. ${card.scenario} ${card.takeaway}`;
    case 'comparison':
      return `${card.heading}. ${card.leftLabel}: ${card.leftItems.join('. ')}. ${card.rightLabel}: ${card.rightItems.join('. ')}.`;
    case 'timeline':
      return `${card.heading}. ${card.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('. ')}`;
    case 'decisionTree':
      return `${card.heading}. ${card.branches.map((b) => `If ${b.condition}, try: ${b.action}`).join('. ')}`;
    case 'stat':
      return `${card.heading}. ${card.statText}. ${card.detail}`;
    case 'quiz':
      return `${card.question} Options: ${card.options.join(', ')}.`;
    case 'reflection':
      return card.prompt;
    case 'exercise':
      return `${card.title}. ${card.instructions}`;
    case 'scenario':
      return `${card.heading}. ${card.situation} Options: ${card.options.map((o) => o.text).join(', ')}.`;
    case 'sequence':
      return `${card.heading}. ${card.instructions ?? ''} Put these in order: ${card.items.join(', ')}.`;
    case 'media':
      return card.sourceUrl
        ? `${card.title}.${card.caption ? ` ${card.caption}` : ''}`
        : `${card.title}. This ${card.mediaType} isn't available yet.`;
    default: {
      // If this ever fails to typecheck, a new LessonCardKind was added
      // without a case here — add one instead of widening this type.
      const _exhaustive: never = card;
      return _exhaustive;
    }
  }
}
