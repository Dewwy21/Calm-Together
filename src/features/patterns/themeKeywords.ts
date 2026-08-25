import { ThemeId } from './types';

export const THEME_LABELS: Record<ThemeId, string> = {
  transitions: 'Transitions',
  bedtime: 'Bedtime',
  homework: 'Homework',
  siblingConflict: 'Sibling Conflict',
  screenTime: 'Screens & Video Games',
  mornings: 'Mornings',
  emotionalOutbursts: 'Emotional Outbursts',
  caregiverBurnout: 'Caregiver Burnout',
};

// Keyword hits against the free-text fields of a Daily Log entry. Simple
// and inspectable on purpose — the exact match counts feed directly into
// factual sentences ("6 of your last 12 logs"), so this needs to be
// something a caregiver could verify by rereading their own logs, not an
// AI guess that could invent a number.
export const THEME_KEYWORDS: Record<ThemeId, string[]> = {
  transitions: ['transition', 'switch', 'stop playing', 'time to leave', 'change activit', 'move on to', 'wrap up', 'wrapping up'],
  bedtime: ['bedtime', 'bed time', 'go to bed', 'pajama', 'tuck in', 'wind down', 'winding down', 'lights out'],
  homework: ['homework', 'school work', 'schoolwork', 'assignment', 'studying', 'worksheet'],
  siblingConflict: ['sibling', 'brother', 'sister', 'shared toy', 'fought over', 'fighting with', 'took his', 'took her'],
  screenTime: ['screen', 'video game', 'videogame', 'ipad', 'tablet', ' tv', 'game time', 'xbox', 'playstation', 'phone', 'controller'],
  mornings: ['morning', 'get ready', 'get dressed', 'getting dressed', 'school run', 'rushing out the door'],
  emotionalOutbursts: ['meltdown', 'yell', 'scream', 'cried', 'crying', 'tantrum', 'outburst', 'blew up'],
  caregiverBurnout: ['exhausted', 'burnt out', 'burnout', 'overwhelmed', 'no energy left', 'touched out', 'running on empty'],
};

export function matchThemes(text: string): ThemeId[] {
  const lower = ` ${text.toLowerCase()} `;
  return (Object.keys(THEME_KEYWORDS) as ThemeId[]).filter((theme) => THEME_KEYWORDS[theme].some((kw) => lower.includes(kw)));
}
