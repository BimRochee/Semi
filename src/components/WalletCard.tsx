import { StyleSheet, Text, View } from 'react-native';

type WalletCardProps = {
  name: string;
  type: string;
  startingBalance: string;
  currentBalance: string;
};

export function WalletCard({
  name,
  type,
  startingBalance,
  currentBalance,
}: WalletCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.type}>{type}</Text>
        </View>
        <Text style={styles.balance}>{currentBalance}</Text>
      </View>
      <Text style={styles.meta}>Starting balance: {startingBalance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  name: {
    color: '#0D1C2F',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  type: {
    color: '#5B6464',
    fontSize: 13,
    lineHeight: 18,
  },
  balance: {
    color: '#003535',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  meta: {
    color: '#707978',
    fontSize: 13,
    lineHeight: 18,
  },
});
