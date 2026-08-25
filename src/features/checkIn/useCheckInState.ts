import { useEffect, useMemo, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';
import { startOfWeek } from '../den/weekUtils';
import { createId } from '../logEvent/eventStorage';
import { loadCheckIns, persistCheckIns } from './checkInStorage';
import { WeeklyCheckIn, WeeklyCheckInInput } from './types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useCheckInState() {
  const { currentChildId } = useProfilesContext();
  const { noteInteraction } = useBlueprintContext();
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadCheckIns(currentChildId).then((stored) => {
      setCheckIns(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  useEffect(() => {
    if (loaded && currentChildId) {
      persistCheckIns(currentChildId, checkIns);
    }
  }, [checkIns, loaded, currentChildId]);

  const mostRecent = useMemo(
    () => [...checkIns].sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))[0],
    [checkIns]
  );

  // Due once a full week has passed since the last one — or immediately if
  // there's never been one.
  const isDue = !mostRecent || Date.now() - new Date(mostRecent.createdAtISO).getTime() >= WEEK_MS;

  async function submitCheckIn(input: WeeklyCheckInInput) {
    if (!currentChildId) return;
    const entry: WeeklyCheckIn = {
      id: createId(),
      weekStartISO: startOfWeek(new Date()).toISOString(),
      createdAtISO: new Date().toISOString(),
      ...input,
    };
    setCheckIns((prev) => [...prev, entry]);
    noteInteraction(
      'checkIn',
      `Weekly check-in — caregiver mood ${input.caregiverMoodRating}/10, child mood ${input.childMoodRating}/10.\nBiggest win: ${input.biggestWin}\nBiggest challenge: ${input.biggestChallenge}`
    );
  }

  return { checkIns, mostRecent, isDue, submitCheckIn };
}
