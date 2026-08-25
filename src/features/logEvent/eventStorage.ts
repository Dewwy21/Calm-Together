import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoggedEvent } from './types';

// No backend yet — everything lives in AsyncStorage on-device. This is the
// one seam a future sync/backend integration would replace.
const STORAGE_KEY = 'otter-companion/logged-events';

export async function loadEvents(childId: string): Promise<LoggedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as LoggedEvent[];
  } catch {
    return [];
  }
}

export async function persistEvents(childId: string, events: LoggedEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(events));
  } catch {
    // best-effort local persistence — nothing to surface to the user for a
    // local-only cache write failure
  }
}

// Generic id generator — used for events, and reused for reflection
// message ids too (see reflection/reflectionSuggestions.ts).
export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
