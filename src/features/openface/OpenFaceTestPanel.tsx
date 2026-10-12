import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui';
import { checkOpenFaceHealth, getOpenFaceServiceUrl, predictExpression } from './openfaceClient';
import { EXPRESSION_KEYS, OpenFacePrediction } from './openfaceTypes';
import {
  addActiveFrame,
  addBaselineFrame,
  completeSession,
  createSession,
  finalizeBaseline,
  pauseSensing,
  resumeSensing,
  retryBaselineCollection,
  startActiveSensing,
  startBaselineCollection,
} from './sensingSession';
import type { SensingSessionConfig, SensingSessionState } from './sensingSession';

// Researcher/engineering-only panel (Preferences → OpenFace Testing).
// Expo Web only — native camera support is explicitly out of scope.
// Follows the same imperative-DOM pattern as courses/YouTubeEmbed.web.tsx:
// a plain <div> provides the ref, and the actual <video> element is
// created with document.createElement and attached outside React's own
// tree, since react-native-web's TSX types don't cover raw HTML elements
// the same way a plain <div>/<canvas> already does in that file.

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'model-unavailable' | 'connection-failed';
type CameraStatus = 'idle' | 'starting' | 'active' | 'error';
type InferenceStatus = 'idle' | 'processing' | 'completed' | 'failed';
type SustainedFps = 2 | 5;
type SustainedDuration = 30 | 60;
type StoppedReason = 'completed' | 'user-stopped' | 'left-screen' | 'camera-inactive';

const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;

const isWebCameraSupported =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function';

interface SustainedSummary {
  fps: SustainedFps;
  configuredDurationSec: SustainedDuration;
  actualDurationSec: number;
  scheduled: number;
  submitted: number;
  processed: number;
  skipped: number;
  failed: number;
  faceDetectedCount: number;
  serverLatencies: number[];
  roundTripLatencies: number[];
  captureLatencies: number[];
  stoppedReason: StoppedReason;
  memoryBeforeBytes: number | null;
  memoryAfterBytes: number | null;
}

function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  const index = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[index];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function readHeapBytes(): number | null {
  // performance.memory is a non-standard Chrome-only API — fine here since
  // this project explicitly targets Expo Web in Chrome for this stage.
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  return mem ? mem.usedJSHeapSize : null;
}

