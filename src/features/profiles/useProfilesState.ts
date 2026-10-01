import { useEffect, useMemo, useState } from 'react';
import { ChildProfile, ChildProfileInput } from './types';
import {
  loadProfiles,
  persistProfiles,
  loadCurrentChildId,
  persistCurrentChildId,
  migrateLegacyChildData,
} from './profileStorage';
import { loadOnboardingAnswers, loadOnboardingStatus } from '../onboarding/onboardingStorage';
import { childProfileFromOnboardingAnswers } from './childProfileFromOnboarding';
import { createId } from '../logEvent/eventStorage';

// accountId is the actual account/data-separation boundary: every load and
// persist below is scoped to it, and the load effect re-runs whenever it
// changes (login, logout, switching accounts) so a different account never
// sees a stale/previous account's children still sitting in state. `null`
// means "no one is signed in" — profiles are cleared and every storage
// call is skipped, since there's nothing to load or scope to yet.
export function useProfilesState(accountId: string | null) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!accountId) {
      setProfiles([]);
      setCurrentChildId(null);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    (async () => {
      const storedProfiles = await loadProfiles(accountId);

      if (storedProfiles.length === 0) {
        const onboardingStatus = await loadOnboardingStatus(accountId);
        if (onboardingStatus === 'not_started') {
          // Onboarding hasn't run yet — it creates the first profile itself
          // (from the answers it just collected) once the caregiver
          // finishes or skips. Nothing to bootstrap here.
          setProfiles([]);
          setCurrentChildId(null);
          setLoaded(true);
          return;
        }

        // Reaching here with no profiles but onboarding already decided
        // means either a pre-multi-child install (migrate its data) or an
        // interrupted flow — either way, build one from whatever onboarding
        // answers exist so the app has a child to scope data to.
        const answers = await loadOnboardingAnswers(accountId);
        const newProfile: ChildProfile = {
          ...childProfileFromOnboardingAnswers(answers),
          id: createId(),
          archived: false,
          createdAtISO: new Date().toISOString(),
        };
        await persistProfiles(accountId, [newProfile]);
        await persistCurrentChildId(accountId, newProfile.id);
        await migrateLegacyChildData(newProfile.id);
        setProfiles([newProfile]);
        setCurrentChildId(newProfile.id);
        setLoaded(true);
        return;
      }

      const storedCurrentId = await loadCurrentChildId(accountId);
      const activeIds = storedProfiles.filter((p) => !p.archived).map((p) => p.id);
      const resolvedCurrentId =
        storedCurrentId && activeIds.includes(storedCurrentId) ? storedCurrentId : activeIds[0] ?? storedProfiles[0].id;

      if (resolvedCurrentId !== storedCurrentId) {
        await persistCurrentChildId(accountId, resolvedCurrentId);
      }

      setProfiles(storedProfiles);
      setCurrentChildId(resolvedCurrentId);
      setLoaded(true);
    })();
  }, [accountId]);

  useEffect(() => {
    if (loaded && accountId) {
      persistProfiles(accountId, profiles);
    }
  }, [profiles, loaded, accountId]);

  const activeProfiles = useMemo(() => profiles.filter((p) => !p.archived), [profiles]);
  const archivedProfiles = useMemo(() => profiles.filter((p) => p.archived), [profiles]);
  const currentChild = useMemo(() => profiles.find((p) => p.id === currentChildId) ?? null, [profiles, currentChildId]);

  function addChild(input: ChildProfileInput): ChildProfile {
    const newProfile: ChildProfile = {
      ...input,
      id: createId(),
      archived: false,
      createdAtISO: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  }

  function updateChild(id: string, patch: Partial<ChildProfileInput>) {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function archiveChild(id: string) {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)));
    if (currentChildId === id) {
      const fallback = profiles.find((p) => p.id !== id && !p.archived);
      if (fallback) switchChild(fallback.id);
    }
  }

  function unarchiveChild(id: string) {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, archived: false } : p)));
  }

  function deleteChild(id: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (currentChildId === id) {
      const fallback = profiles.find((p) => p.id !== id && !p.archived);
      if (fallback) switchChild(fallback.id);
    }
  }

  function switchChild(id: string) {
    setCurrentChildId(id);
    if (accountId) persistCurrentChildId(accountId, id);
  }

  return {
    profiles,
    activeProfiles,
    archivedProfiles,
    currentChild,
    currentChildId,
    loaded,
    addChild,
    updateChild,
    archiveChild,
    unarchiveChild,
    deleteChild,
    switchChild,
  };
}
