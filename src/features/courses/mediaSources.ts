// Resolves a MediaCard's `sourceUrl` into something playable/linkable.
// YouTube videos embed inline via YouTubeEmbed.web.tsx/.native.tsx (which
// also reports when playback ends); a non-YouTube video URL falls back to
// opening externally via Linking, since there's no generic embeddable
// player for an arbitrary file link. Audio plays inline because expo-audio's
// useAudioPlayer already accepts a remote URL directly (see
// useLessonMediaAudio.ts).

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
];

/** Extracts an 11-character YouTube video ID from a full URL, or returns the input if it already looks like a bare ID. */
export function extractYouTubeId(source: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = source.match(pattern);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(source.trim()) ? source.trim() : null;
}

export function isYouTubeSource(source: string): boolean {
  return extractYouTubeId(source) !== null;
}

/** A watch:// or direct-file link, whichever applies — always what Linking.openURL should be given. */
export function resolveVideoWatchUrl(sourceUrl: string): string {
  const youTubeId = extractYouTubeId(sourceUrl);
  return youTubeId ? `https://www.youtube.com/watch?v=${youTubeId}` : sourceUrl;
}

/** A thumbnail to show before the caregiver taps through, when the source is a recognizable YouTube video. Direct file URLs (non-YouTube) have no automatic thumbnail — the card just shows its title/caption instead. */
export function resolveVideoThumbnailUrl(sourceUrl: string): string | null {
  const youTubeId = extractYouTubeId(sourceUrl);
  return youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null;
}
