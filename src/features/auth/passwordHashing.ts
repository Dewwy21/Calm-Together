import * as Crypto from 'expo-crypto';

// Salted, iterated SHA-256 (a hand-rolled PBKDF2-style stretch) — this app
// has no backend and no native crypto module beyond what expo-crypto
// exposes (a plain digest, not a real KDF like bcrypt/argon2), so this is
// the strongest reasonable option available here. It replaces this app's
// previous plain-text password storage: a per-user random salt defeats
// rainbow tables, and 10,000 rounds makes brute-forcing meaningfully slower
// than a single hash would. Still not a substitute for a real server-side
// KDF if this app ever grows a backend.
const HASH_ITERATIONS = 10000;

async function sha256(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

async function stretch(password: string, salt: string): Promise<string> {
  let value = `${salt}:${password}`;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    value = await sha256(value);
  }
  return value;
}

export interface PasswordHash {
  salt: string;
  hash: string;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = Crypto.randomUUID();
  const hash = await stretch(password, salt);
  return { salt, hash };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const candidate = await stretch(password, stored.salt);
  return candidate === stored.hash;
}
