export const PROFESSIONAL_DISCLAIMER_TEXT =
  'Otter Companion is an AI parenting coach and educational tool — not a licensed mental health professional or a replacement for therapy.';

// Shown "naturally... without becoming repetitive": even when the AI flags
// a response as advice-bearing, skip it if one was already shown recently
// in this same conversation. `recentFlags` is the disclaimer flag from the
// last few turns, oldest first or newest first — order doesn't matter,
// only whether any of them are true.
export function shouldShowDisclaimer(aiWantsDisclaimer: boolean, recentFlags: boolean[], cooldown = 4): boolean {
  if (!aiWantsDisclaimer) return false;
  const recentlyShown = recentFlags.slice(-cooldown).some(Boolean);
  return !recentlyShown;
}
