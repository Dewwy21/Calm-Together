import { SafetyCategory } from './types';

// Thrown by single-shot engine features (Parent Replay, Personalized
// Lessons, AI Reflections) when the *source content* they were asked to
// work from — not a live chat message, but a logged event, a check-in, etc.
// — trips the safety triage. Callers catch this specifically and show the
// safety response instead of generating normal coaching content from it.
export class SafetyTriggeredError extends Error {
  category: Exclude<SafetyCategory, 'none'>;
  constructor(category: Exclude<SafetyCategory, 'none'>) {
    super(`Safety triage triggered: ${category}`);
    this.category = category;
    this.name = 'SafetyTriggeredError';
  }
}
