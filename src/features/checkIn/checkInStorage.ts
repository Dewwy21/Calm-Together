import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyCheckIn } from './types';

const STORAGE_KEY = 'otter-companion/weekly-check-ins';

export async function loadCheckIns(childId: string): Promise<WeeklyCheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as WeeklyCheckIn[];
  } catch {
    return [];
  }
}

export async function persistCheckIns(childId: string, checkIns: WeeklyCheckIn[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(checkIns));
  } catch {
    // best-effort local persistence only
  }
}
