import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStorage = new Map<string, string>();
let hasWarnedAboutStorageFallback = false;

function warnAboutStorageFallback(error: unknown) {
  if (hasWarnedAboutStorageFallback) {
    return;
  }

  hasWarnedAboutStorageFallback = true;

  if (__DEV__) {
    console.info('AsyncStorage unavailable. Using fallback storage.', error);
  }
}

async function getFallbackItem(key: string) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }

  return memoryStorage.get(key) ?? null;
}

async function setFallbackItem(key: string, value: string) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
    return;
  }

  memoryStorage.set(key, value);
}

async function removeFallbackItem(key: string) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
    return;
  }

  memoryStorage.delete(key);
}

async function safeGetItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    warnAboutStorageFallback(error);
    return getFallbackItem(key);
  }
}

async function safeSetItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    warnAboutStorageFallback(error);
    await setFallbackItem(key, value);
  }
}

async function safeRemoveItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    warnAboutStorageFallback(error);
    await removeFallbackItem(key);
  }
}

export async function getJsonItem<T>(key: string, fallbackValue: T): Promise<T> {
  const raw = await safeGetItem(key);

  if (!raw) {
    return fallbackValue;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallbackValue;
  }
}

export async function setJsonItem<T>(key: string, value: T) {
  await safeSetItem(key, JSON.stringify(value));
}

export async function getStringItem(key: string) {
  return safeGetItem(key);
}

export async function setStringItem(key: string, value: string) {
  await safeSetItem(key, value);
}

export async function removeItem(key: string) {
  await safeRemoveItem(key);
}