export function OpenFaceTestPanel() {
  const { color, spacing, typography, radii } = useTheme();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCapturingRef = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionDevice, setConnectionDevice] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastSuccessfulCheckAt, setLastSuccessfulCheckAt] = useState<Date | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const cameraStatusRef = useRef<CameraStatus>('idle'); // mirrors cameraStatus for use inside the sustained-test interval closure, which must see the live value, not a stale one captured at scheduling time
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [inferenceStatus, setInferenceStatus] = useState<InferenceStatus>('idle');
  const [lastPrediction, setLastPrediction] = useState<OpenFacePrediction | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [latency, setLatency] = useState<{ captureMs: number; roundTripMs: number; totalMs: number } | null>(null);

  // Sustained sampling test state
  const [sustainedFps, setSustainedFps] = useState<SustainedFps>(2);
  const [sustainedDuration, setSustainedDuration] = useState<SustainedDuration>(30);
  const [sustainedRunning, setSustainedRunning] = useState(false);
  const [sustainedElapsedSec, setSustainedElapsedSec] = useState(0);
  const [sustainedLiveCounts, setSustainedLiveCounts] = useState({ scheduled: 0, submitted: 0, processed: 0, skipped: 0, failed: 0 });
  const [sustainedSummary, setSustainedSummary] = useState<SustainedSummary | null>(null);
  const sustainedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sustainedTickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sustainedInFlightRef = useRef(false);
  const memoryBeforeRef = useRef<number | null>(null);
  const sustainedDataRef = useRef<{
    scheduled: number;
    submitted: number;
    processed: number;
    skipped: number;
    failed: number;
    faceDetectedCount: number;
    serverLatencies: number[];
    roundTripLatencies: number[];
    captureLatencies: number[];
    startedAt: number;
  } | null>(null);

  // Temporal sensing (Stage 5) — session config inputs, adjustable only
  // while IDLE. Defaults match OPENFACE_ENGINEERING_NOTES.md's suggested
  // starting values.
  const [sensingFps, setSensingFps] = useState<2 | 5>(5);
  const [baselineDurationSec, setBaselineDurationSec] = useState(8);
  const [rollingWindowDurationSec, setRollingWindowDurationSec] = useState(6);
  const [distanceThreshold, setDistanceThreshold] = useState(0.25);
  const [persistenceDurationSec, setPersistenceDurationSec] = useState(2.5);

  const [sensingState, setSensingState] = useState<SensingSessionState | null>(null);
  const sensingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sensingBaselineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensingInFlightRef = useRef(false);

  function stopSensingInterval() {
    if (sensingIntervalRef.current) clearInterval(sensingIntervalRef.current);
    if (sensingBaselineTimerRef.current) clearTimeout(sensingBaselineTimerRef.current);
    sensingIntervalRef.current = null;
    sensingBaselineTimerRef.current = null;
  }

  // One capture+predict cycle, routed into whichever reducer matches the
  // CURRENT mode at the moment the result comes back (read via the
  // functional setState form, never a stale closure value) — shared by
  // both the baseline and active collection intervals below.
  async function runSensingCapture() {
    if (!videoElRef.current) return;
    sensingInFlightRef.current = true;
    try {
      const blob = await captureBlobFromVideo();
      if (!blob) return;
      const result = await predictExpression(blob);
      const rawFrame = {
        timestamp: performance.now(),
        faceDetected: result.ok ? result.data.faceDetected : false,
        expressionProbabilities: result.ok ? result.data.expressionProbabilities : null,
      };
      setSensingState((prev) => {
        if (!prev) return prev;
        if (prev.mode === 'BASELINE') return addBaselineFrame(prev, rawFrame);
        if (prev.mode === 'ACTIVE') return addActiveFrame(prev, rawFrame);
        return prev;
      });
    } finally {
      sensingInFlightRef.current = false;
    }
  }

  function startSensingCaptureLoop() {
    const intervalMs = 1000 / sensingFps;
    sensingIntervalRef.current = setInterval(() => {
      if (cameraStatusRef.current !== 'active') {
        stopSensingInterval();
        setSensingState((prev) => (prev ? errorSessionSafely(prev, 'Camera became inactive during sensing.') : prev));
        return;
      }
      if (sensingInFlightRef.current) return; // skip this tick — previous capture still in flight
      runSensingCapture();
    }, intervalMs);
  }

  function errorSessionSafely(state: SensingSessionState, message: string): SensingSessionState {
    stopSensingInterval();
    return { ...state, mode: 'ERROR', endTime: performance.now(), error: message, baselineBuffer: [], activeBuffer: [] };
  }

  function startNewSensingSession() {
    if (cameraStatusRef.current !== 'active') return;
    const config: SensingSessionConfig = {
      samplingFps: sensingFps,
      baselineDurationSec,
      rollingWindowDurationSec,
      minValidFaceCoverage: 0.6,
      distanceThreshold,
      persistenceDurationSec,
    };
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let state = createSession(sessionId, 'openface-test-panel', config);
    state = startBaselineCollection(state, performance.now());
    setSensingState(state);
    sensingInFlightRef.current = false;
    startSensingCaptureLoop();

    sensingBaselineTimerRef.current = setTimeout(() => {
      stopSensingInterval();
      setSensingState((prev) => (prev && prev.mode === 'BASELINE' ? finalizeBaseline(prev) : prev));
    }, baselineDurationSec * 1000);
  }

  function retrySensingBaseline() {
    stopSensingInterval();
    setSensingState((prev) => (prev ? retryBaselineCollection(prev) : prev));
    sensingInFlightRef.current = false;
    startSensingCaptureLoop();
    sensingBaselineTimerRef.current = setTimeout(() => {
      stopSensingInterval();
      setSensingState((prev) => (prev && prev.mode === 'BASELINE' ? finalizeBaseline(prev) : prev));
    }, baselineDurationSec * 1000);
  }

  function beginActiveSensing() {
    setSensingState((prev) => (prev ? startActiveSensing(prev) : prev));
    sensingInFlightRef.current = false;
    startSensingCaptureLoop();
  }

  function pauseSensingSession() {
    stopSensingInterval();
    setSensingState((prev) => (prev ? pauseSensing(prev) : prev));
  }

  function resumeSensingSession() {
    setSensingState((prev) => (prev ? resumeSensing(prev) : prev));
    sensingInFlightRef.current = false;
    startSensingCaptureLoop();
  }

  function stopSensingSession() {
    stopSensingInterval();
    setSensingState((prev) => (prev ? completeSession(prev, performance.now()) : prev));
  }

  // Shared by captureFrame(), runSustainedCapture(), and the sensing-session
  // capture loop below — the one place that knows how to turn the current
  // video frame into a JPEG Blob, so there's exactly one canvas-capture
  // implementation instead of three slightly-different copies.
  async function captureBlobFromVideo(): Promise<Blob | null> {
    if (!videoElRef.current) return null;
    if (!canvasElRef.current) canvasElRef.current = document.createElement('canvas');
    const canvas = canvasElRef.current;
    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElRef.current, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  }

  // Connect/Recheck both call this — a plain network ping to /health, never
  // camera activation (the camera stays untouched until "Start Camera" is
  // pressed explicitly, and this panel never auto-connects on mount: the
  // researcher must press Connect, matching the explicit request for a
  // user-driven connection control rather than an implicit background check).
  async function refreshConnection() {
    setConnectionStatus('connecting');
    setConnectionError(null);
    const result = await checkOpenFaceHealth();
    if (!result.ok) {
      setConnectionStatus('connection-failed');
      setConnectionError(result.error);
      setConnectionDevice(null);
      return;
    }
    if (!result.data.modelLoaded) {
      setConnectionStatus('model-unavailable');
      setConnectionError(result.data.error);
      setConnectionDevice(null);
      setLastSuccessfulCheckAt(new Date()); // the service itself did respond — only the model isn't ready yet
      return;
    }
    setConnectionStatus('connected');
    setConnectionDevice(result.data.device);
    setLastSuccessfulCheckAt(new Date());
  }

  // Disconnect is a purely local/UI action: it stops this panel's own
  // camera + any in-progress sensing session (stopCamera() already handles
  // both, see below) and resets connection state. It never talks to the
  // service and can never terminate the Python process — there is no
  // mechanism here that could even attempt that.
  function disconnectService() {
    if (cameraStatusRef.current === 'active') stopCamera();
    setConnectionStatus('disconnected');
    setConnectionError(null);
    setConnectionDevice(null);
  }

  function stopAllTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoElRef.current) {
      videoElRef.current.srcObject = null;
    }
  }

  function finalizeSustainedTest(reason: StoppedReason) {
    if (sustainedIntervalRef.current) clearInterval(sustainedIntervalRef.current);
    if (sustainedTickTimerRef.current) clearInterval(sustainedTickTimerRef.current);
    sustainedIntervalRef.current = null;
    sustainedTickTimerRef.current = null;

    const data = sustainedDataRef.current;
    if (data) {
      const actualDurationSec = (performance.now() - data.startedAt) / 1000;
      setSustainedSummary({
        fps: sustainedFps,
        configuredDurationSec: sustainedDuration,
        actualDurationSec,
        scheduled: data.scheduled,
        submitted: data.submitted,
        processed: data.processed,
        skipped: data.skipped,
        failed: data.failed,
        faceDetectedCount: data.faceDetectedCount,
        serverLatencies: data.serverLatencies,
        roundTripLatencies: data.roundTripLatencies,
        captureLatencies: data.captureLatencies,
        stoppedReason: reason,
        memoryBeforeBytes: memoryBeforeRef.current,
        memoryAfterBytes: readHeapBytes(),
      });
    }
    sustainedDataRef.current = null;
    setSustainedRunning(false);
  }

  async function runSustainedCapture() {
    if (!videoElRef.current) return;
    sustainedInFlightRef.current = true;
    try {
      const captureStart = performance.now();
      const blob = await captureBlobFromVideo();
      if (!blob) throw new Error('capture failed');
      const captureMs = performance.now() - captureStart;

      const requestStart = performance.now();
      const result = await predictExpression(blob);
      const roundTripMs = performance.now() - requestStart;

      const data = sustainedDataRef.current;
      if (!data) return; // test was stopped while this request was in flight
      data.captureLatencies.push(captureMs);
      data.roundTripLatencies.push(roundTripMs);

      if (!result.ok) {
        data.failed += 1;
        return;
      }
      data.processed += 1;
      data.serverLatencies.push(result.data.totalProcessingLatencyMs);
      if (result.data.faceDetected) data.faceDetectedCount += 1;
      // Keep the live results card updating too, so the researcher sees real inference happening, not just counters.
      setLastPrediction(result.data);
    } catch {
      const data = sustainedDataRef.current;
      if (data) data.failed += 1;
    } finally {
      sustainedInFlightRef.current = false;
    }
  }

  function startSustainedTest() {
    if (cameraStatusRef.current !== 'active') return;
    setSustainedSummary(null);
    memoryBeforeRef.current = readHeapBytes();
    sustainedDataRef.current = {
      scheduled: 0,
      submitted: 0,
      processed: 0,
      skipped: 0,
      failed: 0,
      faceDetectedCount: 0,
      serverLatencies: [],
      roundTripLatencies: [],
      captureLatencies: [],
      startedAt: performance.now(),
    };
    setSustainedRunning(true);
    setSustainedElapsedSec(0);
    sustainedInFlightRef.current = false;

    const intervalMs = 1000 / sustainedFps;
    sustainedIntervalRef.current = setInterval(() => {
      const data = sustainedDataRef.current;
      if (!data) return;
      data.scheduled += 1;

      if (cameraStatusRef.current !== 'active') {
        finalizeSustainedTest('camera-inactive');
        return;
      }
      if (sustainedInFlightRef.current) {
        data.skipped += 1;
      } else {
        data.submitted += 1;
        runSustainedCapture();
      }
      setSustainedLiveCounts({ scheduled: data.scheduled, submitted: data.submitted, processed: data.processed, skipped: data.skipped, failed: data.failed });
    }, intervalMs);

    // Separate 1s ticker just for the elapsed-time display and the hard duration cutoff — independent of the sampling interval so changing FPS doesn't affect timing accuracy.
    const startedAt = performance.now();
    sustainedTickTimerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      setSustainedElapsedSec(elapsed);
      if (elapsed >= sustainedDuration) {
        finalizeSustainedTest('completed');
      }
    }, 1000);
  }

  function stopSustainedTest() {
    finalizeSustainedTest('user-stopped');
  }

  // Release camera resources AND stop any running sustained test or
  // sensing session on unmount, regardless of how the screen was left.
  useEffect(() => {
    return () => {
      if (sustainedDataRef.current) finalizeSustainedTest('left-screen');
      stopSensingInterval();
      stopAllTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    if (!isWebCameraSupported) {
      setCameraStatus('error');
      setCameraError('Camera access is not supported in this environment (Expo Web/Chrome only for this stage).');
      return;
    }
    setCameraStatus('starting');
    cameraStatusRef.current = 'starting';
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: CAPTURE_WIDTH }, height: { ideal: CAPTURE_HEIGHT } },
        audio: false,
      });
      streamRef.current = stream;

      if (!videoElRef.current) {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.borderRadius = `${radii.lg}px`;
        videoElRef.current = video;
        containerRef.current?.appendChild(video);
      }
      if (!canvasElRef.current) {
        canvasElRef.current = document.createElement('canvas');
      }
      videoElRef.current.srcObject = stream;
      await videoElRef.current.play();
      setCameraStatus('active');
      cameraStatusRef.current = 'active';
    } catch (err) {
      const name = err instanceof DOMException ? err.name : 'Unknown';
      const message =
        name === 'NotAllowedError'
          ? 'Camera permission was denied.'
          : name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : `Could not access the camera (${name}).`;
      setCameraStatus('error');
      cameraStatusRef.current = 'error';
      setCameraError(message);
      stopAllTracks();
    }
  }

  function stopCamera() {
    if (sustainedDataRef.current) finalizeSustainedTest('camera-inactive');
    if (sensingState && (sensingState.mode === 'BASELINE' || sensingState.mode === 'ACTIVE' || sensingState.mode === 'PAUSED')) {
      stopSensingInterval();
      setSensingState((prev) => (prev ? errorSessionSafely(prev, 'Camera was stopped during sensing.') : prev));
    }
    stopAllTracks();
    setCameraStatus('idle');
    cameraStatusRef.current = 'idle';
  }

  async function captureFrame() {
    if (isCapturingRef.current) return; // guards against duplicate requests from repeated presses
    if (cameraStatus !== 'active' || !videoElRef.current) return;
    isCapturingRef.current = true;

    const captureStart = performance.now();
    setInferenceStatus('processing');
    setLastError(null);

    try {
      const blob = await captureBlobFromVideo();
      if (!blob) throw new Error('Could not capture a frame from the camera.');
      const captureMs = performance.now() - captureStart;

      const requestStart = performance.now();
      const result = await predictExpression(blob);
      const roundTripMs = performance.now() - requestStart;
      const totalMs = performance.now() - captureStart;
      setLatency({ captureMs, roundTripMs, totalMs });

      if (!result.ok) {
        setInferenceStatus('failed');
        setLastError(result.error);
        setLastPrediction(null);
        return;
      }
      setInferenceStatus('completed');
      setLastPrediction(result.data);
    } catch (err) {
      setInferenceStatus('failed');
      setLastError(err instanceof Error ? err.message : 'Unexpected error capturing or submitting the frame.');
      setLastPrediction(null);
    } finally {
      isCapturingRef.current = false;
    }
  }

  const sensingActive = sensingState !== null && (sensingState.mode === 'BASELINE' || sensingState.mode === 'ACTIVE' || sensingState.mode === 'PAUSED');

  const connectionLabel: Record<ConnectionStatus, string> = {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connected: 'Connected',
    'model-unavailable': 'Model unavailable',
    'connection-failed': 'Connection failed',
  };
  const connectionColor =
    connectionStatus === 'connected'
      ? color.success
      : connectionStatus === 'connecting'
        ? color.textSecondary
        : connectionStatus === 'disconnected'
          ? color.textSecondary
          : color.warning;
  const serviceUrl = getOpenFaceServiceUrl();

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[typography.caption, { color: color.textSecondary }]}>
        Engineering testing only — never shown in the normal caregiver experience. Results below are model-estimated
        facial-expression probabilities, not confirmed emotions.
      </Text>

      {/* Connection controls — connecting here only pings the local FastAPI
          service's /health endpoint; it never starts the camera and never
          starts or stops the Python process itself (that's the one-click
          launcher's job, outside this app). */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Text style={[typography.bodySmall, { color: color.textPrimary }]}>Connection status:</Text>
          <Text style={[typography.bodySmall, { color: connectionColor, fontWeight: '700' }]}>{connectionLabel[connectionStatus]}</Text>
        </View>
        {connectionError && <Text style={[typography.caption, { color: color.warning }]}>{connectionError}</Text>}

        {connectionStatus === 'connected' && (
          <View style={{ gap: 2 }}>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Service URL: {serviceUrl ?? 'not configured'}</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Active device: {connectionDevice ?? 'unknown'}</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Model readiness: Ready</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Last successful health check: {lastSuccessfulCheckAt ? lastSuccessfulCheckAt.toLocaleTimeString() : 'n/a'}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {connectionStatus !== 'connected' && (
            <Button
              label={
                connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : connectionStatus === 'disconnected'
                    ? 'Connect to OpenFace'
                    : 'Reconnect'
              }
              onPress={refreshConnection}
              disabled={connectionStatus === 'connecting'}
            />
          )}
          <Button label="Recheck Connection" variant="secondary" onPress={refreshConnection} disabled={connectionStatus === 'connecting'} />
          <Button
            label="Disconnect / Stop Sensing"
            variant="secondary"
            onPress={disconnectService}
            disabled={connectionStatus === 'disconnected'}
          />
        </View>
      </View>

      {!isWebCameraSupported && (
        <Text style={[typography.bodySmall, { color: color.warning }]}>
          Camera access isn't available in this environment. This panel targets Expo Web in Chrome for this stage.
        </Text>
      )}

      {/* Camera preview container — the actual <video> element is attached imperatively, see startCamera(). A plain <div>, not RN's <View>, matching the same pattern already established in courses/YouTubeEmbed.web.tsx for exactly this situation. */}
      {isWebCameraSupported && (
        <div
          ref={containerRef}
          style={{ backgroundColor: color.surfaceAlt, borderRadius: radii.lg, overflow: 'hidden', minHeight: cameraStatus === 'active' ? undefined : 2 }}
        />
      )}
      {cameraError && <Text style={[typography.bodySmall, { color: color.warning }]}>{cameraError}</Text>}

      {/* Camera controls */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Button
          label={cameraStatus === 'starting' ? 'Starting...' : 'Start Camera'}
          variant="secondary"
          onPress={startCamera}
          disabled={!isWebCameraSupported || cameraStatus === 'active' || cameraStatus === 'starting'}
        />
        <Button
          label={inferenceStatus === 'processing' ? 'Processing...' : 'Capture Frame'}
          onPress={captureFrame}
          disabled={cameraStatus !== 'active' || inferenceStatus === 'processing' || sustainedRunning || sensingActive}
        />
        <Button label="Stop Camera" variant="secondary" onPress={stopCamera} disabled={cameraStatus !== 'active'} />
      </View>

      {/* Inference status */}
      <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
        Inference:{' '}
        <Text style={{ color: color.textPrimary, fontWeight: '700' }}>
          {inferenceStatus === 'idle' ? 'Idle' : inferenceStatus === 'processing' ? 'Processing' : inferenceStatus === 'completed' ? 'Completed' : 'Failed'}
        </Text>
      </Text>

      {lastError && <Text style={[typography.bodySmall, { color: color.warning }]}>{lastError}</Text>}

      {lastPrediction && (
        <View style={{ gap: spacing.sm, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md }}>
          <Text style={[typography.bodySmall, { color: color.textPrimary }]}>
            Face detected: <Text style={{ fontWeight: '700' }}>{lastPrediction.faceDetected ? 'Yes' : 'No'}</Text>
          </Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            Face confidence: {lastPrediction.faceConfidence === null ? 'not available' : lastPrediction.faceConfidence.toFixed(2)}
          </Text>

          {!lastPrediction.faceDetected && (
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{lastPrediction.message ?? 'No valid face detected.'}</Text>
          )}

          {lastPrediction.faceDetected && lastPrediction.expressionProbabilities && (
            <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
              {EXPRESSION_KEYS.map((key) => {
                const value = lastPrediction.expressionProbabilities![key];
                return (
                  <View key={key} style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[typography.caption, { color: color.textPrimary, textTransform: 'capitalize' }]}>{key}</Text>
                      <Text style={[typography.caption, { color: color.textSecondary }]}>{value.toFixed(3)}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: radii.pill, backgroundColor: color.surfaceAlt, overflow: 'hidden' }}>
                      <View
                        style={{
                          width: `${Math.round(value * 100)}%`,
                          height: '100%',
                          backgroundColor: key === lastPrediction.topExpression ? color.primary : color.textSecondary,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
              <Text style={[typography.bodySmall, { color: color.textPrimary, marginTop: spacing.xs }]}>
                Highest-scoring: <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{lastPrediction.topExpression}</Text> (
                {lastPrediction.topProbability?.toFixed(3)})
              </Text>
            </View>
          )}

          <View style={{ gap: 2, marginTop: spacing.xs }}>
            <Text style={[typography.caption, { color: color.textSecondary }]}>Device: {lastPrediction.device ?? 'unknown'}</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Server inference latency: {lastPrediction.inferenceLatencyMs !== null ? `${lastPrediction.inferenceLatencyMs}ms` : 'n/a (no face)'}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Server total processing: {lastPrediction.totalProcessingLatencyMs}ms
            </Text>
            {latency && (
              <>
                <Text style={[typography.caption, { color: color.textSecondary }]}>Client-side capture time: {latency.captureMs.toFixed(1)}ms</Text>
                <Text style={[typography.caption, { color: color.textSecondary }]}>Network/API round-trip: {latency.roundTripMs.toFixed(1)}ms</Text>
                <Text style={[typography.caption, { color: color.textPrimary, fontWeight: '700' }]}>
                  Total (press to result): {latency.totalMs.toFixed(1)}ms
                </Text>
              </>
            )}
            <Text style={[typography.caption, { color: color.textSecondary }]}>Timestamp: {lastPrediction.timestamp}</Text>
          </View>
        </View>
      )}

      {/* Sustained sampling performance test */}
      <View style={{ gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: color.surfaceAlt }}>
        <Text style={[typography.label, { color: color.textPrimary }]}>Sustained Sampling Test</Text>
        <Text style={[typography.caption, { color: color.textSecondary }]}>
          Performance verification only — not continuous sensing, not a baseline/trigger system.
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={[typography.bodySmall, { color: color.textPrimary }]}>Rate:</Text>
          {([2, 5] as SustainedFps[]).map((fps) => (
            <Pressable key={fps} onPress={() => setSustainedFps(fps)} disabled={sustainedRunning}>
              <Text
                style={[
                  typography.bodySmall,
                  { color: sustainedFps === fps ? color.primary : color.textSecondary, fontWeight: sustainedFps === fps ? '700' : '400' },
                ]}
              >
                {fps} FPS
              </Text>
            </Pressable>
          ))}
          <Text style={[typography.bodySmall, { color: color.textPrimary, marginLeft: spacing.md }]}>Duration:</Text>
          {([30, 60] as SustainedDuration[]).map((d) => (
            <Pressable key={d} onPress={() => setSustainedDuration(d)} disabled={sustainedRunning}>
              <Text
                style={[
                  typography.bodySmall,
                  { color: sustainedDuration === d ? color.primary : color.textSecondary, fontWeight: sustainedDuration === d ? '700' : '400' },
                ]}
              >
                {d}s
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label={sustainedRunning ? 'Running...' : 'Start Sustained Test'}
            onPress={startSustainedTest}
            disabled={cameraStatus !== 'active' || sustainedRunning || inferenceStatus === 'processing' || sensingActive}
          />
          <Button label="Stop" variant="secondary" onPress={stopSustainedTest} disabled={!sustainedRunning} />
        </View>

        {sustainedRunning && (
          <View style={{ gap: 2 }}>
            <Text style={[typography.bodySmall, { color: color.textPrimary }]}>
              {sustainedElapsedSec.toFixed(1)}s / {sustainedDuration}s — scheduled {sustainedLiveCounts.scheduled}, submitted{' '}
              {sustainedLiveCounts.submitted}, processed {sustainedLiveCounts.processed}, skipped {sustainedLiveCounts.skipped}, failed{' '}
              {sustainedLiveCounts.failed}
            </Text>
          </View>
        )}

        {sustainedSummary && (
          <View style={{ gap: spacing.xs, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.xs }}>
            <Text style={[typography.bodySmall, { color: color.textPrimary, fontWeight: '700' }]}>
              Result ({sustainedSummary.fps} FPS, {sustainedSummary.configuredDurationSec}s configured, stopped: {sustainedSummary.stoppedReason})
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Actual duration: {sustainedSummary.actualDurationSec.toFixed(1)}s
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Achieved FPS (processed/duration): {(sustainedSummary.processed / sustainedSummary.actualDurationSec).toFixed(2)}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Scheduled: {sustainedSummary.scheduled} · Submitted: {sustainedSummary.submitted} · Processed: {sustainedSummary.processed} ·
              Skipped: {sustainedSummary.skipped} · Failed: {sustainedSummary.failed}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Face-detection success rate:{' '}
              {sustainedSummary.processed > 0 ? `${((sustainedSummary.faceDetectedCount / sustainedSummary.processed) * 100).toFixed(1)}%` : 'n/a'}
            </Text>
            {(() => {
              const sortedServer = [...sustainedSummary.serverLatencies].sort((a, b) => a - b);
              const sortedRoundTrip = [...sustainedSummary.roundTripLatencies].sort((a, b) => a - b);
              const avgCapture = mean(sustainedSummary.captureLatencies);
              return (
                <>
                  <Text style={[typography.caption, { color: color.textPrimary, marginTop: spacing.xs }]}>Server processing latency (ms):</Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    avg {mean(sortedServer)?.toFixed(1) ?? 'n/a'} · median {percentile(sortedServer, 50)?.toFixed(1) ?? 'n/a'} · p95{' '}
                    {percentile(sortedServer, 95)?.toFixed(1) ?? 'n/a'} · max {sortedServer[sortedServer.length - 1]?.toFixed(1) ?? 'n/a'}
                  </Text>
                  <Text style={[typography.caption, { color: color.textPrimary, marginTop: spacing.xs }]}>Client round-trip latency (ms):</Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    avg {mean(sortedRoundTrip)?.toFixed(1) ?? 'n/a'} · median {percentile(sortedRoundTrip, 50)?.toFixed(1) ?? 'n/a'} · p95{' '}
                    {percentile(sortedRoundTrip, 95)?.toFixed(1) ?? 'n/a'} · max {sortedRoundTrip[sortedRoundTrip.length - 1]?.toFixed(1) ?? 'n/a'}
                  </Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    Avg client-side capture/encode: {avgCapture?.toFixed(1) ?? 'n/a'}ms
                  </Text>
                </>
              );
            })()}
            <Text style={[typography.caption, { color: color.textSecondary, marginTop: spacing.xs }]}>
              Browser JS heap (Chrome-only, approximate):{' '}
              {sustainedSummary.memoryBeforeBytes !== null && sustainedSummary.memoryAfterBytes !== null
                ? `${(sustainedSummary.memoryBeforeBytes / 1_000_000).toFixed(1)}MB -> ${(sustainedSummary.memoryAfterBytes / 1_000_000).toFixed(1)}MB (Δ ${((sustainedSummary.memoryAfterBytes - sustainedSummary.memoryBeforeBytes) / 1_000_000).toFixed(1)}MB)`
                : 'not available in this browser'}
            </Text>
          </View>
        )}
      </View>

      {/* Temporal sensing — Stage 5: baseline, rolling window, distance score, trigger-candidate detection */}
      <View style={{ gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: color.surfaceAlt }}>
        <Text style={[typography.label, { color: color.textPrimary }]}>Temporal Sensing</Text>
        <Text style={[typography.caption, { color: color.textSecondary }]}>
          Engineering signal-processing test only. A trigger candidate reflects a sustained change in model-estimated
          facial-expression patterns relative to this session's own baseline — it is not a confirmed emotion, and it
          does not do anything beyond appear below (no lesson prompts, no coaching, no severity changes).
        </Text>

        {!sensingState && (
          <>
            <ConfigStepper
              label="Baseline duration"
              value={baselineDurationSec}
              unit="s"
              min={5}
              max={10}
              step={1}
              onChange={setBaselineDurationSec}
            />
            <ConfigStepper
              label="Rolling window"
              value={rollingWindowDurationSec}
              unit="s"
              min={5}
              max={8}
              step={1}
              onChange={setRollingWindowDurationSec}
            />
            <ConfigStepper
              label="Distance threshold (experimental)"
              value={distanceThreshold}
              unit=""
              min={0.05}
              max={0.9}
              step={0.05}
              onChange={setDistanceThreshold}
            />
            <ConfigStepper
              label="Persistence duration"
              value={persistenceDurationSec}
              unit="s"
              min={2}
              max={3}
              step={0.5}
              onChange={setPersistenceDurationSec}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <Text style={[typography.bodySmall, { color: color.textPrimary }]}>Rate:</Text>
              {([2, 5] as const).map((fps) => (
                <Pressable key={fps} onPress={() => setSensingFps(fps)}>
                  <Text style={[typography.bodySmall, { color: sensingFps === fps ? color.primary : color.textSecondary, fontWeight: sensingFps === fps ? '700' : '400' }]}>
                    {fps} FPS
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button label="Start New Sensing Session" onPress={startNewSensingSession} disabled={cameraStatus !== 'active' || sustainedRunning} />
          </>
        )}

        {sensingState && (
          <View style={{ gap: spacing.xs, backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.md }}>
            <Text style={[typography.bodySmall, { color: color.textPrimary, fontWeight: '700' }]}>Mode: {sensingState.mode}</Text>

            {sensingState.mode === 'BASELINE' && !sensingState.baselineWindow && (
              <Text style={[typography.caption, { color: color.textSecondary }]}>Collecting baseline ({baselineDurationSec}s)...</Text>
            )}

            {sensingState.baselineWindow && (
              <>
                <Text style={[typography.caption, { color: color.textSecondary }]}>
                  Baseline valid-face coverage: {(sensingState.baselineWindow.validFaceCoverage * 100).toFixed(0)}% (
                  {sensingState.baselineWindow.validFrameCount}/{sensingState.baselineWindow.totalFrameCount} frames) —{' '}
                  <Text style={{ color: sensingState.baselineVector ? color.success : color.warning, fontWeight: '700' }}>
                    {sensingState.baselineVector ? 'VALID' : 'INVALID — below 60% coverage'}
                  </Text>
                </Text>
                {sensingState.baselineVector && (
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    Baseline vector:{' '}
                    {EXPRESSION_KEYS.map((k) => `${k} ${sensingState.baselineVector![k].toFixed(2)}`).join(', ')}
                  </Text>
                )}
                {sensingState.mode === 'BASELINE' && !sensingState.baselineVector && (
                  <Button label="Retry Baseline" variant="secondary" onPress={retrySensingBaseline} />
                )}
                {sensingState.mode === 'BASELINE' && sensingState.baselineVector && (
                  <Button label="Begin Active Sensing" onPress={beginActiveSensing} />
                )}
              </>
            )}

            {(sensingState.mode === 'ACTIVE' || sensingState.mode === 'PAUSED') && (
              <>
                <Text style={[typography.caption, { color: color.textSecondary }]}>
                  Active-window valid-face coverage:{' '}
                  {sensingState.activeWindow ? `${(sensingState.activeWindow.validFaceCoverage * 100).toFixed(0)}%` : 'n/a'} —{' '}
                  <Text style={{ color: sensingState.activeWindow?.reliable ? color.success : color.warning, fontWeight: '700' }}>
                    {sensingState.activeWindow ? (sensingState.activeWindow.reliable ? 'RELIABLE' : 'UNRELIABLE') : 'collecting...'}
                  </Text>
                </Text>
                {sensingState.activeWindow?.meanProbabilities && (
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    Current smoothed vector:{' '}
                    {EXPRESSION_KEYS.map((k) => `${k} ${sensingState.activeWindow!.meanProbabilities![k].toFixed(2)}`).join(', ')}
                  </Text>
                )}
                <Text style={[typography.bodySmall, { color: color.textPrimary }]}>
                  State-distance score: <Text style={{ fontWeight: '700' }}>{sensingState.distanceScore !== null ? sensingState.distanceScore.toFixed(3) : 'n/a'}</Text>
                  {' '}(threshold {distanceThreshold.toFixed(2)})
                </Text>
                <Text style={[typography.caption, { color: color.textSecondary }]}>
                  Threshold exceeded for:{' '}
                  {sensingState.trigger.thresholdExceededSinceTs !== null
                    ? `${((performance.now() - sensingState.trigger.thresholdExceededSinceTs) / 1000).toFixed(1)}s (needs ${persistenceDurationSec}s)`
                    : 'not currently exceeded'}
                </Text>
                <Text style={[typography.bodySmall, { color: sensingState.trigger.triggerCandidate ? color.warning : color.textSecondary, fontWeight: '700' }]}>
                  Trigger candidate: {sensingState.trigger.triggerCandidate ? 'TRUE' : 'FALSE'}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                  {sensingState.mode === 'ACTIVE' && <Button label="Pause" variant="secondary" onPress={pauseSensingSession} />}
                  {sensingState.mode === 'PAUSED' && <Button label="Resume" onPress={resumeSensingSession} />}
                  <Button label="Stop Session" variant="secondary" onPress={stopSensingSession} />
                </View>
              </>
            )}

            {sensingState.mode === 'COMPLETED' && (
              <>
                <Text style={[typography.caption, { color: color.textSecondary }]}>
                  Session ended. Final trigger candidate: <Text style={{ fontWeight: '700' }}>{sensingState.trigger.triggerCandidate ? 'TRUE' : 'FALSE'}</Text>
                </Text>
                <Button label="Start New Sensing Session" onPress={() => setSensingState(null)} />
              </>
            )}

            {sensingState.mode === 'ERROR' && (
              <>
                <Text style={[typography.bodySmall, { color: color.warning }]}>{sensingState.error}</Text>
                <Button label="Start New Sensing Session" onPress={() => setSensingState(null)} />
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function ConfigStepper({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const { color, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Text style={[typography.bodySmall, { color: color.textPrimary, flex: 1 }]}>{label}</Text>
      <Pressable onPress={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}>
        <Text style={[typography.bodySmall, { color: color.primary, paddingHorizontal: spacing.sm }]}>−</Text>
      </Pressable>
      <Text style={[typography.bodySmall, { color: color.textPrimary, minWidth: 40, textAlign: 'center' }]}>
        {value}
        {unit}
      </Text>
      <Pressable onPress={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}>
        <Text style={[typography.bodySmall, { color: color.primary, paddingHorizontal: spacing.sm }]}>+</Text>
      </Pressable>
    </View>
  );
}
