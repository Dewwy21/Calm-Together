import { RechargeActivity } from './types';

// Proactive self-care for the caregiver, not crisis coping (that's Calm
// Corner). These are meant for restoring, not regulating in the moment.
export const RECHARGE_ACTIVITIES: RechargeActivity[] = [
  {
    id: 'five-minutes-quiet',
    title: 'Five Minutes of Quiet',
    description: 'Sit somewhere calm and do absolutely nothing for five minutes.',
    estimatedMinutes: 5,
    tip: "Set a timer so you don't have to watch the clock.",
  },
  {
    id: 'favorite-drink',
    title: 'Make Your Favorite Drink',
    description: 'Slowly make and actually enjoy a drink you like.',
    estimatedMinutes: 5,
    tip: 'Sit down while you drink it, even for two minutes.',
  },
  {
    id: 'step-outside',
    title: 'Step Outside',
    description: 'Get outside for a few minutes, even just to your doorstep.',
    estimatedMinutes: 5,
    tip: 'Notice the temperature and one sound you can hear.',
  },
  {
    id: 'text-someone',
    title: 'Text Someone Who Gets It',
    description: 'Send a quick message to someone who understands what today was like.',
    estimatedMinutes: 3,
    tip: 'You don\'t need to explain everything. "Rough day" is enough.',
  },
  {
    id: 'write-one-line',
    title: 'Write One Line',
    description: 'Write a single sentence about how today actually felt.',
    estimatedMinutes: 3,
    tip: "It doesn't need to be positive. Honest is more useful than tidy.",
  },
  {
    id: 'stretch-it-out',
    title: 'Stretch It Out',
    description: 'Do a slow two-minute stretch, wherever you are.',
    estimatedMinutes: 3,
    tip: 'Focus on your shoulders and jaw. That is where most people hold tension.',
  },
];

export function getRechargeActivityById(id: string) {
  return RECHARGE_ACTIVITIES.find((a) => a.id === id);
}
