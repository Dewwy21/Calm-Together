export interface AuthUser {
  id: string;
  name: string;
  email: string;
  // Never the raw password — see passwordHashing.ts. Salted + iterated
  // SHA-256, the strongest option available without a backend or a native
  // KDF library.
  passwordSalt: string;
  passwordHash: string;
  createdAtISO: string;
  // Email verification (research-prototype grade — see verificationEmailClient.ts
  // for the security tradeoffs). verificationCode/verificationCodeCreatedAt are
  // cleared back to null once verified, since they serve no purpose afterward.
  emailVerified: boolean;
  verificationCode: string | null;
  verificationCodeCreatedAt: string | null;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}
