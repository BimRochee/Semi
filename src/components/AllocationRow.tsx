import { Pressable, StyleSheet, Text, View } from 'react-native';

type AllocationRowProps = {
  label: string;
  amount: string;
  walletName: string;
  actionLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
};

export function AllocationRow({
  label,
  amount,
  walletName,
  actionLabel,
  disabled = false,
  onPress,
}: AllocationRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.walletName}>{walletName}</Text>
      </View>
      <View style={styles.actions}>
        <Text style={styles.amount}>{amount}</Text>
        {actionLabel && onPress ? (
          <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              disabled && styles.buttonDisabled,
              pressed && !disabled && styles.buttonPressed,
            ]}>
            <Text style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  walletName: {
    color: '#5B6464',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    color: '#003535',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#0D4D4D',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    backgroundColor: '#E4EBEB',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  buttonLabelDisabled: {
    color: '#7D8787',
  },
});
