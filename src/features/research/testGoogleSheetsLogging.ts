import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Connectivity test only — NOT wired into the app. Nothing here is
// imported by any screen, provider, or the AI engine. This file's only
// purpose is to confirm the Google Apps Script endpoint actually accepts a
// POST and writes a row to Google Sheets — the real research logger lives
// in researchLogger.ts and reads the same env var this file does.
//
// Deliberately dependency-free (plain fetch, no Expo/RN imports) so this
// runs standalone from a terminal with zero setup:
//   node src/features/research/testGoogleSheetsLogging.ts
// (works as-is on Node 22.6+ / 24+, which run plain .ts files directly)

// EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT lives in .env, which Expo's own CLI
// loads automatically for the running app — but a bare `node` invocation
// like this one has no such tooling, so this does the minimal equivalent
// itself (no "dotenv" dependency needed for a handful of KEY=VALUE lines).
function loadDotEnvIfNeeded(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = resolve(process.cwd(), '.env');
    const contents = readFileSync(envPath, 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (k === key) return v;
    }
  } catch {
    // no .env file readable from cwd — fall through to undefined
  }
  return undefined;
}

const ENDPOINT = loadDotEnvIfNeeded('EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT');

const TEST_RECORD = {
  sessionId: 'TEST_SESSION_001',
  interactionType: 'TEST',
  environment: 'TEST',
  testCaseId: 'TEST_001',
  userInput: "I am feeling overwhelmed by my child's behavior today.",
  aiResponse: 'This is a test response.',
  actProcess: 'Acceptance',
  severity: 'High',
  model: 'test',
  notes: 'Google Sheets connection test',
};

export async function sendTestRecordToGoogleSheets(): Promise<void> {
  if (!ENDPOINT) {
    console.error(
      'EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT is not set. Add it to .env at the project root (see researchLogger.ts) and try again.'
    );
    return;
  }

  console.log('Sending test record to:', ENDPOINT);
  console.log('Payload:', JSON.stringify(TEST_RECORD, null, 2));

  try {
    // text/plain avoids a browser CORS preflight when this same logic runs
    // client-side (see researchLogger.ts) — kept consistent here too, even
    // though this standalone script runs in Node where CORS doesn't apply.
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(TEST_RECORD),
    });

    const bodyText = await response.text();
    console.log('\nHTTP status:', response.status, response.statusText);
    console.log('Response body:', bodyText);

    if (!response.ok) {
      console.error('\nRequest completed but the server returned a non-OK status — see the response body above for why.');
      return;
    }
    console.log('\nRequest succeeded. Check your Google Sheet for a new row with sessionId "TEST_SESSION_001".');
  } catch (err) {
    console.error('\nRequest failed before getting a response from the server:', err);
    console.error(
      "This usually means either the URL is wrong, the Apps Script isn't deployed with the right access " +
        '("Anyone" / "Anyone with the link", not just you), or there is no network access from wherever this ran.'
    );
  }
}

// Runs immediately when this file is executed directly (`node
// testGoogleSheetsLogging.ts`), but not when it's imported as a module from
// elsewhere. (ESM-style entry-point check — a file with `export` is loaded
// as an ES module, so `require.main` isn't available the way it would be
// in CommonJS. Uses pathToFileURL rather than a plain `file://${...}`
// string so this still matches when run with a relative path.)
const isRunDirectly = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isRunDirectly) {
  sendTestRecordToGoogleSheets();
}
