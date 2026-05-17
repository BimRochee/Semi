import * as LocalAuthentication from 'expo-local-authentication';

import { deleteSecureValue, getSecureValue, setSecureValue } from '@/src/storage/keychainClient';

const SEMI_PIN_KEY = 'pin';

export type BiometricStatus = {
  isAvailable: boolean;
  label: string;
  unavailableReason?: string;
};

export type BiometricUnlockResult =
  | { success: true }
  | { success: false; cancelled?: boolean; message: string };

function getBiometricLabel(types: LocalAuthentication.AuthenticationType[]) {
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face Unlock';
  }

  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }

  return 'Biometric';
}

function getBiometricErrorMessage(
  error: LocalAuthentication.LocalAuthenticationError,
  label: string
) {
  switch (error) {
    case 'authentication_failed':
      return `${label} did not match. Try again or use your PIN.`;
    case 'lockout':
      return `${label} is temporarily locked. Use your PIN to continue.`;
    case 'not_available':
    case 'passcode_not_set':
      return `${label} unlock is unavailable on this device right now.`;
    case 'not_enrolled':
      return `No ${label.toLowerCase()} profile is enrolled on this device.`;
    case 'timeout':
      return `${label} took too long. Try again or use your PIN.`;
    case 'unable_to_process':
      return `${label} could not be processed. Try again or use your PIN.`;
    case 'user_fallback':
      return 'Use your PIN to unlock Semi.';
    case 'user_cancel':
    case 'app_cancel':
    case 'system_cancel':
      return 'Use your PIN to unlock Semi.';
    default:
      return `${label} unlock failed. Use your PIN to continue.`;
  }
}

export async function getBiometricStatus(): Promise<BiometricStatus> {
  try {
    const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const label = getBiometricLabel(supportedTypes);

    if (!hasHardware) {
      return {
        isAvailable: false,
        label,
        unavailableReason: 'This device does not support biometric unlock.',
      };
    }

    if (!isEnrolled) {
      return {
        isAvailable: false,
        label,
        unavailableReason: `No ${label.toLowerCase()} profile is enrolled on this device.`,
      };
    }

    return { isAvailable: true, label };
  } catch {
    return {
      isAvailable: false,
      label: 'Biometric',
      unavailableReason: 'Biometric unlock is unavailable on this device right now.',
    };
  }
}

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

export async function authenticateWithBiometrics(): Promise<BiometricUnlockResult> {
  const biometricStatus = await getBiometricStatus();

  if (!biometricStatus.isAvailable) {
    return {
      success: false,
      message:
        biometricStatus.unavailableReason ?? 'Biometric unlock is unavailable on this device.',
    };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Semi',
      promptSubtitle: 'Use your device biometrics to open your offline ledger.',
      promptDescription: 'If biometric unlock fails, you can continue with your PIN.',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
      fallbackLabel: '',
      biometricsSecurityLevel: 'strong',
    });

    if (result.success) {
      return { success: true };
    }

    const cancelled =
      result.error === 'user_cancel' ||
      result.error === 'app_cancel' ||
      result.error === 'system_cancel' ||
      result.error === 'user_fallback';

    return {
      success: false,
      cancelled,
      message: getBiometricErrorMessage(result.error, biometricStatus.label),
    };
  } catch {
    return {
      success: false,
      message: `${biometricStatus.label} unlock is unavailable on this device right now.`,
    };
  }
}
