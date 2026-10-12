// Pure temporal-analysis module for Stage 5 — baseline collection, a
// time-based rolling active window, smoothing, a baseline-vs-active
// distance metric, and persistence-gated trigger-candidate detection.
//
// Deliberately has NO dependency on the camera, React, or any DOM API —
// every function here takes a plain state object and plain frame data in,
// and returns a new plain state object out. This is what makes it testable
// with synthetic data (see sensingSession.test.ts) and reusable from both
// the researcher UI (OpenFaceTestPanel.tsx) and, eventually, real lesson
// checkpoints, without a second independent implementation.
//
// Deliberately re-declares EXPRESSION_KEYS instead of importing it from
// openfaceTypes.ts (only a `import type` for the shape, which TypeScript's
// type-stripping erases before any module resolution happens) — this file
// has zero runtime cross-file imports, so it can be executed directly via
// `node sensingSession.test.ts` without a bundler, while staying fully
// Metro-compatible for the actual app. The 8 classes are fixed by the
// already-verified model architecture (Stages 2-3), so this duplication is
// low-risk; update both lists together if that ever changes.

import type { ExpressionProbabilities, ExpressionKey } from './openfaceTypes';

export const SENSING_EXPRESSION_KEYS: readonly ExpressionKey[] = [
  'neutral',
  'happy',
  'sad',
  'surprise',
  'fear',
  'disgust',
  'anger',
  'contempt',
];

export type SensingMode = 'IDLE' | 'BASELINE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ERROR';

export interface FrameSample {
  timestamp: number; // ms — caller-supplied (performance.now() in the browser), not assumed regular
  faceDetected: boolean;
  expressionProbabilities: ExpressionProbabilities | null; // null whenever faceDetected is false
}

export interface WindowSummary {
  validFrameCount: number;
  invalidFrameCount: number;
  totalFrameCount: number;
  validFaceCoverage: number; // validFrameCount / totalFrameCount, 0 when totalFrameCount is 0
  meanProbabilities: ExpressionProbabilities | null; // null when validFrameCount is 0
  reliable: boolean; // validFrameCount > 0 AND validFaceCoverage >= minValidFaceCoverage
  windowStartTs: number;
  windowEndTs: number;
}

export interface SensingSessionConfig {
  samplingFps: 2 | 5;
  baselineDurationSec: number; // default 8, suggested range 5-10
  rollingWindowDurationSec: number; // default 6, suggested range 5-8 — this window length is this module's one smoothing parameter (see computeWindowSummary)
  minValidFaceCoverage: number; // default 0.6
  distanceThreshold: number; // experimental/engineering, not clinically derived — see normalizedDistance()
  persistenceDurationSec: number; // default 2.5, suggested range 2-3
}

export const DEFAULT_SENSING_CONFIG: SensingSessionConfig = {
  samplingFps: 5,
  baselineDurationSec: 8,
  rollingWindowDurationSec: 6,
  minValidFaceCoverage: 0.6,
  distanceThreshold: 0.25, // experimental starting point — see Stage 5 report for how this was picked and how to tune it
  persistenceDurationSec: 2.5,
};

export interface TriggerState {
  thresholdExceededSinceTs: number | null; // null = not currently in an exceedance episode
  triggerCandidate: boolean;
}

export interface SensingSessionState {
  sessionId: string;
  checkpointId: string;
  config: SensingSessionConfig;
  mode: SensingMode;
  pausedFromMode: SensingMode | null; // what to resume into — only meaningful while mode === 'PAUSED'
  startTime: number | null;
  endTime: number | null;
  baselineBuffer: FrameSample[];
  baselineWindow: WindowSummary | null; // set once finalizeBaseline() runs — null while still collecting
  baselineVector: ExpressionProbabilities | null; // set ONLY when the finalized baseline was reliable
  activeBuffer: FrameSample[]; // time-pruned rolling buffer — see addActiveFrame
  activeWindow: WindowSummary | null;
  distanceScore: number | null; // null whenever there's no valid baseline or the active window is unreliable
  trigger: TriggerState;
  error: string | null;
}

// ---- validation -----------------------------------------------------

function isValidProbabilityVector(value: unknown): value is ExpressionProbabilities {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  for (const key of SENSING_EXPRESSION_KEYS) {
    const v = record[key];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1) return false;
  }
  return true;
}

