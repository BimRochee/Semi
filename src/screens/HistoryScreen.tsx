import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatShortDate } from '@/src/utils/dateUtils';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function HistoryScreen() {
  const { state } = useAppState();
  const movements = [...state.moneyMovements].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt)
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {movements.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No movement history yet</Text>
          <Text style={styles.emptyText}>
            Income, expenses, transfers, and allocations will appear here once they hit the ledger.
          </Text>
        </View>
      ) : (
        movements.map((movement) => {
          const isPositive = movement.type === 'income' || Boolean(movement.toWalletId && !movement.fromWalletId);

          return (
            <View key={movement.id} style={styles.row}>
              <View style={styles.left}>
                <View style={[styles.iconWrap, isPositive ? styles.iconPositive : styles.iconNeutral]}>
                  <MaterialIcons
                    color={isPositive ? '#456646' : '#404848'}
                    name={isPositive ? 'trending-up' : 'history'}
                    size={20}
                  />
                </View>
                <View>
                  <Text style={styles.title}>{movement.note ?? movement.type}</Text>
                  <Text style={styles.meta}>{formatShortDate(movement.occurredAt)}</Text>
                </View>
              </View>
              <Text style={[styles.amount, isPositive && styles.amountPositive]}>
                {isPositive ? '+' : '-'}
                {formatCurrency(movement.amount)}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 132,
    gap: 12,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPositive: {
    backgroundColor: '#C6EDC4',
  },
  iconNeutral: {
    backgroundColor: '#E6EEFF',
  },
  title: {
    color: '#0D1C2F',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  meta: {
    color: '#707978',
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    color: '#0D1C2F',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  amountPositive: {
    color: '#456646',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 18,
    gap: 8,
  },
  emptyTitle: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  emptyText: {
    color: '#404848',
    fontSize: 14,
    lineHeight: 20,
  },
});
