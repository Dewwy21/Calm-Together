import { useEffect, useState } from 'react';
import { AuthUser, AuthActionResult } from './types';
import { loadUsers, persistUsers, loadSession, persistSession } from './authStorage';
import { createId } from '../logEvent/eventStorage';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

  function signUp(input: { name: string; email: string; password: string }): AuthActionResult {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!name) return { ok: false, error: 'Enter your name.' };
    if (!email) return { ok: false, error: 'Enter an email.' };
    if (!password) return { ok: false, error: 'Enter a password.' };
    if (users.some((u) => normalizeEmail(u.email) === email)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }

    const user: AuthUser = { id: createId(), name, email: input.email.trim(), password, createdAtISO: new Date().toISOString() };
    setUsers((prev) => [...prev, user]);
    setCurrentUserId(user.id);
    return { ok: true };
  }

  function logIn(input: { email: string; password: string }): AuthActionResult {
    const email = normalizeEmail(input.email);
    const match = users.find((u) => normalizeEmail(u.email) === email && u.password === input.password);
    if (!match) return { ok: false, error: 'Incorrect email or password.' };
    setCurrentUserId(match.id);
    return { ok: true };
  }

  function logOut() {
    setCurrentUserId(null);
  }

  // "Always succeeds" from the caller's point of view — never reveals
  // whether an email is actually registered, matching real password-reset
  // UX conventions even though this is a mock with no real email delivery.
  function resetPassword(input: { email: string; newPassword: string }): void {
    const email = normalizeEmail(input.email);
    setUsers((prev) => prev.map((u) => (normalizeEmail(u.email) === email ? { ...u, password: input.newPassword } : u)));
  }

  return { currentUser, loaded, signUp, logIn, logOut, resetPassword };
}