/** Normalizes a caller-supplied frame before it ever enters a buffer — a
 * face claimed as detected but carrying a malformed/out-of-range vector is
 * treated exactly like a missing-face frame (excluded from averages), never
 * as fabricated data and never by throwing. This is what test K exercises. */
export function sanitizeFrame(frame: { timestamp: number; faceDetected: boolean; expressionProbabilities: unknown }): FrameSample {
  if (!frame.faceDetected || !isValidProbabilityVector(frame.expressionProbabilities)) {
    return { timestamp: frame.timestamp, faceDetected: false, expressionProbabilities: null };
  }
  return { timestamp: frame.timestamp, faceDetected: true, expressionProbabilities: frame.expressionProbabilities };
}

// ---- vector math ------------------------------------------------------

function averageVectors(vectors: ExpressionProbabilities[]): ExpressionProbabilities {
  const sums: Record<string, number> = {};
  for (const key of SENSING_EXPRESSION_KEYS) sums[key] = 0;
  for (const v of vectors) {
    for (const key of SENSING_EXPRESSION_KEYS) sums[key] += v[key];
  }
  const result: Record<string, number> = {};
  for (const key of SENSING_EXPRESSION_KEYS) result[key] = sums[key] / vectors.length;
  return result as ExpressionProbabilities;
}

/**
 * Normalized Euclidean (L2) distance between two 8-class probability
 * vectors, divided by sqrt(2) so the result sits in roughly [0, 1] for any
 * two valid probability distributions (sqrt(2) is the distance between two
 * maximally different one-hot vectors, e.g. all-neutral vs all-anger — the
 * largest distance two such vectors can actually have).
 *
 * Chosen over cosine distance (ignores magnitude, which matters here since
 * these are already-normalized distributions, not arbitrary direction
 * vectors) and over KL/Jensen-Shannon divergence (information-theoretically
 * more apt for comparing distributions, but less transparent to read and
 * explain than "how far apart in 8-dimensional space," and the engineering
 * notes explicitly prioritize a transparent, easy-to-debug rule over a more
 * sophisticated one for this first prototype).
 *
 * Limitations: treats all 8 classes as equally weighted/meaningful, and
 * collapses the full 8-dimensional change into one scalar — it cannot by
 * itself say WHICH expression(s) shifted, only how far the overall
 * distribution moved from baseline. Two very different kinds of change
 * (e.g. neutral->sad vs neutral->anger) of the same magnitude produce the
 * same score. The baseline and active vectors themselves stay available on
 * the session state for direct inspection alongside this scalar.
 */
export function normalizedDistance(a: ExpressionProbabilities, b: ExpressionProbabilities): number {
  let sumSquares = 0;
  for (const key of SENSING_EXPRESSION_KEYS) {
    const diff = a[key] - b[key];
    sumSquares += diff * diff;
  }
  return Math.sqrt(sumSquares) / Math.SQRT2;
}

// ---- windows ------------------------------------------------------------

/** Keeps only frames within [nowTs - windowDurationMs, nowTs] — a
 * time-based prune, not a frame-count cap, so irregular arrival timing
 * (network jitter, a slow frame) never silently changes the effective
 * window length the way a fixed-count buffer would. The upper bound
 * (excluding anything newer than nowTs) matters when nowTs isn't
 * necessarily the latest frame's own timestamp — addActiveFrame always
 * calls this with nowTs equal to the frame it just appended, so frames are
 * already in order there, but this function stays correct as a general
 * time-window utility regardless of caller ordering assumptions. */
export function pruneToWindow(frames: FrameSample[], windowDurationMs: number, nowTs: number): FrameSample[] {
  const cutoff = nowTs - windowDurationMs;
  return frames.filter((f) => f.timestamp >= cutoff && f.timestamp <= nowTs);
}

/**
 * The window's mean probability vector IS this module's smoothing method —
 * a plain arithmetic mean over every valid (face-detected) frame currently
 * in the time-based window, no separate smoothing pass needed. Missing-face
 * frames are excluded entirely from the average (never treated as a
 * zero-valued vector, which would wrongly pull the mean toward "neutral"
 * every time the face is briefly lost). A short spike is naturally diluted
 * — e.g. one unusual frame among ~30 frames in a default 6s/5fps window
 * contributes roughly 1/30 of the mean, which is why a brief spike alone
 * (test B) shouldn't cross a reasonably-set threshold. The window length
 * is also the method's one temporal-delay parameter: a sustained real
 * change takes up to the full window duration to completely dominate the
 * average, since older frames remain in it until they age out — a longer
 * window smooths more but reacts slower; a shorter window reacts faster but
 * is noisier. windowDurationSec is directly configurable via
 * SensingSessionConfig for later research tuning.
 */
