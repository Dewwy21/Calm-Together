import { useEffect, useState } from 'react';
import { AuthUser, AuthActionResult } from './types';
import { loadUsers, persistUsers, loadSession, persistSession } from './authStorage';
import { createId } from '../logEvent/eventStorage';
import { hashPassword, verifyPassword } from './passwordHashing';
import { sendVerificationEmail } from './verificationEmailClient';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Research-prototype grade expiry/cooldown — see verificationEmailClient.ts
// for why this isn't production-grade auth.
const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function useAuthState() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadUsers(), loadSession()]).then(([storedUsers, storedSession]) => {
      setUsers(storedUsers);
      setCurrentUserId(storedSession);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) persistUsers(users);
  }, [users, loaded]);

  useEffect(() => {
    if (loaded) persistSession(currentUserId);
  }, [currentUserId, loaded]);

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  async function signUp(input: { name: string; email: string; password: string }): Promise<AuthActionResult> {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!name) return { ok: false, error: 'Enter your name.' };
    if (!email) return { ok: false, error: 'Enter an email.' };
    if (!password) return { ok: false, error: 'Enter a password.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
    if (users.some((u) => normalizeEmail(u.email) === email)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }

    const { salt, hash } = await hashPassword(password);
    const user: AuthUser = {
      id: createId(),
      name,
      email: input.email.trim(),
      passwordSalt: salt,
      passwordHash: hash,
      createdAtISO: new Date().toISOString(),
      emailVerified: false,
      verificationCode: null,
      verificationCodeCreatedAt: null,
    };
    setUsers((prev) => [...prev, user]);
    setCurrentUserId(user.id);
    return { ok: true };
  }

  async function logIn(input: { email: string; password: string }): Promise<AuthActionResult> {
    const email = normalizeEmail(input.email);
    const match = users.find((u) => normalizeEmail(u.email) === email);
    if (!match) return { ok: false, error: 'Incorrect email or password.' };
    const passwordMatches = await verifyPassword(input.password, { salt: match.passwordSalt, hash: match.passwordHash });
    if (!passwordMatches) return { ok: false, error: 'Incorrect email or password.' };
    setCurrentUserId(match.id);
    return { ok: true };
  }

  function logOut() {
    setCurrentUserId(null);
  }

  // "Always succeeds" from the caller's point of view — never reveals
  // whether an email is actually registered, matching real password-reset
  // UX conventions even though this is a mock with no real email delivery.
  async function resetPassword(input: { email: string; newPassword: string }): Promise<void> {
    const email = normalizeEmail(input.email);
    const match = users.find((u) => normalizeEmail(u.email) === email);
    if (!match) return;
    const { salt, hash } = await hashPassword(input.newPassword);
    setUsers((prev) => prev.map((u) => (u.id === match.id ? { ...u, passwordSalt: salt, passwordHash: hash } : u)));
  }

  // Generates a fresh 6-digit code, stores it on this specific account (so
  // it can never verify any other account), and sends it through the Apps
  // Script email client. Used for both the initial post-signup send and
  // "Resend Code" — a resend simply calls this again, which overwrites the
  // previous code and timestamp, so the old code stops working immediately.
  //
  // Deliberately writes via the setUsers functional updater instead of
  // looking the account up in the `users` closure first: this is called
  // right after signUp() in the same handler (see signup.tsx), before the
  // component has re-rendered with the just-created account, so `users`
  // here can still be stale. The functional updater always sees the latest
  // state when React applies it, in the same order updates were queued, so
  // this is race-free even then.
  async function sendVerificationCode(email: string): Promise<AuthActionResult> {
    const normalizedEmail = normalizeEmail(email);
    const code = generateVerificationCode();
    const createdAtISO = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) =>
        normalizeEmail(u.email) === normalizedEmail ? { ...u, verificationCode: code, verificationCodeCreatedAt: createdAtISO } : u
      )
    );

    const sent = await sendVerificationEmail(email, code);
    if (!sent) return { ok: false, error: "Couldn't send the verification email. Please try again." };
    return { ok: true };
  }

  // Checks the code against the specific account identified by userId only
  // (never "whichever account has this code"), so one account's code can
  // never verify a different account.
  function verifyEmailCode(userId: string, code: string): AuthActionResult {
    const match = users.find((u) => u.id === userId);
    if (!match) return { ok: false, error: 'Account not found.' };
    if (!match.verificationCode || !match.verificationCodeCreatedAt) {
      return { ok: false, error: 'No verification code on file. Request a new one.' };
    }
    const ageMs = Date.now() - new Date(match.verificationCodeCreatedAt).getTime();
    if (ageMs > VERIFICATION_CODE_EXPIRY_MS) {
      return { ok: false, error: 'This code has expired. Request a new one.' };
    }
    if (code.trim() !== match.verificationCode) {
      return { ok: false, error: 'Incorrect code. Please try again.' };
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, emailVerified: true, verificationCode: null, verificationCodeCreatedAt: null } : u))
    );
    return { ok: true };
  }

  return { currentUser, loaded, signUp, logIn, logOut, resetPassword, sendVerificationCode, verifyEmailCode };
}
