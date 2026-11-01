import { DOCUMENT_MAX_BYTES, DOCUMENT_MIME_TYPES, type DocumentMimeType } from '@ride-ready/core';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import type { LocalFile } from '@/api/documents.api';
import { useToastStore } from '@/stores/toast.store';

export type PickedFile = LocalFile & { name: string };

const allowed = (m: string | null | undefined): m is DocumentMimeType => DOCUMENT_MIME_TYPES.includes(m as DocumentMimeType);

// Camera / photo library / PDF → a file the API accepts, or a toast explaining why not.
export function usePickFile() {
  const show = useToastStore((s) => s.show);

  const accept = (file: Omit<PickedFile, 'mimeType'> & { mimeType?: string | null }): PickedFile | null => {
    if (!allowed(file.mimeType)) {
      show('Use a JPEG, PNG, HEIC or WebP photo, or a PDF.');
      return null;
    }
    if (file.sizeBytes > DOCUMENT_MAX_BYTES) {
      show('That file is over 20 MB. Choose a smaller one.');
      return null;
    }
    return { ...file, mimeType: file.mimeType };
  };

  async function fromImage(source: 'camera' | 'library'): Promise<PickedFile | null> {
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      show(source === 'camera' ? 'Allow camera access in Settings to take photos.' : 'Allow photo access in Settings.');
      if (!permission.canAskAgain) Linking.openSettings();
      return null;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 }; // smaller uploads, still legible
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return null;
    return accept({
      uri: asset.uri,
      name: asset.fileName ?? 'Photo',
      mimeType: asset.mimeType ?? 'image/jpeg',
      sizeBytes: asset.fileSize ?? (await (await fetch(asset.uri)).blob()).size,
    });
  }

  async function fromFiles(): Promise<PickedFile | null> {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return null;
    return accept({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, sizeBytes: asset.size ?? 0 });
  }

  return { fromImage, fromFiles };
}
