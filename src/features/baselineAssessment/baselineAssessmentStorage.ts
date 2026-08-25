import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaselineAssessmentRecord } from './types';

const STORAGE_KEY = 'otter-companion/baseline-assessments';

export async function loadBaselineAssessments(childId: string): Promise<BaselineAssessmentRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as BaselineAssessmentRecord[];
  } catch {
    return [];
  }
}

export async function persistBaselineAssessments(childId: string, records: BaselineAssessmentRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(records));
  } catch {
    // best-effort local persistence only
  }
}
