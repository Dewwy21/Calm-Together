// Mon-first day index (0=Mon..6=Sun) to match WeekStrip's label order.
export function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(reference: Date): Date {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - mondayFirstIndex(start));
  return start;
}

export function isInWeekOf(date: Date, reference: Date): boolean {
  const start = startOfWeek(reference);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

// Consecutive-day streak, Duolingo-style: if today has no log yet, still
// count back from yesterday so the streak doesn't zero out before the
// caregiver has had a chance to log today.
export function computeStreak(occurredDates: Date[]): number {
  if (occurredDates.length === 0) return 0;
  const daysWithLogs = new Set(occurredDates.map((d) => d.toDateString()));

  const cursor = new Date();
  if (!daysWithLogs.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (daysWithLogs.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
