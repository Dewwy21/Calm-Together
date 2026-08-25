import type { ComponentType } from 'react';
import { IconProps, StarIcon, ThoughtIcon, ChartIcon, PersonIcon } from '../../components/icons';
import { LessonCard } from '../courses/types';
import { PersonalizedLesson, StorableLessonCard, StoredPersonalizedLesson } from './types';

// Personalized lessons are generated content, not hand-picked art — every
// card of a given kind just gets one fixed, sensible icon rather than the
// AI choosing one (icons aren't meaningful for a model to pick, and this
// keeps generated data plain, serializable JSON).
const DEFAULT_ICON_BY_KIND: Partial<Record<LessonCard['kind'], ComponentType<IconProps>>> = {
  intro: StarIcon,
  concept: ThoughtIcon,
  stat: ChartIcon,
};

function hydrateCard(card: StorableLessonCard): LessonCard {
  if (card.kind === 'intro' || card.kind === 'concept' || card.kind === 'stat') {
    return { ...card, icon: DEFAULT_ICON_BY_KIND[card.kind]! } as LessonCard;
  }
  return card as LessonCard;
}

function dehydrateCard(card: LessonCard): StorableLessonCard {
  if (card.kind === 'intro' || card.kind === 'concept' || card.kind === 'stat') {
    const { icon, ...rest } = card;
    return rest as StorableLessonCard;
  }
  return card as StorableLessonCard;
}

export function hydrateLesson(stored: StoredPersonalizedLesson): PersonalizedLesson {
  return { ...stored, icon: PersonIcon, cards: stored.cards.map(hydrateCard) };
}

export function dehydrateLesson(lesson: PersonalizedLesson): StoredPersonalizedLesson {
  const { icon, ...rest } = lesson;
  return { ...rest, cards: lesson.cards.map(dehydrateCard) };
}
