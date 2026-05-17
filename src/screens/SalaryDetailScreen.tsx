import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AllocationRow } from '@/src/components/AllocationRow';
import { SummaryCard } from '@/src/components/SummaryCard';
import { getTemplateAllocationCount } from '@/src/domain/budgetRules';
import { useAppState } from '@/src/hooks/useAppState';
import { useSalary } from '@/src/hooks/useSalary';
import { formatShortDate } from '@/src/utils/dateUtils';
import { formatCurrency } from '@/src/utils/formatCurrency';

type SalaryDetailScreenProps = {
  salaryEntryId: string;
};

export function SalaryDetailScreen({ salaryEntryId }: SalaryDetailScreenProps) {
  const { state } = useAppState();
  const { allocateSalary, bulkAllocateSalary, getSalaryDetail } = useSalary();
  const detail = getSalaryDetail(salaryEntryId);

  if (!detail) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Salary entry not found.</Text>
      </View>
    );
  }

  const allocationPercent = Math.round((detail.allocatedTotal / detail.entry.amount) * 100);

  const currentMonthExpenses = state.moneyMovements.filter((m) => {
    if (m.type !== 'expense') return false;
    const entryDate = new Date(detail.entry.dateReceived);
    const movementDate = new Date(m.occurredAt);
    return movementDate.getFullYear() === entryDate.getFullYear() && 
           movementDate.getMonth() === entryDate.getMonth();
  });
  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, m) => sum + m.amount, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Hero Section: Cycle Status */}
      <View style={styles.hero}>
        <View style={styles.grainOverlay} />
        <Text style={styles.heroLabel}>CURRENT CYCLE TOTAL</Text>
        <Text style={styles.heroValue}>{formatCurrency(detail.entry.amount)}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <MaterialIcons color="#4B6C4C" name="event-repeat" size={14} />
            <Text style={styles.badgeText}>BI-MONTHLY RHYTHM</Text>
          </View>
        </View>
      </View>

      {/* Summary Section (Bento Style) */}
      <View style={styles.bentoGrid}>
        <View style={styles.bentoCardLow}>
          <Text style={styles.bentoLabel}>ALLOCATED</Text>
          <Text style={styles.bentoValue}>{formatCurrency(detail.allocatedTotal)}</Text>
        </View>
        <View style={styles.bentoCardHigh}>
          <Text style={[styles.bentoLabel, styles.bentoLabelHigh]}>BUFFER</Text>
          <Text style={[styles.bentoValue, styles.bentoValueHigh]}>{formatCurrency(detail.remaining)}</Text>
        </View>
      </View>

      {/* Apply budget templates section */}
      {detail.remaining > 0 && state.budgetTemplates.length > 0 && (
        <View style={styles.section}>
          <Pressable 
            onPress={() => {
              const pending = state.budgetTemplates.filter((t) => {
                if (t.cycle !== detail.entry.cycle) return false;
                const targetWallet = state.wallets.find(w => w.id === t.defaultWalletId);
                const alreadyAllocated = detail.allocations.some(a => a.category === t.category);
                return targetWallet && !alreadyAllocated && t.amount <= detail.remaining;
              });
              
              if (pending.length === 0) {
                Alert.alert('Notice', 'No pending allocations to execute.');
                return;
              }

              const pendingAmount = pending.reduce((sum, t) => sum + t.amount, 0);
              const trueRemaining = detail.remaining - totalSpentThisMonth;

              if (pendingAmount > trueRemaining) {
                const exceeded = pendingAmount - trueRemaining;
                
                Alert.alert(
                  'Over Budget Warning',
                  `Your unbudgeted expenses/debts (₱${totalSpentThisMonth}) mean you are short by ₱${exceeded} to execute this plan.\n\nWhere should we deduct this shortage?`,
                  [
                    ...pending
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 2)
                      .map(t => ({
                        text: `Deduct from ${t.category}`,
                        onPress: () => {
                           const adjustedPending = pending.map(p => 
                             p.id === t.id ? { ...p, amount: p.amount - exceeded } : p
                           );
                           bulkAllocateSalary(adjustedPending.map(template => ({
                             salaryEntryId: detail.entry.id,
                             category: template.category,
                             fromWalletId: detail.entry.receivedWalletId,
                             toWalletId: template.defaultWalletId!,
                             amount: template.amount,
                             note: template.id === t.id 
                               ? `Allocation: ${template.category} (Shortage Adjustment - Planned: ₱${t.amount}, Deducted: ₱${exceeded})`
                               : `Allocation: ${template.category}`,
                           })));
                           Alert.alert('Executed', `Successfully executed and deducted ₱${exceeded} from ${t.category}.`);
                        }
                      })),
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
                return;
              }

              bulkAllocateSalary(pending.map(template => ({
                salaryEntryId: detail.entry.id,
                category: template.category,
                fromWalletId: detail.entry.receivedWalletId,
                toWalletId: template.defaultWalletId!,
                amount: template.amount,
                note: `Allocation: ${template.category}`,
              })));

              Alert.alert('Success', `Successfully executed ${pending.length} allocations!`);
            }}
            style={({ pressed }) => [
              styles.applyAllCta,
              pressed && styles.applyAllCtaPressed
            ]}
          >
            <MaterialIcons name="auto-fix-high" size={20} color="#FFFFFF" />
            <Text style={styles.applyAllCtaText}>EXECUTE ENTIRE BUDGET PLAN</Text>
          </Pressable>

          <Text style={styles.capsHeader}>SUGGESTED ALLOCATIONS ({detail.entry.cycle})</Text>
          <View style={styles.stack}>
            {state.budgetTemplates
              .filter((t) => t.cycle === detail.entry.cycle)
              .map((template) => {
                const targetWallet = state.wallets.find(
                  (wallet) => wallet.id === template.defaultWalletId
                );
                const allocationCount = detail.allocations.filter(
                  (a) => a.category === template.category
                ).length;

                const disabled =
                  !targetWallet ||
                  template.amount > detail.remaining ||
                  allocationCount > 0 ||
                  detail.entry.receivedWalletId === template.defaultWalletId;

                if (allocationCount > 0) return null;

                return (
                  <View key={template.id} style={styles.allocationItem}>
                    <View style={styles.itemLead}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          color="#003535"
                          name={getCategoryIcon(template.category)}
                          size={20}
                        />
                      </View>
                      <View>
                        <Text style={styles.itemTitle}>{template.category}</Text>
                        <View style={styles.tagRow}>
                          <Text style={styles.tagText}>{targetWallet?.name ?? 'Unknown Wallet'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.itemTrail}>
                      <Text style={styles.itemValue}>{formatCurrency(template.amount)}</Text>
                      <MaterialIcons
                        color={disabled ? '#BFC8C8' : '#003535'}
                        name="add-circle-outline"
                        size={24}
                        onPress={() => {
                          if (disabled) return;
                          allocateSalary({
                            salaryEntryId: detail.entry.id,
                            category: template.category,
                            fromWalletId: detail.entry.receivedWalletId,
                            toWalletId: targetWallet!.id,
                            amount: template.amount,
                            note: `Allocation: ${template.category}`,
                          });
                        }}
                      />
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* Distribution Plan (Recorded) */}
      <View style={styles.section}>
        <Text style={styles.capsHeader}>DISTRIBUTION PLAN</Text>
        <View style={styles.stack}>
          {detail.allocations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No allocations recorded yet.</Text>
            </View>
          ) : (
            detail.allocations.map((allocation) => {
              const toWallet = state.wallets.find((wallet) => wallet.id === allocation.walletId);

              return (
                <View key={allocation.id} style={styles.allocationItem}>
                  <View style={styles.itemLead}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        color="#003535"
                        name={getCategoryIcon(allocation.category)}
                        size={20}
                      />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>{allocation.category}</Text>
                      <View style={styles.tagRow}>
                        <Text style={styles.tagText}>{toWallet?.name ?? 'Unknown Wallet'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.itemTrail}>
                    <Text style={styles.itemValue}>{formatCurrency(allocation.amount)}</Text>
                    <MaterialIcons color="#BFC8C8" name="chevron-right" size={20} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Stability Meter */}
      <View style={styles.meterCard}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterLabel}>STABILITY METER</Text>
          <Text style={styles.meterLabel}>{allocationPercent}% ALLOCATED</Text>
        </View>
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${allocationPercent}%` }]} />
        </View>
      </View>
    </ScrollView>
  );
}

function getCategoryIcon(category: string): any {
  const c = category.toLowerCase();
  if (c.includes('home') || c.includes('rent') || c.includes('apartment')) return 'home';
  if (c.includes('water') || c.includes('electric') || c.includes('bolt') || c.includes('utility')) return 'bolt';
  if (c.includes('shop') || c.includes('bag') || c.includes('rice') || c.includes('grocery')) return 'shopping-bag';
  if (c.includes('food') || c.includes('eat') || c.includes('viand') || c.includes('restaurant')) return 'restaurant';
  if (c.includes('emer') || c.includes('health')) return 'medical-services';
  if (c.includes('save')) return 'savings';
  return 'payments';
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 160,
    backgroundColor: '#F8F9FF',
  },
  hero: {
    paddingVertical: 32,
    alignItems: 'center',
    position: 'relative',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#404848',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#003535',
    letterSpacing: -0.8,
  },
  badgeRow: {
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C6EDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E4E30',
    letterSpacing: 0.5,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  bentoCardLow: {
    flex: 1,
    backgroundColor: '#EFF4FF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    gap: 4,
  },
  bentoCardHigh: {
    flex: 1,
    backgroundColor: '#C6EDC4',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#456646',
    gap: 4,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#404848',
    letterSpacing: 0.8,
  },
  bentoLabelHigh: {
    color: '#2E4E30',
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  bentoValueHigh: {
    color: '#456646',
  },
  applyAllCta: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 22,
    marginBottom: 32,
    gap: 12,
    elevation: 6,
    shadowColor: '#003535',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  applyAllCtaPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#004B4B',
  },
  applyAllCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  capsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#707978',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stack: {
    gap: 12,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  itemLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#D5E3FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  tagRow: {
    marginTop: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#404848',
    backgroundColor: '#E6EEFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  itemTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  meterCard: {
    backgroundColor: '#0D4D4D',
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  meterTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#5B6464',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
