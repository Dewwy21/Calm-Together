import { EventType } from './types';

export interface SubtypeOption {
  value: string;
  label: string;
  description: string;
}

// Optional deeper categorization within each top-level event type. None of
// these are required to save a log — they exist for caregivers who want to
// track patterns more precisely over time.
export const SUBTYPE_OPTIONS: Record<EventType, SubtypeOption[]> = {
  meltdown: [
    { value: 'reactive', label: 'Reactive', description: 'A sudden reaction to an immediate frustration' },
    { value: 'sensory', label: 'Sensory Overload', description: 'Triggered by noise, light, or too much input' },
    { value: 'transition', label: 'Transition Difficulty', description: 'Came up while switching activities' },
    { value: 'attention-seeking', label: 'Attention-Seeking', description: 'Seemed aimed at getting a reaction' },
    { value: 'fatigue-hunger', label: 'Fatigue or Hunger', description: 'Tired, hungry, or otherwise depleted' },
  ],
  parentReaction: [
    { value: 'reactive', label: 'Reactive', description: 'Responded impulsively in the moment' },
    { value: 'proactive', label: 'Proactive', description: 'Managed it calmly before it escalated' },
    { value: 'suppressed', label: 'Suppressed', description: 'Held the feeling in without expressing it' },
    { value: 'overwhelmed', label: 'Overwhelmed', description: 'Felt like too much all at once' },
  ],
  positiveMoment: [
    { value: 'breakthrough', label: 'Breakthrough', description: 'Something new or a real milestone' },
    { value: 'cooperation', label: 'Cooperation', description: 'Listened well or followed through' },
    { value: 'connection', label: 'Connection', description: 'A warm, bonding moment together' },
    { value: 'self-regulation', label: 'Self-Regulation', description: 'Calmed themselves down independently' },
  ],
};

export function getSubtypeLabel(eventType: EventType, value: string | undefined): string | null {
  if (!value) return null;
  return SUBTYPE_OPTIONS[eventType].find((o) => o.value === value)?.label ?? null;
}
