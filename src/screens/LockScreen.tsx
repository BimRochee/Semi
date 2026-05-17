import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad } from '@/src/components/PinPad';
import { SemiBrandHeader } from '@/src/components/SemiBrandHeader';
import { useAppState } from '@/src/hooks/useAppState';

const PIN_LENGTH = 6;
const DEFAULT_MESSAGE = 'Breaking the one-day millionaire cycle.';

export function LockScreen() {
  const { biometricAvailable, biometricLabel, state, unlockWithBiometrics, unlockWithPin } =
    useAppState();
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedBiometricUnlock = useRef(false);
  const [isBiometricUnlocking, setIsBiometricUnlocking] = useState(false);
  const biometricEnabled = biometricAvailable && state.settings.biometricUnlockEnabled;
  const biometricMessage = biometricEnabled
    ? `Use ${biometricLabel} or enter your PIN.`
    : DEFAULT_MESSAGE;

  useEffect(() => {
    if (pin.length !== PIN_LENGTH) {
      return;
    }

    async function unlock() {
      const valid = await unlockWithPin(pin);

      if (valid) {
        return;
      }

      setError('Incorrect PIN.');
      setPin('');
    }

    unlock();
  }, [pin, unlockWithPin]);

  useEffect(() => {
    if (error) {
      return;
    }

    setMessage(biometricMessage);
  }, [biometricMessage, error]);

  useEffect(() => {
    if (!biometricEnabled || hasAttemptedBiometricUnlock.current) {
      return;
    }

    let active = true;

    async function tryBiometricUnlock() {
      hasAttemptedBiometricUnlock.current = true;
      setIsBiometricUnlocking(true);

      const result = await unlockWithBiometrics();

      if (!active) {
        return;
      }

      setIsBiometricUnlocking(false);

      if (result.success) {
        return;
      }

      if (result.cancelled) {
        setMessage('Use your PIN to continue.');
        return;
      }

      setError(result.message);
      setMessage(biometricMessage);
    }

    void tryBiometricUnlock();

    return () => {
      active = false;
    };
  }, [biometricEnabled, biometricMessage, unlockWithBiometrics]);

  const handleBiometricUnlock = async () => {
    if (!biometricEnabled || isBiometricUnlocking) {
      return;
    }

    setError(null);
    setMessage(`Confirm ${biometricLabel} to unlock.`);
    setIsBiometricUnlocking(true);

    const result = await unlockWithBiometrics();

    setIsBiometricUnlocking(false);

    if (result.success) {
      return;
    }

    if (result.cancelled) {
      setMessage('Use your PIN to continue.');
      return;
    }

    setError(result.message);
    setMessage(biometricMessage);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glow} />
        <SemiBrandHeader centered logoVariant="semi" showBrand={false} title="Unlock Semi" subtitle={message} />
        <View style={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PinPad
            pinLength={PIN_LENGTH}
            filledCount={pin.length}
            onDigitPress={(digit) => {
              setError(null);
              setMessage(biometricMessage);
              setPin((current) => `${current}${digit}`.slice(0, PIN_LENGTH));
            }}
            onDeletePress={() => {
              setError(null);
              setMessage(biometricMessage);
              setPin((current) => current.slice(0, -1));
            }}
            onBiometricPress={biometricEnabled ? handleBiometricUnlock : undefined}
          />
          <Text style={styles.caption}>
            {biometricEnabled ? `${biometricLabel} Ready` : 'PIN Required'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FF',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: '#C6EDC4',
    opacity: 0.55,
    top: '32%',
    left: '50%',
    marginLeft: -160,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  error: {
    color: '#BA1A1A',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    textAlign: 'center',
    color: '#5B6464',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});
