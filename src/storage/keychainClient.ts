import * as SecureStore from 'expo-secure-store';

import { getStringItem, removeItem, setStringItem } from '@/src/storage/asyncStorageClient';

const FALLBACK_PREFIX = '@semi/secure/';

async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getSecureValue(key: string) {
  if (await isSecureStoreAvailable()) {
    return SecureStore.getItemAsync(key);
  }

  return getStringItem(`${FALLBACK_PREFIX}${key}`);
}

export async function setSecureValue(key: string, value: string) {
  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  await setStringItem(`${FALLBACK_PREFIX}${key}`, value);
}

export async function deleteSecureValue(key: string) {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  await removeItem(`${FALLBACK_PREFIX}${key}`);
}
