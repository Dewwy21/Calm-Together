export interface AuthUser {
  id: string;
  name: string;
  email: string;
  // Plain-text storage is intentional here, not an oversight — this app is
  // an explicitly local-only research prototype with no real backend and
  // no real security requirement (per the caregiver's own instructions).
  // Never copy this pattern into a product that handles real credentials.
  password: string;
  createdAtISO: string;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}
