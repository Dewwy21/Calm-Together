import { useEffect, useMemo, useState } from 'react';
import { loadCalmCornerData, persistCalmCornerData, CalmCornerData, RecentUse } from './calmCornerStorage';
import { EXERCISES, getExerciseById } from './exerciseData';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';

const MAX_USAGE_LOG = 365;

export function useCalmCornerState() {
  const { noteInteraction } = useBlueprintContext();
  const [data, setData] = useState<CalmCornerData>({ favoriteIds: [], recentlyUsed: [], usageLog: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCalmCornerData().then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      persistCalmCornerData(data);
    }
  }, [data, loaded]);

  function isFavorite(exerciseId: string) {
    return data.favoriteIds.includes(exerciseId);
  }

  function toggleFavorite(exerciseId: string) {
    setData((prev) => ({
      ...prev,
      favoriteIds: prev.favoriteIds.includes(exerciseId)
        ? prev.favoriteIds.filter((id) => id !== exerciseId)
        : [...prev.favoriteIds, exerciseId],
    }));
  }

  function markUsed(exerciseId: string) {
    setData((prev) => {
      const withoutCurrent = prev.recentlyUsed.filter((r) => r.exerciseId !== exerciseId);
      const entry: RecentUse = { exerciseId, lastUsedISO: new Date().toISOString() };
      return {
        ...prev,
        recentlyUsed: [entry, ...withoutCurrent].slice(0, 5),
        usageLog: [entry, ...prev.usageLog].slice(0, MAX_USAGE_LOG),
      };
    });
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
