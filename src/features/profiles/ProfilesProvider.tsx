import React, { createContext, useContext } from 'react';
import { useProfilesState } from './useProfilesState';
import { useAuthContext } from '../auth/AuthProvider';

type ProfilesContextValue = ReturnType<typeof useProfilesState>;

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

// Lifted above DenProvider/HelpBotProvider so switching the current child
// can drive both of those to reload their child-scoped storage. Reads the
// signed-in account from AuthProvider (which sits above this one — see
// app/_layout.tsx) so profiles are scoped to, and reload whenever, whoever
// is actually logged in: this is the actual account/data-separation
// boundary, not just a convenience.
export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  const value = useProfilesState(auth.currentUser?.id ?? null);
  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfilesContext() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error('useProfilesContext must be used within ProfilesProvider');
  return ctx;
}
