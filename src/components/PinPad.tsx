import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

type PinPadProps = {
  pinLength: number;
  filledCount: number;
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  onBiometricPress?: () => void;
};

export function PinPad({
  pinLength,
  filledCount,
  onDigitPress,
  onDeletePress,
  onBiometricPress,
}: PinPadProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: pinLength }, (_, index) => (
          <View key={index} style={[styles.dot, index < filledCount && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {DIGITS.map((digit) => (
          <Pressable
            key={digit}
            onPress={() => onDigitPress(digit)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
            <Text style={styles.keyLabel}>{digit}</Text>
          </Pressable>
        ))}
        <Pressable
          disabled={!onBiometricPress}
          onPress={onBiometricPress}
          style={({ pressed }) => [
            styles.key,
            styles.actionKey,
            !onBiometricPress && styles.keyDisabled,
            pressed && onBiometricPress && styles.keyPressed,
          ]}>
          <MaterialIcons name="fingerprint" size={28} color="#404848" />
        </Pressable>
        <Pressable onPress={() => onDigitPress('0')} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
          <Text style={styles.keyLabel}>0</Text>
        </Pressable>
        <Pressable onPress={onDeletePress} style={({ pressed }) => [styles.key, styles.actionKey, pressed && styles.keyPressed]}>
          <MaterialIcons name="backspace" size={26} color="#404848" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#707978',
  },
  dotFilled: {
    backgroundColor: '#456646',
    borderColor: '#456646',
  },
  keypad: {
    maxWidth: 320,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  key: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  actionKey: {
    borderWidth: 1,
    borderColor: '#D8E2E2',
  },
  keyPressed: {
    backgroundColor: '#C6EDC4',
    transform: [{ scale: 0.96 }],
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyLabel: {
    color: '#003535',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '500',
  },
});
