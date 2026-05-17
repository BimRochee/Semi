import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { useSalary } from '@/src/hooks/useSalary';
import { useWallets } from '@/src/hooks/useWallets';
import { formatShortDate } from '@/src/utils/dateUtils';
import { formatCurrency } from '@/src/utils/formatCurrency';

type DashboardScreenProps = {
  onOpenWallets: () => void;
  onOpenBalanceReconciliation: () => void;
  onOpenAddSalary: () => void;
  onOpenBudgetTemplates: () => void;
  onOpenSecurity: () => void;
  onOpenTransfer: () => void;
  onOpenSalary: (salaryEntryId: string) => void;
};

type CycleCardProps = {
  title: string;
  amount: number;
  progress: number;
  accentColor: string;
  accentBg: string;
  nextLabel: string;
  statusLabel: string;
  statusFilled: boolean;
  onPress?: () => void;
};

export function DashboardScreen({
  onOpenWallets,
  onOpenBalanceReconciliation,
  onOpenAddSalary,
  onOpenBudgetTemplates,
  onOpenSecurity,
  onOpenTransfer,
  onOpenSalary,
}: DashboardScreenProps) {
  const { state, adjustAllocationAmount } = useAppState();
  const { walletSummaries, totalBalance } = useWallets();
  const { salaryEntries } = useSalary();

  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedAllocForDeduction, setSelectedAllocForDeduction] = useState<string | null>(null);
  const [deductionAmountInput, setDeductionAmountInput] = useState<string>('');

  const now = new Date();
  const currentMonthEntries = salaryEntries.filter((entry) => {
    const entryDate = new Date(entry.dateReceived);
    return (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth()
    );
  });
  const activeSalaryEntries = currentMonthEntries.length > 0 ? currentMonthEntries : salaryEntries;
  const totalSalaryThisMonth = activeSalaryEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalAllocatedThisMonth = state.salaryAllocations
    .filter(alloc => activeSalaryEntries.some(entry => entry.id === alloc.salaryEntryId))
    .reduce((sum, a) => sum + a.amount, 0);

  const salary15 = activeSalaryEntries
    .filter((entry) => entry.cycle === '15th')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const salary30 = activeSalaryEntries
    .filter((entry) => entry.cycle === '30th')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const cycleTotal = Math.max(totalSalaryThisMonth, 1);
  const cycle15Progress = Math.min(1, salary15 / cycleTotal);
  const cycle30Progress = Math.min(1, salary30 / cycleTotal);

  const entry15 = [...activeSalaryEntries]
    .filter(e => e.cycle === '15th')
    .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())[0];

  const entry30 = [...activeSalaryEntries]
    .filter(e => e.cycle === '30th')
    .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())[0];

  const bufferAmount = totalSalaryThisMonth - totalAllocatedThisMonth;

  const savingsBalance = walletSummaries
    .filter(w => w.type === 'Savings Account' || w.name.toLowerCase().includes('savings'))
    .reduce((sum, w) => sum + w.currentBalance, 0);

  const currentMonthExpenses = state.moneyMovements.filter((m) => {
    if (m.type !== 'expense') return false;
    const date = new Date(m.occurredAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, m) => sum + m.amount, 0);

  const actualRemaining = bufferAmount - totalSpentThisMonth;
  const isOverBudget = actualRemaining < 0;
  const deficit = Math.abs(actualRemaining);

  const currentMonthAllocations = state.salaryAllocations.filter(alloc => 
    activeSalaryEntries.some(entry => entry.id === alloc.salaryEntryId)
  );

  const recentMovements = [...state.moneyMovements]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 3);

  return (
    <>
    <ScrollView contentContainerStyle={styles.content}>
      {/* Premium Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.netWorthRow}>
          <View>
            <Text style={styles.netWorthLabel}>TOTAL AVAILABLE MONEY</Text>
            <Text style={styles.netWorthValue}>{formatCurrency(totalBalance)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.netWorthLabel}>TOTAL SAVINGS</Text>
            <Text style={[styles.netWorthValue, styles.textSavingsHighlight]}>{formatCurrency(savingsBalance)}</Text>
          </View>
        </View>

        {/* Main Stats Card */}
        <View style={styles.mainStatsCard}>
          <MaterialIcons 
            name="account-balance" 
            size={160} 
            color="rgba(255,255,255,0.06)" 
            style={styles.cardWatermark} 
          />
          
          <View style={styles.cardTop}>
            <Text style={styles.cardLabelCaps}>TOTAL SALARY THIS MONTH</Text>
            <Text style={styles.cardMainValue}>{formatCurrency(totalSalaryThisMonth)}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardBottom}>
            <View style={styles.statsRow}>
              <View style={styles.cardStatColumn}>
                <Text style={styles.cardStatLabel}>Allocated (Plan)</Text>
                <Text style={styles.cardStatValue}>{formatCurrency(totalAllocatedThisMonth)}</Text>
              </View>
              <View style={styles.cardStatColumn}>
                <View style={styles.bufferLabelRow}>
                  <Text style={[styles.cardStatLabel, { marginBottom: 0 }]}>Spent / Paid (Actual)</Text>
                  <Pressable 
                    onPress={() => Alert.alert('Spent / Paid', 'This represents all money that has actually left your wallets this month, including unbudgeted expenses and debt payments.')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="info-outline" size={14} color="#BFC8C8" />
                  </Pressable>
                </View>
                <Text style={styles.cardStatValue}>{formatCurrency(totalSpentThisMonth)}</Text>
              </View>
            </View>
            
            <View style={[styles.statsRow, { marginTop: 20 }]}>
              <View style={styles.cardStatColumn}>
                <View style={styles.bufferLabelRow}>
                  <Text style={[styles.cardStatLabel, { marginBottom: 0 }]}>
                    {isOverBudget ? 'Over Budget' : 'Unassigned Funds'}
                  </Text>
                  <Pressable 
                    onPress={() => Alert.alert(
                      isOverBudget ? 'Over Budget' : 'Unassigned Funds', 
                      isOverBudget 
                        ? 'You have spent more on unplanned expenses and debts than you had in your unassigned funds. This means you have dipped into money that was allocated for other bills!\n\nTap the red amount below to settle this deficit.'
                        : 'This is what you actually have left to safely assign. It is your Total Income minus your Allocations and Actual Spent. If this is 0, every peso has a job (or was already spent)!'
                    )}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="info-outline" size={14} color="#BFC8C8" />
                  </Pressable>
                </View>
                <Pressable
                  disabled={!isOverBudget}
                  onPress={() => {
                    setShowSettleModal(true);
                    setSelectedAllocForDeduction(null);
                  }}
                >
                  <Text style={[styles.cardStatValue, isOverBudget && styles.textDangerHighlight, isOverBudget && { textDecorationLine: 'underline' }]}>
                    {isOverBudget ? `-${formatCurrency(deficit)}` : formatCurrency(actualRemaining)}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            onPress={onOpenTransfer}
            style={({ pressed }) => [styles.actionBento, { backgroundColor: '#004B4B' }, pressed && styles.actionButtonPressed]}>
            <MaterialIcons color="#B4EDEC" name="swap-horiz" size={24} />
            <Text style={[styles.actionBentoText, { color: '#FFFFFF' }]}>Move Money</Text>
          </Pressable>

          <Pressable
            onPress={onOpenBalanceReconciliation}
            style={({ pressed }) => [styles.actionBento, { backgroundColor: '#C6EDC4' }, pressed && styles.actionButtonPressed]}>
            <MaterialIcons color="#003535" name="sync" size={24} />
            <Text style={[styles.actionBentoText, { color: '#003535' }]}>Update Balance</Text>
          </Pressable>
        </View>
      </View>

      {/* Salary Cycles Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bi-Monthly Rhythm</Text>
          <Pressable onPress={onOpenAddSalary}>
            <MaterialIcons color="#003535" name="add-circle" size={24} />
          </Pressable>
        </View>

        <View style={styles.cycleGrid}>
          <CycleCard
            accentBg="#C6EDC4"
            accentColor="#003535"
            amount={salary15}
            nextLabel={formatNextCycleLabel(now, 15)}
            progress={cycle15Progress}
            statusLabel={cycle15Progress > 0 ? 'Allocated' : 'Pending'}
            title="15th Salary"
            onPress={() => entry15 && onOpenSalary(entry15.id)}
          />
          <CycleCard
            accentBg="#E6EEFF"
            accentColor="#456646"
            amount={salary30}
            nextLabel={formatNextCycleLabel(now, 30)}
            progress={cycle30Progress}
            statusLabel={cycle30Progress > 0 ? 'Allocated' : 'Pending'}
            title="30th Salary"
            onPress={() => entry30 && onOpenSalary(entry30.id)}
          />
        </View>
      </View>

      {/* Wallets Bento Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connected Wallets</Text>
          <Pressable onPress={onOpenWallets}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
          {walletSummaries.map((wallet) => (
            <Pressable key={wallet.id} style={styles.walletPremiumCard} onPress={onOpenWallets}>
              <View style={styles.walletCardTop}>
                <View style={[styles.walletIconBox, getWalletPalette(wallet.type).bg]}>
                  <MaterialIcons color={getWalletPalette(wallet.type).color} name={getWalletIcon(wallet.type)} size={18} />
                </View>
                <Text style={styles.walletTypeText}>{wallet.type.split(' ')[0]}</Text>
              </View>
              <View style={styles.walletCardBottom}>
                <Text numberOfLines={1} style={styles.walletNameText}>{wallet.name}</Text>
                <Text style={styles.walletBalanceText}>{formatCurrency(wallet.currentBalance)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Movements</Text>
          <Pressable onPress={onOpenBudgetTemplates}>
            <Text style={styles.seeAllText}>History</Text>
          </Pressable>
        </View>

        <View style={styles.activityList}>
          {recentMovements.length === 0 ? (
            <Text style={styles.emptyActivityText}>No recent movements recorded.</Text>
          ) : (
            recentMovements.map((movement) => {
              const isPositive = movement.type === 'income';
              return (
                <Pressable
                  key={movement.id}
                  style={styles.activityItem}
                  onPress={() => movement.referenceId && onOpenSalary(movement.referenceId)}>
                  <View style={styles.itemLead}>
                    <View style={[styles.activityIconBox, isPositive ? styles.bgPositive : styles.bgNeutral]}>
                      <MaterialIcons
                        color={isPositive ? '#456646' : '#404848'}
                        name={isPositive ? 'add-task' : 'sync-alt'}
                        size={20}
                      />
                    </View>
                    <View>
                      <Text style={styles.activityTitleText}>{getMovementTitle(movement.type)}</Text>
                      <Text style={styles.activityDateText}>{formatRecentTimestamp(movement.occurredAt)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.activityAmountText, isPositive && styles.textPositive]}>
                    {isPositive ? '+' : ''}{formatCurrency(movement.amount)}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>

    <Modal
      visible={showSettleModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSettleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconBox}>
              {selectedAllocForDeduction ? (
                <Pressable onPress={() => setSelectedAllocForDeduction(null)} hitSlop={10}>
                  <MaterialIcons name="arrow-back" size={24} color="#003535" />
                </Pressable>
              ) : (
                <MaterialIcons name="account-balance-wallet" size={24} color="#003535" />
              )}
            </View>
            <Text style={styles.modalTitle}>
              {selectedAllocForDeduction ? 'Adjust Allocation' : 'Settle Over Budget'}
            </Text>
          </View>
          
          {selectedAllocForDeduction ? (() => {
            const alloc = currentMonthAllocations.find(a => a.id === selectedAllocForDeduction);
            if (!alloc) return null;
            return (
              <View>
                <Text style={styles.modalText}>
                  Deficit remaining: <Text style={styles.textDangerHighlight}>₱{deficit}</Text>
                  {'\n'}Available in {alloc.category}: ₱{alloc.amount}
                </Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputPrefix}>₱</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={deductionAmountInput}
                    onChangeText={setDeductionAmountInput}
                    autoFocus
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.modalConfirmButton, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    const amount = parseFloat(deductionAmountInput) || 0;
                    if (amount <= 0 || amount > alloc.amount) {
                      Alert.alert('Invalid', 'Please enter a valid amount up to the available balance.');
                      return;
                    }
                    adjustAllocationAmount(
                      alloc.id,
                      amount,
                      `Settled Over Budget: Reverted ₱${amount} from ${alloc.category} to cover unbudgeted debts.`
                    );
                    
                    if (amount >= deficit) {
                      setShowSettleModal(false);
                      Alert.alert('Settled', `Successfully deducted ₱${amount} from ${alloc.category}. Your budget is balanced!`);
                    } else {
                      setSelectedAllocForDeduction(null);
                      Alert.alert('Progress', `Deducted ₱${amount}. You still have a remaining deficit.`);
                    }
                  }}
                >
                  <Text style={styles.modalConfirmText}>Deduct ₱{deductionAmountInput || '0'}</Text>
                </Pressable>
              </View>
            );
          })() : (
            <>
              <Text style={styles.modalText}>
                You are currently short by <Text style={styles.textDangerHighlight}>₱{deficit}</Text>. 
                Where would you like to pull money from to cover this deficit?
              </Text>

              <ScrollView style={styles.modalScrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.modalOptionsGrid}>
                  {currentMonthAllocations
                    .filter(a => a.amount > 0)
                    .sort((a, b) => b.amount - a.amount)
                    .map(alloc => (
                      <Pressable
                        key={alloc.id}
                        style={({ pressed }) => [styles.modalOptionButton, pressed && styles.modalOptionPressed]}
                        onPress={() => {
                          setSelectedAllocForDeduction(alloc.id);
                          setDeductionAmountInput(Math.min(deficit, alloc.amount).toString());
                        }}
                      >
                        <View style={styles.modalOptionLead}>
                          <MaterialIcons color="#003535" name="swap-horiz" size={20} />
                          <View>
                            <Text style={styles.modalOptionTitle}>Deduct from {alloc.category}</Text>
                            <Text style={styles.modalOptionSubtext}>Available: {formatCurrency(alloc.amount)}</Text>
                          </View>
                        </View>
                        <MaterialIcons color="#BFC8C8" name="chevron-right" size={20} />
                      </Pressable>
                    ))}
                </View>
              </ScrollView>
            </>
          )}

          <Pressable
            style={({ pressed }) => [styles.modalCancelButton, pressed && { opacity: 0.7 }]}
            onPress={() => setShowSettleModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function HeroStat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={[styles.heroStatValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function CycleCard({
  title,
  amount,
  progress,
  accentColor,
  accentBg,
  nextLabel,
  statusLabel,
  onPress,
}: Omit<CycleCardProps, 'statusFilled'>) {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.cycleCard,
        pressed && styles.cycleCardPressed
      ]}
    >
      <View style={styles.cycleHeader}>
        <Text style={styles.labelCaps}>{title.toUpperCase()}</Text>
        <View style={styles.cycleProgressRow}>
          <View style={[styles.progressBar, { backgroundColor: accentBg }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: accentColor }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
      <Text style={styles.cycleAmount}>{formatCurrency(amount)}</Text>
      <View style={styles.cycleFooter}>
        <View style={styles.nextDateBox}>
          <MaterialIcons color="#707978" name="event" size={14} />
          <Text style={styles.nextDateText}>{nextLabel}</Text>
        </View>
        <View style={[styles.statusTag, { backgroundColor: progress > 0 ? '#C6EDC4' : '#EFF4FF' }]}>
          <Text style={[styles.statusTagText, { color: progress > 0 ? '#2E4E30' : '#404848' }]}>
            {statusLabel.toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function getWalletIcon(type: string): any {
  switch (type) {
    case 'Bank Account': return 'account-balance';
    case 'Digital Wallet': return 'account-balance-wallet';
    case 'Physical Wallet': return 'payments';
    case 'Savings Account': return 'savings';
    default: return 'wallet';
  }
}

function getWalletPalette(type: string) {
  switch (type) {
    case 'Bank Account': return { color: '#FFFFFF', bg: { backgroundColor: '#0D1C2F' } };
    case 'Digital Wallet': return { color: '#B4EDEC', bg: { backgroundColor: '#0D4D4D' } };
    case 'Physical Wallet': return { color: '#456646', bg: { backgroundColor: '#C6EDC4' } };
    case 'Savings Account': return { color: '#D5E6E0', bg: { backgroundColor: '#394844' } };
    default: return { color: '#003535', bg: { backgroundColor: '#E6EEFF' } };
  }
}

function getMovementTitle(type: string, source?: string) {
  switch (type) {
    case 'income':
      return source ? `${source} Payout` : 'Salary Received';
    case 'allocation':
      return 'Budget Allocation';
    case 'expense':
      return 'Expense Recorded';
    case 'transfer':
      return 'Wallet Transfer';
    default:
      return 'Ledger Movement';
  }
}

function formatRecentTimestamp(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today, ${new Intl.DateTimeFormat('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)}`;
  }

  return formatShortDate(isoDate);
}

function formatNextCycleLabel(now: Date, cycleDay: number) {
  const nextCycle = new Date(now.getFullYear(), now.getMonth(), cycleDay);

  if (nextCycle < now) {
    nextCycle.setMonth(nextCycle.getMonth() + 1);
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
  }).format(nextCycle);
}

function walletIconPalette(walletName: string) {
  if (/gcash/i.test(walletName)) {
    return { icon: 'account-balance-wallet' as const, color: '#246EE9', background: styles.walletIconBlue };
  }

  if (/maya|savings/i.test(walletName)) {
    return { icon: 'savings' as const, color: '#006A14', background: styles.walletIconGreen };
  }

  if (/cash/i.test(walletName)) {
    return { icon: 'payments' as const, color: '#404848', background: styles.walletIconNeutral };
  }

  return { icon: 'account-balance' as const, color: '#003535', background: styles.walletIconPrimary };
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 160,
    backgroundColor: '#F8F9FF',
    gap: 32,
  },
  heroSection: {
    gap: 20,
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: -8,
  },
  netWorthLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#707978',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  netWorthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
  },
  mainStatsCard: {
    backgroundColor: '#003535',
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardWatermark: {
    position: 'absolute',
    right: -20,
    top: -10,
    opacity: 0.8,
  },
  cardTop: {
    marginBottom: 24,
  },
  cardLabelCaps: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BFC8C8',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  cardMainValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 20,
  },
  cardBottom: {
    gap: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardStatColumn: {
    flex: 1,
  },
  bufferLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardStatLabel: {
    fontSize: 12,
    color: '#BFC8C8',
    marginBottom: 4,
    fontWeight: '500',
  },
  cardStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textSavingsHighlight: {
    color: '#006A14',
  },
  textDangerHighlight: {
    color: '#FF8A8A',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBento: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionBentoText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003535',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cycleGrid: {
    gap: 12,
  },
  cycleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 20,
    gap: 12,
  },
  cycleCardPressed: {
    backgroundColor: '#F0F4F4',
    transform: [{ scale: 0.99 }],
  },
  cycleHeader: {
    gap: 8,
  },
  labelCaps: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1.2,
  },
  cycleProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFF4FF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
  },
  cycleAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0D1C2F',
    letterSpacing: -0.5,
  },
  cycleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  nextDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextDateText: {
    fontSize: 13,
    color: '#404848',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  walletScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  walletPremiumCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    borderRadius: 22,
    padding: 16,
    marginRight: 12,
    justifyContent: 'space-between',
    height: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  walletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#707978',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#F0F4F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  walletCardBottom: {
    gap: 2,
  },
  walletIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#404848',
  },
  walletBalanceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003535',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgPositive: { backgroundColor: '#C6EDC4' },
  bgNeutral: { backgroundColor: '#EFF4FF' },
  activityTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  activityDateText: {
    fontSize: 12,
    color: '#707978',
  },
  activityAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  textPositive: {
    color: '#456646',
  },
  emptyActivityText: {
    padding: 20,
    textAlign: 'center',
    color: '#707978',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 28, 47, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#C6EDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003535',
  },
  modalText: {
    fontSize: 14,
    color: '#404848',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalScrollArea: {
    maxHeight: 300,
    marginBottom: 24,
  },
  modalOptionsGrid: {
    gap: 12,
  },
  modalOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
  modalOptionPressed: {
    backgroundColor: '#EFF4FF',
    transform: [{ scale: 0.98 }],
  },
  modalOptionLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1C2F',
    marginBottom: 2,
  },
  modalOptionSubtext: {
    fontSize: 12,
    color: '#707978',
    fontWeight: '500',
  },
  modalCancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#707978',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6EDED',
    marginBottom: 24,
  },
  inputPrefix: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    height: 64,
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
  },
  modalConfirmButton: {
    backgroundColor: '#003535',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
