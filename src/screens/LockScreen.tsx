import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad } from '@/src/components/PinPad';
import { SemiBrandHeader } from '@/src/components/SemiBrandHeader';
import { useAppState } from '@/src/hooks/useAppState';

const PIN_LENGTH = 6;

export function LockScreen() {
  const { unlockWithPin } = useAppState();
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('Breaking the one-day millionaire cycle.');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glow} />
        <SemiBrandHeader centered title="Unlock Semi" subtitle={message} />
        <View style={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PinPad
            pinLength={PIN_LENGTH}
            filledCount={pin.length}
            onDigitPress={(digit) => {
              setError(null);
              setPin((current) => `${current}${digit}`.slice(0, PIN_LENGTH));
            }}
            onDeletePress={() => {
              setError(null);
              setPin((current) => current.slice(0, -1));
            }}
            onBiometricPress={() => setMessage('Biometric unlock is not enabled in this build.')}
          />
          <Text style={styles.caption}>Biometric Encrypted</Text>
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