export function computeWindowSummary(frames: FrameSample[], minValidFaceCoverage: number): WindowSummary {
  const validFrames = frames.filter((f) => f.faceDetected && f.expressionProbabilities !== null);
  const totalFrameCount = frames.length;
  const validFrameCount = validFrames.length;
  const invalidFrameCount = totalFrameCount - validFrameCount;
  const validFaceCoverage = totalFrameCount > 0 ? validFrameCount / totalFrameCount : 0;
  const meanProbabilities = validFrameCount > 0 ? averageVectors(validFrames.map((f) => f.expressionProbabilities as ExpressionProbabilities)) : null;
  const reliable = validFrameCount > 0 && validFaceCoverage >= minValidFaceCoverage;
  return {
    validFrameCount,
    invalidFrameCount,
    totalFrameCount,
    validFaceCoverage,
    meanProbabilities,
    reliable,
    windowStartTs: frames.length > 0 ? frames[0].timestamp : 0,
    windowEndTs: frames.length > 0 ? frames[frames.length - 1].timestamp : 0,
  };
}

// ---- session lifecycle ---------------------------------------------------

export function createSession(sessionId: string, checkpointId: string, config: SensingSessionConfig = DEFAULT_SENSING_CONFIG): SensingSessionState {
  return {
    sessionId,
    checkpointId,
    config,
    mode: 'IDLE',
    pausedFromMode: null,
    startTime: null,
    endTime: null,
    baselineBuffer: [],
    baselineWindow: null,
    baselineVector: null,
    activeBuffer: [],
    activeWindow: null,
    distanceScore: null,
    trigger: { thresholdExceededSinceTs: null, triggerCandidate: false },
    error: null,
  };
}

export function startBaselineCollection(state: SensingSessionState, nowTs: number): SensingSessionState {
  if (state.mode !== 'IDLE') return state;
  return { ...state, mode: 'BASELINE', startTime: state.startTime ?? nowTs, baselineBuffer: [], baselineWindow: null, baselineVector: null };
}

/** Re-collect the baseline from scratch without leaving BASELINE mode — the
 * researcher-facing "Retry Baseline" action (requirement #4: "Allow the
 * researcher to repeat baseline collection when necessary"). */
export function retryBaselineCollection(state: SensingSessionState): SensingSessionState {
  if (state.mode !== 'BASELINE') return state;
  return { ...state, baselineBuffer: [], baselineWindow: null, baselineVector: null };
}

export function addBaselineFrame(state: SensingSessionState, rawFrame: { timestamp: number; faceDetected: boolean; expressionProbabilities: unknown }): SensingSessionState {
  if (state.mode !== 'BASELINE') return state;
  const frame = sanitizeFrame(rawFrame);
  const windowMs = state.config.baselineDurationSec * 1000;
  const newBuffer = pruneToWindow([...state.baselineBuffer, frame], windowMs, frame.timestamp);
  return { ...state, baselineBuffer: newBuffer };
}

/** Finalizes whatever is currently in baselineBuffer into a baseline
 * window/vector. Below-coverage data produces baselineVector: null (an
 * explicitly invalid, retryable baseline) rather than a baseline computed
 * from insufficient data — requirement #4's "Do not generate a valid
 * baseline from insufficient data." */
export function finalizeBaseline(state: SensingSessionState): SensingSessionState {
  if (state.mode !== 'BASELINE') return state;
  const summary = computeWindowSummary(state.baselineBuffer, state.config.minValidFaceCoverage);
  return { ...state, baselineWindow: summary, baselineVector: summary.reliable ? summary.meanProbabilities : null };
}

export function startActiveSensing(state: SensingSessionState): SensingSessionState {
  if (state.mode !== 'BASELINE' || !state.baselineVector) return state; // requires a valid baseline — requirement #8.1
  return {
    ...state,
    mode: 'ACTIVE',
    activeBuffer: [],
    activeWindow: null,
    distanceScore: null,
    trigger: { thresholdExceededSinceTs: null, triggerCandidate: false },
  };
}

