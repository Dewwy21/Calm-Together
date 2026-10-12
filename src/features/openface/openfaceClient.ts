// Typed client for the local OpenFace 3.0 FastAPI service (openface-service/
// server.py) — the one place in the app that knows that service's URL and
// response shape. Mirrors this app's existing AI-client pattern
// (anthropicClient.ts: typed function, never throws across the public
// API, {ok, error}-shaped results) rather than inventing a new convention.
//
// Deliberately NOT fire-and-forget like researchLogger.ts — unlike research
// logging (which must never block or surface failure to the caregiver),
// this client's whole purpose in Stage 4 is a researcher directly watching
// connection/inference status, so callers need the real result immediately.

import { EXPRESSION_KEYS, ExpressionKey, OpenFaceHealth, OpenFacePrediction } from './openfaceTypes';

const SERVICE_URL = process.env.EXPO_PUBLIC_OPENFACE_SERVICE_URL;
const HEALTH_TIMEOUT_MS = 5000;
const PREDICT_TIMEOUT_MS = 15000; // generous — first post-warm-up call can be ~1.2s, this leaves real headroom for a cold start too

export type OpenFaceResult<T> = { ok: true; data: T } | { ok: false; error: string };

function isFiniteProbability(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Validates the service's own stated invariants (not re-deriving the model's math) — catches a malformed/truncated response rather than trusting the network blindly. */
function validatePrediction(data: unknown): OpenFaceResult<OpenFacePrediction> {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: 'Malformed response: not an object.' };
  }
  const d = data as Record<string, unknown>;

  if (typeof d.success !== 'boolean' || typeof d.faceDetected !== 'boolean' || typeof d.totalProcessingLatencyMs !== 'number') {
    return { ok: false, error: 'Malformed response: missing required fields.' };
  }

  if (!d.faceDetected) {
    // A missing-face result is a valid, complete outcome — nothing to
    // validate about probabilities that were never returned.
    return { ok: true, data: d as unknown as OpenFacePrediction };
  }

  const probs = d.expressionProbabilities;
  if (typeof probs !== 'object' || probs === null) {
    return { ok: false, error: 'Malformed response: faceDetected is true but expressionProbabilities is missing.' };
  }
  const probsRecord = probs as Record<string, unknown>;

  for (const key of EXPRESSION_KEYS) {
    if (!isFiniteProbability(probsRecord[key])) {
      return { ok: false, error: `Malformed response: "${key}" is missing or not a finite number between 0 and 1.` };
    }
  }

  const sum = EXPRESSION_KEYS.reduce((total, key) => total + (probsRecord[key] as number), 0);
  if (Math.abs(sum - 1) > 0.05) {
    return { ok: false, error: `Malformed response: probabilities sum to ${sum.toFixed(4)}, expected ~1.` };
  }

  const maxKey = EXPRESSION_KEYS.reduce((best, key) =>
    (probsRecord[key] as number) > (probsRecord[best] as number) ? key : best
  );
  if (d.topExpression !== maxKey) {
    return { ok: false, error: `Malformed response: topExpression "${d.topExpression}" does not match the highest-probability class "${maxKey}".` };
  }

  return { ok: true, data: d as unknown as OpenFacePrediction };
}

/** The configured service URL, for display in connection-status UI — reads the same single source of truth this client already uses, rather than a second process.env read elsewhere. */
export function getOpenFaceServiceUrl(): string | null {
  return SERVICE_URL ?? null;
}

export async function checkOpenFaceHealth(): Promise<OpenFaceResult<OpenFaceHealth>> {
  if (!SERVICE_URL) {
    return { ok: false, error: 'EXPO_PUBLIC_OPENFACE_SERVICE_URL is not set — add it to .env to use OpenFace testing.' };
  }
  try {
    const response = await fetchWithTimeout(`${SERVICE_URL}/health`, { method: 'GET' }, HEALTH_TIMEOUT_MS);
    if (!response.ok) {
      return { ok: false, error: `Service responded with status ${response.status}.` };
    }
    const data = (await response.json()) as OpenFaceHealth;
    if (typeof data.status !== 'string' || typeof data.modelLoaded !== 'boolean') {
      return { ok: false, error: 'Malformed /health response.' };
    }
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'Connection to the OpenFace service timed out.' };
    }
    return { ok: false, error: 'Could not reach the OpenFace service — is it running?' };
  }
}

export async function predictExpression(imageBlob: Blob): Promise<OpenFaceResult<OpenFacePrediction>> {
  if (!SERVICE_URL) {
    return { ok: false, error: 'EXPO_PUBLIC_OPENFACE_SERVICE_URL is not set — add it to .env to use OpenFace testing.' };
  }
  try {
    const form = new FormData();
    form.append('file', imageBlob, 'frame.jpg');

    const response = await fetchWithTimeout(`${SERVICE_URL}/predict`, { method: 'POST', body: form }, PREDICT_TIMEOUT_MS);
    if (!response.ok) {
      let detail = `Service responded with status ${response.status}.`;
      try {
        const errBody = await response.json();
        if (typeof errBody?.detail === 'string') detail = errBody.detail;
      } catch {
        // response body wasn't JSON — keep the generic status-based message
      }
      return { ok: false, error: detail };
    }

    const data = await response.json();
    return validatePrediction(data);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'The request to OpenFace timed out.' };
    }
    return { ok: false, error: 'Network error reaching the OpenFace service.' };
  }
}

export function isValidExpressionKey(value: string): value is ExpressionKey {
  return (EXPRESSION_KEYS as readonly string[]).includes(value);
}
