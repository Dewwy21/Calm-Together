import { useCallback, useEffect, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { ageRangeLabel, adhdStatusLabel } from '../profiles/profileOptions';
import { loadBlueprint, persistBlueprint } from './blueprintStorage';
import { createEmptyBlueprint, applyBlueprintPatch, applySafetyEvent, serializeBlueprintSections } from './blueprintHelpers';
import { updateBlueprintFromInteraction } from '../ai/updateBlueprintFromInteraction';
import { FamilyBlueprint, BlueprintSourceType } from './types';
import { SafetyCategory } from '../aiEngine/types';

// The Family Blueprint is the app's central, continuously-updated memory of
// one family. It intentionally does NOT depend on useFamilyContextInput (or
// anything else that itself reads the Blueprint) — that hook is enriched
// WITH Blueprint data elsewhere, and a dependency the other way would be
// circular. All this hook needs from Profiles is the current child's basic
// facts, read directly.
export function useBlueprintState() {
  const { currentChildId, currentChild } = useProfilesContext();
  const [blueprint, setBlueprint] = useState<FamilyBlueprint | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentChildId) {
      setBlueprint(null);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    loadBlueprint(currentChildId).then((stored) => {
      setBlueprint(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  const noteInteraction = useCallback(
    async (sourceType: BlueprintSourceType, summary: string) => {
      if (!currentChildId || !blueprint) return;
      const childId = currentChildId;
      const description = currentChild
        ? `Child: ${currentChild.name}, age range ${ageRangeLabel(currentChild.ageRange)}, ADHD status: ${adhdStatusLabel(currentChild.adhdStatus)}.`
        : 'No child profile details available.';

      try {
        const patch = await updateBlueprintFromInteraction({
          currentBlueprintSummary: serializeBlueprintSections(blueprint, 6),
          interactionSummary: summary,
          sourceType,
          childDescription: description,
          isFirstEver: false,
        });
        setBlueprint((prev) => {
          if (!prev) return prev;
          const next = applyBlueprintPatch(prev, patch, sourceType);
          persistBlueprint(childId, next);
          return next;
        });
      } catch {
        // Best-effort background enrichment — a failure here should never surface to the caregiver.
      }
    },
    [currentChildId, currentChild, blueprint]
  );

  // Deterministic, no AI call — a safety flag is recorded immediately and
  // never waits on (or depends on) a model response. Still contributes to
  // the same Blueprint, just visibly marked as a safety event rather than
  // a routine insight.
  const noteSafetyEvent = useCallback(
    (sourceType: BlueprintSourceType, category: Exclude<SafetyCategory, 'none'>) => {
      if (!currentChildId || !blueprint) return;
      const childId = currentChildId;
      setBlueprint((prev) => {
        if (!prev) return prev;
        const next = applySafetyEvent(prev, sourceType, category);
        persistBlueprint(childId, next);
        return next;
      });
    },
    [currentChildId, blueprint]
  );

  // Called once, right after onboarding creates the first child profile.
  // Takes the child's description as a plain string from the caller rather
  // than reading `currentChild` here, since Profiles state from the
  // just-created profile hasn't necessarily re-rendered into this hook yet
  // at the moment onboarding calls this (same tick, batched update).
  const initializeFromOnboarding = useCallback(async (childId: string, childDescription: string, onboardingSummary: string) => {
    try {
      const empty = createEmptyBlueprint(childId);
      const patch = await updateBlueprintFromInteraction({
        currentBlueprintSummary: serializeBlueprintSections(empty),
        interactionSummary: onboardingSummary,
        sourceType: 'onboarding',
        childDescription,
        isFirstEver: true,
      });
      const initial = applyBlueprintPatch(empty, patch, 'onboarding');
      await persistBlueprint(childId, initial);
      setBlueprint((prev) => (prev === null ? initial : prev));
    } catch {
      // Best-effort — if generation fails here, the Blueprint just stays empty until the next interaction succeeds.
    }
  }, []);

  return { blueprint, loaded, noteInteraction, noteSafetyEvent, initializeFromOnboarding };
}
