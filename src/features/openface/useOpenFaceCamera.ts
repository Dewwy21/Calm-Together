import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// The one shared camera-management implementation for OpenFace features —
// extracted from OpenFaceTestPanel.tsx (Stage 4) so the Stage 6 Acceptance
// lesson integration reuses this instead of a second, parallel camera
// pipeline, per Stage 6's explicit "do not create a second independent
// camera pipeline" instruction. Behavior is unchanged from the original
// panel implementation — same imperative-DOM pattern as
// courses/YouTubeEmbed.web.tsx (a plain <div> gives the ref, the actual
// <video> element is created with document.createElement and attached
// outside React's own tree).
//
// The returned `containerRef` is optional for the caller to actually
// render: if the consumer renders `<div ref={containerRef} />`, the video
// element is appended there as a visible preview (OpenFaceTestPanel's use
// case). If the consumer never renders that div, `containerRef.current`
// stays null, appendChild is simply skipped, and the <video> element still
// works perfectly well as an off-screen capture source (plays, and is a
// valid canvas.drawImage source) without ever appearing in the page — the
// Acceptance lesson's "visible sensing indicator, not a live self-view"
// requirement, achieved by this hook unchanged, not a special mode.

export type CameraStatus = 'idle' | 'starting' | 'active' | 'error';

const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;

export const isWebCameraSupported =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function';

export interface UseOpenFaceCameraOptions {
  /** Applied to the offscreen/preview <video> element's style.borderRadius, e.g. `${radii.lg}px`. Optional — omit for a hidden-camera use case where no visible preview is ever rendered. */
  videoBorderRadiusPx?: string;
}

export function useOpenFaceCamera(options: UseOpenFaceCameraOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraStatus, setCameraStatusState] = useState<CameraStatus>('idle');
  const cameraStatusRef = useRef<CameraStatus>('idle'); // mirrors cameraStatus for interval/callback closures that need the live value, not one captured at scheduling time
  const [cameraError, setCameraError] = useState<string | null>(null);

  function setCameraStatus(status: CameraStatus) {
    cameraStatusRef.current = status;
    setCameraStatusState(status);
  }

  function stopAllTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoElRef.current) videoElRef.current.srcObject = null;
  }

  async function startCamera() {
    if (!isWebCameraSupported) {
      setCameraStatus('error');
      setCameraError('Camera access is not supported in this environment (Expo Web/Chrome only for this stage).');
      return;
    }
    setCameraStatus('starting');
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
        if (options.videoBorderRadiusPx) video.style.borderRadius = options.videoBorderRadiusPx;
        videoElRef.current = video;
        containerRef.current?.appendChild(video);
      }
      if (!canvasElRef.current) canvasElRef.current = document.createElement('canvas');
      videoElRef.current.srcObject = stream;
      await videoElRef.current.play();
      setCameraStatus('active');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : 'Unknown';
      const message =
        name === 'NotAllowedError'
          ? 'Camera permission was denied.'
          : name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : `Could not access the camera (${name}).`;
      setCameraStatus('error');
      setCameraError(message);
      stopAllTracks();
    }
  }

  function stopCamera() {
    stopAllTracks();
    setCameraStatus('idle');
  }

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

  // Release camera resources on unmount, regardless of how the screen was left.
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    containerRef,
    cameraStatus,
    cameraStatusRef,
    cameraError,
    startCamera,
    stopCamera,
    stopAllTracks,
    captureBlobFromVideo,
  };
}
