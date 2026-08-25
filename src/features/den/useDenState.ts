import { useEffect, useMemo, useState } from 'react';
import { LoggedEvent } from '../logEvent/types';
import { loadEvents, persistEvents } from '../logEvent/eventStorage';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { mondayFirstIndex, isInWeekOf, computeStreak } from './weekUtils';

// AsyncStorage-backed (see eventStorage.ts), scoped to whichever child is
// currently selected in ProfilesProvider — switching children reloads
// events, which everything below (streaks, progress, recent events) is
// derived from, so it all follows automatically.

export interface Caregiver {
  id: string;
  initials: string;
  color: string;
}

const MOCK_CAREGIVERS: Caregiver[] = [
  { id: 'you', initials: 'You', color: '#C96F4A' },
  { id: 'co-parent', initials: 'JM', color: '#7C9473' },
];

export function useDenState() {
  const { currentChildId } = useProfilesContext();
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadEvents(currentChildId).then((stored) => {
      setEvents(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  useEffect(() => {
    if (loaded && currentChildId) {
      persistEvents(currentChildId, events);
    }
  }, [events, loaded, currentChildId]);

  const now = new Date();
  const today = mondayFirstIndex(now);

  const thisWeekEvents = useMemo(
    () => events.filter((e) => isInWeekOf(new Date(e.occurredAtISO), now)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
  );

  const checkedDays = useMemo(() => {
    const days = new Set(thisWeekEvents.map((e) => mondayFirstIndex(new Date(e.occurredAtISO))));
    return Array.from(days);
  }, [thisWeekEvents]);

  const loggedToday = checkedDays.includes(today);

  const totalLogs = events.length;

  const positiveMomentsCount = useMemo(
    () => events.filter((e) => e.eventType === 'positiveMoment').length,
    [events]
  );

  // Any logged event (challenge or positive moment) maintains the streak,
  // so caregivers aren't nudged to look for problems just to keep it alive.
  const streak = useMemo(
    () => computeStreak(events.map((e) => new Date(e.occurredAtISO))),
    [events]
  );

  const recentEvents = useMemo(
    () => [...events].sort((a, b) => b.occurredAtISO.localeCompare(a.occurredAtISO)).slice(0, 3),
    [events]
  );

  function addEvent(event: LoggedEvent) {
    setEvents((prev) => [...prev, event]);
  }

  function updateEvent(id: string, patch: LoggedEvent) {
    setEvents((prev) => prev.map((e) => (e.id === id ? patch : e)));
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return {
    events,
    recentEvents,
    checkedDays,
    todayIndex: today,
    loggedToday,
    totalLogs,
    positiveMomentsCount,
    streak,
    caregivers: MOCK_CAREGIVERS,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
