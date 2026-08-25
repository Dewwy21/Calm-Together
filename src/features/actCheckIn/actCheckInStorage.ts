import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActSessionRecord } from './types';

// Scoped per child, same as Help Bot and Weekly Check-In history — this is
// the "conversation history" the ACT Check-In keeps for itself, alongside
// the summary it also leaves in the Family Blueprint.
const STORAGE_KEY = 'otter-companion/act-check-in-sessions';

export async function loadActCheckInSessions(childId: string): Promise<ActSessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as ActSessionRecord[];
  } catch {
    return [];
  }
}

export async function persistActCheckInSessions(childId: string, sessions: ActSessionRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(sessions));
  } catch {
    // best-effort local persistence only
  }
}
