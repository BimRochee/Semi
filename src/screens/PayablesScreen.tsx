import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { Payable, Installment } from '@/src/domain/types';

type SortOption = 'nextDue' | 'highestDebt' | 'name';

type PayablesScreenProps = {
  onOpenPayable: (payableId: string) => void;
  onAddPayable: () => void;
};

export function PayablesScreen({ onOpenPayable, onAddPayable }: PayablesScreenProps) {
  const { state, deletePayable } = useAppState();
  const [sortBy, setSortBy] = useState<SortOption>('nextDue');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const { activePayables, settledPayables } = useMemo(() => {
    const allWithStats = state.payables.map((payable) => {
      const installments = state.installments.filter((i) => i.payableId === payable.id);
      const unpaid = installments.filter((i) => i.status === 'unpaid');
      const remainingAmount = unpaid.reduce((sum, i) => sum + i.amount, 0);
      const nextDue = unpaid.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

      return {
        ...payable,
        remainingAmount,
        nextDue,
        totalInstallments: installments.length,
        paidInstallments: installments.filter((i) => i.status === 'paid').length,
        isFullyPaid: installments.length > 0 && unpaid.length === 0,
      };
    });

    const active = allWithStats.filter(p => !p.isFullyPaid).sort((a, b) => {
      if (sortBy === 'nextDue') {
        if (!a.nextDue) return 1;
        if (!b.nextDue) return -1;
        return a.nextDue.dueDate.localeCompare(b.nextDue.dueDate);
      }
      if (sortBy === 'highestDebt') {
        return b.remainingAmount - a.remainingAmount;
      }
      return a.name.localeCompare(b.name);
    });

    const settled = allWithStats.filter(p => p.isFullyPaid);

    return { activePayables: active, settledPayables: settled };
  }, [state.payables, state.installments, sortBy]);

  const totalDebt = useMemo(() => {
    return state.installments
      .filter((i) => i.status === 'unpaid')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [state.installments]);

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Debt Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>COMBINED TOTAL PAYABLE</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalDebt)}</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{activePayables.length} ACTIVE LOANS</Text>
          </View>
        </View>

        {/* Action Header */}
        <View style={styles.actionHeader}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            <Pressable 
              onPress={() => setSortBy('nextDue')}
              style={[styles.sortChip, sortBy === 'nextDue' && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === 'nextDue' && styles.sortChipTextActive]}>Next Due</Text>
            </Pressable>
            <Pressable 
              onPress={() => setSortBy('highestDebt')}
              style={[styles.sortChip, sortBy === 'highestDebt' && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === 'highestDebt' && styles.sortChipTextActive]}>Highest Debt</Text>
            </Pressable>
            <Pressable 
              onPress={() => setSortBy('name')}
              style={[styles.sortChip, sortBy === 'name' && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === 'name' && styles.sortChipTextActive]}>Name</Text>
            </Pressable>
          </ScrollView>

          <Pressable 
            onPress={() => setIsHistoryVisible(true)}
            style={({ pressed }) => [styles.historyButton, pressed && styles.cardPressed]}
          >
            <MaterialIcons name="assignment-turned-in" size={24} color="#003535" />
            {settledPayables.length > 0 && (
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>{settledPayables.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Payables</Text>
          <Pressable onPress={onAddPayable} style={styles.addButton}>
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Debt</Text>
          </Pressable>
        </View>

        {activePayables.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color="#BFC8C8" />
            <Text style={styles.emptyStateTitle}>All Clear!</Text>
            <Text style={styles.emptyStateText}>
              You have no active debts. Use the "+" button to add a new payable.
            </Text>
          </View>
        ) : (
          <View style={styles.payableList}>
            {activePayables.map((payable) => (
              <Pressable
                key={payable.id}
                onPress={() => onOpenPayable(payable.id)}
                style={({ pressed }) => [styles.payableCard, pressed && styles.cardPressed]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <MaterialIcons name="credit-card" size={24} color="#003535" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.payableName}>{payable.name}</Text>
                    <Text style={styles.payableMeta}>
                      {payable.paidInstallments}/{payable.totalInstallments} Installments
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#707978" />
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.footerLabel}>REMAINING</Text>
                    <Text style={styles.footerValue}>{formatCurrency(payable.remainingAmount)}</Text>
                  </View>
                  {payable.nextDue && (
                    <View style={styles.dueBox}>
                      <Text style={styles.dueLabel}>NEXT DUE</Text>
                      <Text style={styles.dueValue}>
                        {formatCurrency(payable.nextDue.amount)} on {new Date(payable.nextDue.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Settled History Modal */}
      <Modal
        visible={isHistoryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Paid History</Text>
                <Text style={styles.modalSub}>Settled loans and completed payables.</Text>
              </View>
              <Pressable onPress={() => setIsHistoryVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#404848" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.historyList}>
              {settledPayables.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <MaterialIcons name="check-circle-outline" size={48} color="#BFC8C8" />
                  <Text style={styles.emptyHistoryText}>No completed payables yet.</Text>
                </View>
              ) : (
                settledPayables.map((payable) => (
                  <View key={payable.id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{payable.name}</Text>
                      <Text style={styles.historyMeta}>
                        Completed {payable.totalInstallments} installments
                      </Text>
                    </View>
                    <Pressable 
                      onPress={() => deletePayable(payable.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete-outline" size={22} color="#BA1A1A" />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: '#003535',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#003535',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B4EDEC',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  sortScroll: {
    gap: 12,
  },
  historyButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#BA1A1A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F8F9FF',
  },
  historyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  sortChipActive: {
    backgroundColor: '#003535',
    borderColor: '#003535',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#404848',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  addButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  payableList: {
    gap: 16,
  },
  payableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#F8F9FF',
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  payableName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  payableMeta: {
    fontSize: 12,
    color: '#707978',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  dueBox: {
    alignItems: 'flex-end',
  },
  dueLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dueValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003535',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#404848',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#707978',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
  },
  modalSub: {
    fontSize: 14,
    color: '#707978',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  historyList: {
    gap: 12,
    paddingBottom: 40,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  historyInfo: {
    flex: 1,
    gap: 4,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  historyMeta: {
    fontSize: 12,
    color: '#456646',
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#BFC8C8',
  },
});
