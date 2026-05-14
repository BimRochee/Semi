import { deleteSecureValue, getSecureValue, setSecureValue } from '@/src/storage/keychainClient';

const SEMI_PIN_KEY = 'pin';

export async function getStoredPin() {
  return getSecureValue(SEMI_PIN_KEY);
}

export async function hasStoredPin() {
  const pin = await getStoredPin();
  return Boolean(pin);
}

export async function savePin(pin: string) {
  await setSecureValue(SEMI_PIN_KEY, pin);
}

export async function clearStoredPin() {
  await deleteSecureValue(SEMI_PIN_KEY);
}

export async function verifyPin(candidatePin: string) {
  const pin = await getStoredPin();
  return pin === candidatePin;
}
