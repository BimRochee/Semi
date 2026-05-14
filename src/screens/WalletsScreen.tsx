import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WalletCard } from '@/src/components/WalletCard';
import { useWallets } from '@/src/hooks/useWallets';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function WalletsScreen() {
  const { walletSummaries } = useWallets();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.copy}>
        Wallet balances are derived from the ledger. The wallet record stores only starting balance and identity.
      </Text>
      <View style={styles.stack}>
        {walletSummaries.map((wallet) => (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            type={wallet.type}
            startingBalance={formatCurrency(wallet.startingBalance)}
            currentBalance={formatCurrency(wallet.currentBalance)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  copy: {
    color: '#5B6464',
    fontSize: 14,
    lineHeight: 22,
  },
  stack: {
    gap: 12,
  },
});
