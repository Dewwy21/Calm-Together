// Deterministic-but-varied selection: the same seed always picks the same
// item, but different seeds land on different items. Used so the same log
// always renders the same reflection/suggestion if regenerated, while
// different logs get real variety instead of always picking item 0.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function seededPick<T>(pool: T[], seed: string): T {
  return pool[hashString(seed) % pool.length];
}

// A Fisher-Yates shuffle driven by the same seeded PRNG idea as
// seededPick — the same seed always produces the same shuffled order (so a
// sequencing activity's item order doesn't reshuffle on every re-render),
// while different seeds (e.g. different card ids) produce different orders.
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = hashString(seed) || 1;
  function next() {
    // xorshift32 — fast, deterministic, good enough spread for shuffling a
    // short list, no external dependency needed.
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return Math.abs(state);
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
