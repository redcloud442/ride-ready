import { odometerFromText, readReceiptText, type DocumentExtraction } from '@ride-ready/core';
import { requireOptionalNativeModule } from 'expo';
import { Directory, File, Paths } from 'expo-file-system';

/** False in Expo Go: the text-reading native module only exists in the development/production build. */
export const canReadText = () => requireOptionalNativeModule('ExpoTextExtractor') != null;

// On-device text reading: Apple Vision on iOS, ML Kit on Android. Images never leave the phone for this.
// Checked, then loaded lazily: importing it where the native module is missing throws (and logs an error).
async function imageText(uri: string) {
  if (!canReadText()) throw new Error('Reading receipts needs the RideReady development build, not Expo Go.');
  const ocr = await import('expo-text-extractor');
  if (!ocr.isSupported) throw new Error("This phone can't read text from photos.");
  return ocr.extractTextFromImage(uri);
}

/** Reads a local image (file:// or content://) into a draft for the user to confirm. */
export async function readReceiptImage(uri: string): Promise<Omit<DocumentExtraction, 'documentId'>> {
  return readReceiptText(await imageText(uri));
}

/** The odometer on a local dashboard photo, or null. The photo is only read, never uploaded. */
export async function readOdometerImage(uri: string) {
  return odometerFromText((await imageText(uri)).join('\n'));
}

/** Same, for a stored document: downloads it from its short-lived URL to the cache, reads it, deletes it. */
export async function readRemoteImage(url: string) {
  const dir = new Directory(Paths.cache, 'ocr');
  dir.create({ idempotent: true });
  const file = await File.downloadFileAsync(url, dir, { idempotent: true });
  try {
    return await readReceiptImage(file.uri);
  } finally {
    file.delete();
  }
}
