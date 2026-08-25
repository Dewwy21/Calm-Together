import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyBlueprint } from './types';

// Scoped per child, same as Daily Log and Help Bot history — a family with
// multiple children profiles gets a separate living memory for each.
const STORAGE_KEY = 'otter-companion/family-blueprint';

export async function loadBlueprint(childId: string): Promise<FamilyBlueprint | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return null;
    return JSON.parse(raw) as FamilyBlueprint;
  } catch {
    return null;
  }
}

export async function persistBlueprint(childId: string, blueprint: FamilyBlueprint): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(blueprint));
  } catch {
    // best-effort local persistence only
  }
}
