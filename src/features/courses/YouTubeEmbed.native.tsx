import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

// Native (iOS/Android) implementation — same YouTube IFrame Player API as
// YouTubeEmbed.web.tsx, just hosted inside a WebView instead of a real DOM
// node, relaying "ready"/"ended"/"error" back to React Native via
// postMessage since a WebView has no direct callback channel of its own.
// Playback can fail for reasons outside this code (rate limiting, a
// network blip) — onError shows a plain retry button (remounting the
// WebView via `key`) instead of leaving YouTube's own opaque, dead-end
// error screen in place. A spinner covers the gap before the player
// reports ready, and a timeout treats "never became ready" the same as an
// explicit error so it can't hang forever with no way out.

interface YouTubeEmbedProps {
  videoId: string;
  onEnded?: () => void;
}

const READY_TIMEOUT_MS = 15000;

function buildHtml(videoId: string): string {
  return `<!DOCTYPE html>
<html style="height:100%;">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { height: 100%; margin: 0; background: #000; }
  #player, #player iframe { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="player"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      width: '100%',
      height: '100%',
      videoId: '${videoId}',
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onReady: function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
        },
        onStateChange: function (event) {
          if (event.data === YT.PlayerState.ENDED) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ended' }));
          }
        },
        onError: function (event) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', code: event.data }));
        },
      },
    });
  }
</script>
</body>
</html>`;
}

export function YouTubeEmbed({ videoId, onEnded }: YouTubeEmbedProps) {
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReady(false);
    setErrored(false);
    timeoutRef.current = setTimeout(() => setErrored(true), READY_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [videoId, attempt]);

  function retry() {
    setErrored(false);
    setAttempt((a) => a + 1);
  }

  if (errored) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>This video couldn't load right now.</Text>
        <Pressable onPress={retry} style={{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 }}>
          <Text style={{ color: '#1a1a1a', fontWeight: '600' }}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        key={attempt}
        originWhitelist={['*']}
        source={{ html: buildHtml(videoId) }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'ready') {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setReady(true);
            }
            if (message.type === 'ended') onEnded?.();
            if (message.type === 'error') {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              // eslint-disable-next-line no-console
              console.warn(`YouTube player error (code ${message.code}) for video ${videoId}`);
              setErrored(true);
            }
          } catch {
            // ignore malformed messages
          }
        }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
      {!ready && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}
