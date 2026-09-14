import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimulatorSessionRecord } from './types';

// Scoped per child, same as ACT Check-In and Help Bot history — previously
// a completed Simulator session (the full transcript + coaching) existed
// only in that screen's component state and vanished on navigating away;
// only a compressed summary survived, in the Family Blueprint.
const STORAGE_KEY = 'otter-companion/simulator-sessions';

export async function loadSimulatorSessions(childId: string): Promise<SimulatorSessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as SimulatorSessionRecord[];
  } catch {
    return [];
  }
}

export async function persistSimulatorSessions(childId: string, sessions: SimulatorSessionRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(sessions));
  } catch {
    // best-effort local persistence only
  }
}
