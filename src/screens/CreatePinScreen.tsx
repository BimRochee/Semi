import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad } from '@/src/components/PinPad';
import { SemiBrandHeader } from '@/src/components/SemiBrandHeader';
import { useAppState } from '@/src/hooks/useAppState';

const PIN_LENGTH = 6;

export function CreatePinScreen() {
  const { savePin } = useAppState();
  const [draftPin, setDraftPin] = useState('');
  const [confirmedPin, setConfirmedPin] = useState('');
  const [message, setMessage] = useState('Create a 6-digit PIN for offline access.');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draftPin.length !== PIN_LENGTH) {
      return;
    }

    setMessage('Confirm the same 6-digit PIN.');
  }, [draftPin]);

  useEffect(() => {
    if (draftPin.length !== PIN_LENGTH || confirmedPin.length !== PIN_LENGTH) {
      return;
    }

    if (draftPin !== confirmedPin) {
      setError('PIN mismatch. Start again.');
      setDraftPin('');
      setConfirmedPin('');
      setMessage('Create a 6-digit PIN for offline access.');
      return;
    }

    savePin(confirmedPin);
  }, [confirmedPin, draftPin, savePin]);

  const activePin = draftPin.length < PIN_LENGTH ? draftPin : confirmedPin;

  const handleDigitPress = (digit: string) => {
    setError(null);

    if (draftPin.length < PIN_LENGTH) {
      setDraftPin((current) => `${current}${digit}`.slice(0, PIN_LENGTH));
      return;
    }

    setConfirmedPin((current) => `${current}${digit}`.slice(0, PIN_LENGTH));
  };

  const handleDelete = () => {
    setError(null);

    if (confirmedPin.length > 0) {
      setConfirmedPin((current) => current.slice(0, -1));
      return;
    }

    if (draftPin.length === PIN_LENGTH) {
      setMessage('Create a 6-digit PIN for offline access.');
      setDraftPin((current) => current.slice(0, -1));
      return;
    }

    setDraftPin((current) => current.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glow} />
        <SemiBrandHeader
          centered
          title="Secure Your Ledger"
          subtitle="Set a local PIN before you start recording salary and wallet movements."
        />
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PinPad
            pinLength={PIN_LENGTH}
            filledCount={activePin.length}
            onDigitPress={handleDigitPress}
            onDeletePress={handleDelete}
          />
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
    backgroundColor: '#D5E6E0',
    opacity: 0.55,
    top: '30%',
    left: '50%',
    marginLeft: -160,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    textAlign: 'center',
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  error: {
    textAlign: 'center',
    color: '#BA1A1A',
    fontSize: 14,
    lineHeight: 20,
  },
});
