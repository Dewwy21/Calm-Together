import AsyncStorage from '@react-native-async-storage/async-storage';
import { createId } from '../logEvent/eventStorage';
import { getAiProvider } from '../ai/aiProvider';
import { CLAUDE_MODEL } from '../ai/anthropicClient';
import { OPENROUTER_MODEL } from '../ai/openRouterClient';
import { ResearchLogInput, ResearchLogRecord } from './types';

// The centralized research-observation layer: every AI feature that wants
// to be logged calls logInteraction() once it already has a finished
// response (see useHelpBotState.ts for the first real caller). This file
// is the ONLY place that knows about the Google Apps Script endpoint —
// nothing else in the app builds its own request to it.
//
// Deliberately fire-and-forget (logInteraction returns immediately,
// doesn't return a Promise) so a slow network or a failed request can
// never delay or block the caregiver's own AI response, which callers
// already have and can show before this function is even called — see
// requirement #12 in the research-logging spec this file implements.

const QUEUE_KEY = 'otter-companion/research-log-retry-queue';
const ENDPOINT = process.env.EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT;

/** Whichever provider askClaudeStructured() is actually dispatching to right now — never hardcoded, so this always reflects the real model in use. */
export function activeModelName(): string {
  return getAiProvider() === 'anthropic' ? CLAUDE_MODEL : OPENROUTER_MODEL;
}

// Researcher-only visibility into the most recent send — see
// getLastLogStatus() below and requirement #15 (a subtle "Logged ✓" /
// "Logging failed" indicator, only ever shown in researcher/test mode).
let lastLogStatus: { interactionId: string; ok: boolean } | null = null;
export function getLastLogStatus(): { interactionId: string; ok: boolean } | null {
  return lastLogStatus;
}

async function loadQueue(): Promise<ResearchLogRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as ResearchLogRecord[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: ResearchLogRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // best-effort only — losing the retry queue just means a failed log
    // isn't retried later, never a crash.
  }
}

async function sendRecord(record: ResearchLogRecord): Promise<boolean> {
  if (!ENDPOINT) {
    // eslint-disable-next-line no-console
    console.warn(
      '[researchLogger] EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT is not set in .env — research logging is a no-op. Interaction not sent:',
      record.interactionId
    );
    return false;
  }
  try {
    // Content-Type is deliberately "text/plain", not "application/json" —
    // on web, a JSON content-type makes the browser send a CORS preflight
    // (OPTIONS) request first, which Google Apps Script web apps don't
    // handle, so the browser blocks the real POST before it ever reaches
    // the server (confirmed: this exact call worked from curl/Node, which
    // don't do CORS preflights at all, and failed with a bare "Failed to
    // fetch" from a real browser). "text/plain" is CORS-safelisted, so no
    // preflight happens — Apps Script's doPost still receives and parses
    // the same JSON body either way, since it just reads the raw string
    // from e.postData.contents regardless of the declared content type.
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn('[researchLogger] non-OK response logging interaction', record.interactionId, response.status);
      return false;
    }
    // eslint-disable-next-line no-console
    console.log('[researchLogger] logged interaction', record.interactionId, record.interactionType);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[researchLogger] failed to send research log, will retry later:', record.interactionId, err);
    return false;
  }
}

async function deliver(record: ResearchLogRecord): Promise<void> {
  const ok = await sendRecord(record);
  lastLogStatus = { interactionId: record.interactionId, ok };
  if (ok) return;

  const queue = await loadQueue();
  // interactionId is generated once per real interaction (createId(), see
  // logInteraction below) — never enqueue the same one twice, so a
  // component rerender or a duplicate callback can't pile up duplicate
  // rows once a retry eventually succeeds.
  if (!queue.some((r) => r.interactionId === record.interactionId)) {
    queue.push(record);
    await saveQueue(queue);
  }
}

/**
 * The single entry point every AI feature calls once it already has a
 * finished response. Not awaited by callers — returns immediately, delivers
 * in the background, and silently queues for retry on failure. Never
 * throws, so a caller can call this and move on without a try/catch.
 */
export function logInteraction(input: ResearchLogInput): void {
  const record: ResearchLogRecord = {
    ...input,
    interactionId: createId(),
    timestamp: new Date().toISOString(),
  };
  deliver(record).catch(() => {
    // deliver() already handles/logs every failure path internally: this
    // catch only exists so a genuinely unexpected error (e.g. AsyncStorage
    // itself throwing) can never surface as an unhandled promise rejection.
  });
}

/**
 * Attempts to resend anything left over from previous failed sends.
 * Call opportunistically (app start is enough for a research prototype)
 * rather than running a background timer. Successfully-sent records are
 * removed from the queue; still-failing ones stay queued for next time.
 */
export async function retryQueuedResearchLogs(): Promise<void> {
  const queue = await loadQueue();
  if (queue.length === 0) return;
  const stillFailing: ResearchLogRecord[] = [];
  for (const record of queue) {
    const ok = await sendRecord(record);
    if (!ok) stillFailing.push(record);
  }
  await saveQueue(stillFailing);
}
