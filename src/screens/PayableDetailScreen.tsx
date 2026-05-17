import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatCurrency } from '@/src/utils/formatCurrency';

type PayableDetailScreenProps = {
  payableId: string;
  onPayInstallment: (installmentId: string) => void;
  onBack: () => void;
};

export function PayableDetailScreen({
  payableId,
  onPayInstallment,
  onBack,
}: PayableDetailScreenProps) {
  const { state } = useAppState();

  const payable = state.payables.find((p) => p.id === payableId);
  const installments = useMemo(() => {
    return state.installments
      .filter((i) => i.payableId === payableId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [state.installments, payableId]);

  if (!payable) {
    return (
      <View style={styles.center}>
        <Text>Payable not found.</Text>
      </View>
    );
  }

  const remainingAmount = installments
    .filter((i) => i.status === 'unpaid')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color="#003535" />
          </Pressable>
          <Text style={styles.name}>{payable.name}</Text>
          <Text style={styles.totalLabel}>TOTAL OUTSTANDING</Text>
          <Text style={styles.totalValue}>{formatCurrency(remainingAmount)}</Text>
        </View>

        <View style={styles.installmentList}>
          <Text style={styles.sectionTitle}>Installment Schedule</Text>
          {installments.map((item, index) => {
            const isPaid = item.status === 'paid';
            return (
              <View key={item.id} style={[styles.itemCard, isPaid && styles.itemCardPaid]}>
                <View style={styles.itemLead}>
                  <View style={[styles.numberBox, isPaid && styles.numberBoxPaid]}>
                    <Text style={[styles.numberText, isPaid && styles.numberTextPaid]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.itemDate}>
                      {new Date(item.dueDate).toLocaleDateString('en-PH', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                  </View>
                </View>

                {isPaid ? (
                  <View style={styles.paidBadge}>
                    <MaterialIcons name="check-circle" size={16} color="#456646" />
                    <Text style={styles.paidText}>Paid</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onPayInstallment(item.id)}
                    style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
                  >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: '#F0F4F4',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 16,
    marginLeft: 4,
  },
  installmentList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  itemCardPaid: {
    backgroundColor: '#F0F4F4',
    borderColor: '#D0D8D8',
    opacity: 0.8,
  },
  itemLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBoxPaid: {
    backgroundColor: '#C6EDC4',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003535',
  },
  numberTextPaid: {
    color: '#456646',
  },
  itemDate: {
    fontSize: 13,
    color: '#707978',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  payButton: {
    backgroundColor: '#003535',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payButtonPressed: {
    opacity: 0.8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C6EDC4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#456646',
  },
});
