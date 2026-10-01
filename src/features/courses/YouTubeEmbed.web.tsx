import React, { useEffect, useRef, useState } from 'react';

// Web implementation: loads the real YouTube IFrame Player API (not a bare
// <iframe src="...">) specifically so we get the onStateChange event needed
// to detect playback finishing — see YouTubeEmbed.native.tsx for the
// WebView/postMessage equivalent used on iOS/Android, and MediaCardBody in
// LessonCardView.tsx for where `onEnded` feeds back into the lesson player.
//
// The IFrame API defaults to a fixed 640x390 player if you don't tell it
// otherwise — it does NOT stretch to fill a percentage-sized parent the way
// a plain <iframe> would, which is what was clipping/cutting off the video
// before this. So this measures its own container with a ResizeObserver
// and passes literal pixel dimensions at creation, then calls setSize as
// the container resizes.
//
// Critically: YT.Player doesn't render INTO the element you give it — it
// DELETES that element and replaces it with its own <iframe>. Handing it a
// node React itself rendered would mean React still believes that node
// exists in its own tree; the next time React tries to update or unmount
// it, it calls removeChild on a node YouTube already ripped out from under
// it, throwing "Failed to execute 'removeChild': the node to be removed is
// not a child of this node." So the div passed to YT.Player is created
// imperatively, entirely outside JSX/React's tree (`document
// .createElement`) — React only ever renders and tracks the empty outer
// `containerRef` div, and never has any expectations about what YouTube
// does inside it.
//
// Playback can fail for reasons entirely outside this code (a transient
// YouTube-side hiccup, a rate limit from reloading the same video a lot
// during development, a network/extension issue blocking part of what the
// player needs) — onError shows a plain retry button instead of leaving
// YouTube's own opaque, dead-end error screen in place. A loading state
// covers the gap between the card appearing and the player actually being
// ready (otherwise that gap is just an empty box, which reads as "nothing
// is happening"), and a timeout treats "never became ready" the same as an
// explicit error so it can't hang forever with no way out.

interface YouTubeEmbedProps {
  videoId: string;
  onEnded?: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (target: HTMLElement, options: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  destroy: () => void;
  setSize: (width: number, height: number) => void;
}

const READY_TIMEOUT_MS = 15000;

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

export function YouTubeEmbed({ videoId, onEnded }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastVideoIdRef = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [errorCode, setErrorCode] = useState<number | 'timeout' | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const container = containerRef.current;
    if (!container) return;

    if (playerRef.current && lastVideoIdRef.current === videoId) {
      playerRef.current.setSize(size.width, size.height);
      return;
    }

    let cancelled = false;
    setReady(false);
    setErrorCode(null);
    playerRef.current?.destroy();
    playerRef.current = null;
    container.innerHTML = ''; // clear out any previous player's leftover target/iframe

    const target = document.createElement('div');
    container.appendChild(target);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setErrorCode((prev) => (prev === null ? 'timeout' : prev));
    }, READY_TIMEOUT_MS);

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;
      lastVideoIdRef.current = videoId;
      playerRef.current = new window.YT.Player(target, {
        width: size.width,
        height: size.height,
        videoId,
        playerVars: { rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            window.clearTimeout(timeoutId);
            setReady(true);
          },
          onStateChange: (event: { data: number }) => {
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
          onError: (event: { data: number }) => {
            window.clearTimeout(timeoutId);
            // eslint-disable-next-line no-console
            console.warn(`YouTube player error (code ${event.data}) for video ${videoId}`);
            setErrorCode(event.data);
          },
        },
      });
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, videoId, retryToken]);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    },
    []
  );

  function retry() {
    playerRef.current?.destroy();
    playerRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = '';
    setReady(false);
    setErrorCode(null);
    setRetryToken((t) => t + 1);
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {errorCode === null && !ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.35)',
              borderTopColor: '#fff',
              animation: 'yt-embed-spin 0.8s linear infinite',
            }}
          />
          <style>{'@keyframes yt-embed-spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      )}
      {errorCode !== null && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: '#fff',
            textAlign: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.85)',
          }}
        >
          <span>This video couldn't load right now.</span>
          <button
            onClick={retry}
            style={{
              background: '#fff',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 999,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
