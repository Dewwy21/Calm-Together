import { useEffect, useState } from 'react';
import { useDenContext } from '../den/DenProvider';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { loadCompletedLessonIds } from '../connect/parentLearningStorage';
import { getParentLessonById } from '../connect/parentLearningData';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';
import { serializeBlueprintSections } from '../blueprint/blueprintHelpers';
import { FamilyContextInput } from './familyContext';

// Shared by every AI feature (Help Bot, Parent Replay, the Simulator's
// coaching summary, personalized lessons, pattern insights, growth
// encouragement) so the "what do we know about this family" gathering
// logic — including the Family Blueprint — lives in exactly one place.
// Enriching this hook is what makes the Blueprint available everywhere at
// once, without editing every individual AI call site.
export function useFamilyContextInput(): FamilyContextInput {
  const den = useDenContext();
  const { currentChild, currentChildId } = useProfilesContext();
  const { blueprint } = useBlueprintContext();
  const [completedLessonTitles, setCompletedLessonTitles] = useState<string[]>([]);

  useEffect(() => {
    if (!currentChildId) return;
    loadCompletedLessonIds(currentChildId).then((ids) => {
      const titles = ids.map((id) => getParentLessonById(id)?.title).filter((t): t is string => !!t);
      setCompletedLessonTitles(titles);
    });
  }, [currentChildId]);

  return {
    child: currentChild,
    recentEvents: den.events,
    streak: den.streak,
    totalLogs: den.totalLogs,
    completedLessonTitles,
    blueprintSummary: blueprint ? serializeBlueprintSections(blueprint, 4) : undefined,
  };
}
