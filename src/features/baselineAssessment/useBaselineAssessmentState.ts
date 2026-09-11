import { useEffect, useMemo, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { useAuthContext } from '../auth/AuthProvider';
import { createId } from '../logEvent/eventStorage';
import { loadBaselineAssessments, persistBaselineAssessments } from './baselineAssessmentStorage';
import { AssessmentTimepoint, BaselineAssessmentRecord } from './types';
import { OnboardingAnswers } from '../onboarding/types';

export function useBaselineAssessmentState() {
  const { currentChildId } = useProfilesContext();
  const { currentUser } = useAuthContext();
  const [assessments, setAssessments] = useState<BaselineAssessmentRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Bumped by submitAssessment after every successful write, to force the
  // effect below to re-read storage. Needed because submitAssessment is
  // called via a reference captured at the *caller's* last render — on the
  // very first assessment ever completed, that's before the new child
  // profile (and its currentChildId) existed, so any comparison inside
  // submitAssessment against "the current currentChildId" would compare
  // against a permanently stale `null`, not a value that catches up later.
  // Routing the update back through this effect instead means the actual
  // reload always uses whatever currentChildId React has *at the time the
  // effect re-runs* — never a stale closure — so it's correct regardless of
  // whether currentChildId or the storage write lands first.
  const [reloadToken, setReloadToken] = useState(0);

  // Only reads here — writes happen exclusively inside submitAssessment's
  // own explicit read-modify-write. A separate "persist whenever
  // `assessments` changes" effect used to live here too, but it raced
  // against this same load: if this effect's async load resolved with the
  // pre-submission (empty) data *after* submitAssessment had already
  // written the new record, that reactive persist would fire again with
  // the stale empty array and silently clobber the just-saved record back
  // to nothing. Keeping storage writes to one single path removes the race.
  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadBaselineAssessments(currentChildId).then((stored) => {
      setAssessments(stored);
      setLoaded(true);
    });
  }, [currentChildId, reloadToken]);

  const sortedAssessments = useMemo(
    () => [...assessments].sort((a, b) => b.completedAtISO.localeCompare(a.completedAtISO)),
    [assessments]
  );

  // Takes an explicit childId rather than trusting `currentChildId` from
  // context — on the very first assessment ever completed, the child
  // profile is created and switched to in the same synchronous pass that
  // calls this function, before React has re-rendered with the new
  // currentChildId, so a context-read here would silently see a stale
  // `null` and drop the submission. Reads-modifies-writes storage directly
  // (rather than trusting in-memory `assessments`, which may not have
  // loaded for this child yet either) so this is correct regardless of
  // render timing. Appends only — never overwrites or removes a previous
  // record, so every attempt stays in Assessment History.
  async function submitAssessment(
    childId: string,
    answers: OnboardingAnswers,
    timepoint: AssessmentTimepoint = 'baseline'
  ): Promise<string> {
    const record: BaselineAssessmentRecord = {
      id: createId(),
      childId,
      timepoint,
      completedAtISO: new Date().toISOString(),
      answers,
      completedByName: currentUser?.name,
    };
    const existing = await loadBaselineAssessments(childId);
    const updated = [...existing, record];
    await persistBaselineAssessments(childId, updated);
    setReloadToken((t) => t + 1);
    return record.id;
  }

  return { assessments: sortedAssessments, loaded, submitAssessment };
}
