import * as ImagePicker from 'expo-image-picker';

// Shared by the Account screen and Kid Profile form so both pick a photo
// the same way. Returns a local file URI, or null if permission was denied
// or the caregiver canceled.
export async function pickAvatarPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