/**
 * Appends a frame to the rolling active window, recomputes the window
 * summary and distance score, and updates trigger/persistence state.
 *
 * Trigger rule, applied fresh on every frame (documented precisely since
 * the spec leaves one case ambiguous — what happens if a trigger has
 * already fired and the distance later drops back under threshold): ANY
 * frame where distance <= threshold immediately resets BOTH the
 * exceedance timer AND triggerCandidate back to false, whether or not a
 * trigger had already fired. This is the simplest, most transparent rule
 * consistent with requirement #8.4 ("if distance falls below threshold
 * before persistence is met, reset the timer") — extended symmetrically to
 * after a trigger too, rather than inventing an unrequested "sticky latch"
 * behavior. A sustained return above threshold re-arms a fresh persistence
 * period, exactly like the very first exceedance.
 *
 * If the window is unreliable (coverage below minValidFaceCoverage) or no
 * valid baseline exists, detection is fully reset, not merely suspended —
 * a clearly documented choice over "pause and keep the old timer," which
 * risked a stale partial-persistence period silently surviving an
 * unrelated gap (e.g. the caregiver looking away) and then combining with
 * a later, unconnected exceedance to produce a false trigger.
 */
export function addActiveFrame(state: SensingSessionState, rawFrame: { timestamp: number; faceDetected: boolean; expressionProbabilities: unknown }): SensingSessionState {
  if (state.mode !== 'ACTIVE') return state;
  const frame = sanitizeFrame(rawFrame);
  const windowMs = state.config.rollingWindowDurationSec * 1000;
  const newBuffer = pruneToWindow([...state.activeBuffer, frame], windowMs, frame.timestamp);
  const activeWindow = computeWindowSummary(newBuffer, state.config.minValidFaceCoverage);

  let distanceScore: number | null = null;
  let trigger: TriggerState = { thresholdExceededSinceTs: null, triggerCandidate: false };

  if (activeWindow.reliable && state.baselineVector && activeWindow.meanProbabilities) {
    distanceScore = normalizedDistance(state.baselineVector, activeWindow.meanProbabilities);
    if (distanceScore > state.config.distanceThreshold) {
      const since = state.trigger.thresholdExceededSinceTs ?? frame.timestamp;
      const exceededSec = (frame.timestamp - since) / 1000;
      trigger = { thresholdExceededSinceTs: since, triggerCandidate: exceededSec >= state.config.persistenceDurationSec };
    }
    // else: distance <= threshold — trigger stays at the reset default above.
  }
  // else: unreliable window or no baseline — trigger stays at the reset default above.

  return { ...state, activeBuffer: newBuffer, activeWindow, distanceScore, trigger };
}

export function pauseSensing(state: SensingSessionState): SensingSessionState {
  if (state.mode !== 'ACTIVE' && state.mode !== 'BASELINE') return state;
  return { ...state, mode: 'PAUSED', pausedFromMode: state.mode };
}

export function resumeSensing(state: SensingSessionState): SensingSessionState {
  if (state.mode !== 'PAUSED' || !state.pausedFromMode) return state;
  return { ...state, mode: state.pausedFromMode, pausedFromMode: null };
}

/** Clears both buffers on completion — requirement #11.7 ("clear session
 * buffers when a session ends"). baselineVector/activeWindow/distanceScore
 * are deliberately left in place so the researcher UI can still show the
 * final result after stopping, only the raw per-frame buffers are freed. */
export function completeSession(state: SensingSessionState, nowTs: number): SensingSessionState {
  return { ...state, mode: 'COMPLETED', endTime: nowTs, baselineBuffer: [], activeBuffer: [] };
}

export function errorSession(state: SensingSessionState, message: string, nowTs: number): SensingSessionState {
  return { ...state, mode: 'ERROR', endTime: nowTs, error: message, baselineBuffer: [], activeBuffer: [] };
}

// ---- checkpoint-level trigger retention (Stage 6) ------------------------

/**
 * Pure latch: once a live trigger candidate has fired, stays true for the
 * rest of the checkpoint even if the live trigger later resets (e.g. the
 * caregiver's expression recovers toward baseline mid-video — see
 * addActiveFrame's trigger-reset rule above). Call on every frame with the
 * session's current live trigger.triggerCandidate; call with `false` again
 * only when starting a genuinely new checkpoint/session.
 *
 * Extracted as its own pure function (not just inline component logic) so
 * it's directly unit-testable with synthetic sequences — see
 * sensingSession.test.ts's trigger-retention tests — matching the same
 * "camera-free, reproducible" testing approach as the rest of this module.
 */
export function latchTriggerOccurred(previouslyLatched: boolean, liveTriggerCandidate: boolean): boolean {
  return previouslyLatched || liveTriggerCandidate;
}
