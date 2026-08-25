import { LoggedEvent } from '../logEvent/types';

// Looks across the caregiver's stored history (the "larger database" is
// simply the same AsyncStorage-backed events list everything else reads)
// for a simple repeat pattern to surface back to them. Deliberately
// lightweight — exact-match location/time-of-day bucket comparisons — this
// is a mock heuristic, not real pattern mining.

function timeBucket(date: Date): string {
  const hour = date.getHours();
  if (hour < 5 || hour >= 21) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function ordinal(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

export function findRepeatedPattern(allEvents: LoggedEvent[], current: LoggedEvent): string | null {
  const sameType = allEvents.filter((e) => e.eventType === current.eventType);

  const loc = current.location.trim().toLowerCase();
  if (loc) {
    const count = sameType.filter((e) => e.location.trim().toLowerCase() === loc).length;
    if (count >= 2) {
      return `This is the ${ordinal(count)} time you've logged something like this with a similar location noted. Patterns like this can be worth mentioning if you ever talk with a specialist.`;
    }
  }

  const bucket = timeBucket(new Date(current.occurredAtISO));
  const bucketCount = sameType.filter((e) => timeBucket(new Date(e.occurredAtISO)) === bucket).length;
  if (bucketCount >= 3) {
    return `I've also noticed a few of these tend to happen in the ${bucket}. That timing itself might be worth paying attention to.`;
  }

  return null;
}
