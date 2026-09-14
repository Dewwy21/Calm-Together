import { useEffect, useMemo, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { loadCalmCornerData, persistCalmCornerData, CalmCornerData, RecentUse } from './calmCornerStorage';
import { EXERCISES, getExerciseById } from './exerciseData';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';

const MAX_USAGE_LOG = 365;
const EMPTY: CalmCornerData = { favoriteIds: [], recentlyUsed: [], usageLog: [] };

export function useCalmCornerState() {
  const { currentChildId } = useProfilesContext();
  const { noteInteraction } = useBlueprintContext();
  const [data, setData] = useState<CalmCornerData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  // Read-only — writes happen explicitly inside each mutator below, scoped
  // to whichever child is current at call time (see courseProgress's
  // useCourseProgress.ts for why this replaced a reactive persist effect).
  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadCalmCornerData(currentChildId).then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  function isFavorite(exerciseId: string) {
    return data.favoriteIds.includes(exerciseId);
  }

  function toggleFavorite(exerciseId: string) {
    if (!currentChildId) return;
    const next: CalmCornerData = {
      ...data,
      favoriteIds: data.favoriteIds.includes(exerciseId)
        ? data.favoriteIds.filter((id) => id !== exerciseId)
        : [...data.favoriteIds, exerciseId],
    };
    setData(next);
    persistCalmCornerData(currentChildId, next);
  }

  function markUsed(exerciseId: string) {
    if (!currentChildId) return;
    const withoutCurrent = data.recentlyUsed.filter((r) => r.exerciseId !== exerciseId);
    const entry: RecentUse = { exerciseId, lastUsedISO: new Date().toISOString() };
    const next: CalmCornerData = {
      ...data,
      recentlyUsed: [entry, ...withoutCurrent].slice(0, 5),
      usageLog: [entry, ...data.usageLog].slice(0, MAX_USAGE_LOG),
    };
    setData(next);
    persistCalmCornerData(currentChildId, next);
    const exercise = getExerciseById(exerciseId);
    if (exercise) noteInteraction('calmCorner', `Used the "${exercise.title}" Calm Corner exercise.`);
  }

  const recentlyUsedExercises = useMemo(
    () =>
      data.recentlyUsed
        .map((r) => EXERCISES.find((e) => e.id === r.exerciseId))
        .filter((e): e is (typeof EXERCISES)[number] => Boolean(e)),
    [data.recentlyUsed]
  );

  const favoriteExercises = useMemo(
    () => EXERCISES.filter((e) => data.favoriteIds.includes(e.id)),
    [data.favoriteIds]
  );

  return {
    isFavorite,
    toggleFavorite,
    markUsed,
    recentlyUsedExercises,
    favoriteExercises,
    usageLog: data.usageLog,
  };
}
