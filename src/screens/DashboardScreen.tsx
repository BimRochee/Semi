import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { useSalary } from '@/src/hooks/useSalary';
import { useWallets } from '@/src/hooks/useWallets';
import { formatShortDate } from '@/src/utils/dateUtils';
import { formatCurrency } from '@/src/utils/formatCurrency';

type DashboardScreenProps = {
  onOpenWallets: () => void;
  onOpenAddSalary: () => void;
  onOpenBudgetTemplates: () => void;
  onOpenSecurity: () => void;
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
};

export function DashboardScreen({
  onOpenWallets,
  onOpenAddSalary,
  onOpenBudgetTemplates,
  onOpenSecurity,
  onOpenSalary,
}: DashboardScreenProps) {
  const { state } = useAppState();
  const { walletSummaries } = useWallets();
  const { salaryEntries } = useSalary();

  const now = new Date();
  const currentMonthEntries = salaryEntries.filter((entry) => {
    const entryDate = new Date(entry.receivedAt);
    return (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth()
    );
  });
  const activeSalaryEntries = currentMonthEntries.length > 0 ? currentMonthEntries : salaryEntries;
  const totalSalaryThisMonth = activeSalaryEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalAllocated = state.salaryAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const bufferAmount = Math.max(totalSalaryThisMonth - totalAllocated, 0);
  const savingsAmount = walletSummaries
    .filter((wallet) => wallet.type === 'Savings Account')
    .reduce((sum, wallet) => sum + wallet.currentBalance, 0);

  const salary15 = activeSalaryEntries
    .filter((entry) => new Date(entry.receivedAt).getDate() <= 15)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const salary30 = activeSalaryEntries
    .filter((entry) => new Date(entry.receivedAt).getDate() > 15)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const cycleTotal = Math.max(totalSalaryThisMonth, 1);
  const cycle15Progress = Math.min(1, salary15 / cycleTotal);
  const cycle30Progress = Math.min(1, salary30 / cycleTotal);

  const recentMovements = [...state.moneyMovements]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 2);

  const savingsDelta = Math.max(savingsAmount - 2000, 0);
  const savingsDeltaPercent = savingsAmount > 0 ? Math.round((savingsDelta / Math.max(savingsAmount, 1)) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionHeader title="Semi Summary" />
      <View style={styles.heroCard}>
        <MaterialIcons
          color="rgba(255,255,255,0.12)"
          name="account-balance"
          size={118}
          style={styles.heroPattern}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroKicker}>Total Salary This Month</Text>
          <Text style={styles.heroValue}>{formatCurrency(totalSalaryThisMonth)}</Text>
          <View style={styles.heroStatsRow}>
            <HeroStat label="Allocated" value={formatCurrency(totalAllocated)} valueColor="#FFFFFF" />
            <HeroStat label="Buffer" value={formatCurrency(bufferAmount)} valueColor="#FFFFFF" />
            <HeroStat label="Savings" value={formatCurrency(savingsAmount)} valueColor="#C6EDC4" />
          </View>
        </View>
      </View>

      <View style={styles.titleRow}>
        <SectionHeader title="Salary Cycles" />
        <Text style={styles.titleRowMeta}>Current Status</Text>
      </View>
      <View style={styles.cycleGrid}>
        <CycleCard
          accentBg="#C6EDC4"
          accentColor="#003535"
          amount={salary15}
          nextLabel={`Next: ${formatNextCycleLabel(now, 15)}`}
          progress={cycle15Progress}
          statusFilled={cycle15Progress > 0}
          statusLabel={cycle15Progress > 0 ? 'Allocated' : 'Pending'}
          title="15th Salary"
        />
        <CycleCard
          accentBg="#E6EEFF"
          accentColor="#456646"
          amount={salary30}
          nextLabel={`Next: ${formatNextCycleLabel(now, 30)}`}
          progress={cycle30Progress}
          statusFilled={cycle30Progress > 0}
          statusLabel={cycle30Progress > 0 ? 'Allocated' : 'Pending'}
          title="30th Salary"
        />
      </View>

      <Pressable onPress={onOpenSecurity} style={({ pressed }) => [styles.insightCard, pressed && styles.cardPressed]}>
        <View style={styles.insightIconWrap}>
          <MaterialIcons color="#456646" name="eco" size={24} />
        </View>
        <View style={styles.insightCopy}>
          <Text style={styles.insightTitle}>Breaking the Cycle</Text>
          <Text style={styles.insightText}>
            {savingsDeltaPercent > 0
              ? `${savingsDeltaPercent}% more saved compared to your base reserve.`
              : 'Start routing part of each cycle into savings to build momentum.'}
          </Text>
        </View>
        <MaterialIcons color="#456646" name="trending-up" size={28} />
      </Pressable>

      <View style={styles.titleRow}>
        <SectionHeader title="Wallets & Accounts" />
        <Pressable onPress={onOpenWallets} style={({ pressed }) => [styles.inlineButton, pressed && styles.inlineButtonPressed]}>
          <Text style={styles.inlineButtonText}>Manage</Text>
          <MaterialIcons color="#003535" name="chevron-right" size={16} />
        </Pressable>
      </View>
      <View style={styles.walletGrid}>
        {walletSummaries.map((wallet) => (
          <Pressable
            key={wallet.id}
            onPress={onOpenWallets}
            style={({ pressed }) => [styles.walletTile, pressed && styles.cardPressed]}>
            <View style={styles.walletTileHeader}>
              <View style={[styles.walletIconWrap, walletIconPalette(wallet.name).background]}>
                <MaterialIcons
                  color={walletIconPalette(wallet.name).color}
                  name={walletIconPalette(wallet.name).icon}
                  size={22}
                />
              </View>
              <MaterialIcons color="#707978" name="more-vert" size={18} />
            </View>
            <Text style={styles.walletTileLabel}>{wallet.name}</Text>
            <Text style={styles.walletTileValue}>{formatCurrency(wallet.currentBalance)}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Recent Cycles" />
      <View style={styles.activityPanel}>
        {recentMovements.length === 0 ? (
          <View style={styles.activityEmpty}>
            <Text style={styles.activityEmptyTitle}>No recent ledger activity</Text>
            <Text style={styles.activityEmptyText}>
              Add salary, budget allocations, or wallet movements to populate this section.
            </Text>
            <Pressable onPress={onOpenAddSalary} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}>
              <Text style={styles.primaryActionText}>Add your first salary</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {recentMovements.map((movement) => {
              const isPositive =
                movement.type === 'income' || Boolean(movement.toWalletId && !movement.fromWalletId);
              const sourceEntry = salaryEntries.find((entry) => entry.id === movement.referenceId);
              const rowTitle = getMovementTitle(movement.type, sourceEntry?.source);
              const rowMeta = formatRecentTimestamp(movement.occurredAt);

              return (
                <Pressable
                  key={movement.id}
                  onPress={() => {
                    if (movement.referenceId) {
                      onOpenSalary(movement.referenceId);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.activityRow,
                    pressed && movement.referenceId && styles.cardPressed,
                  ]}>
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.activityIconWrap,
                        isPositive ? styles.activityPositiveBg : styles.activityNeutralBg,
                      ]}>
                      <MaterialIcons
                        color={isPositive ? '#456646' : '#404848'}
                        name={isPositive ? 'add-task' : 'payments'}
                        size={20}
                      />
                    </View>
                    <View>
                      <Text style={styles.activityTitle}>{rowTitle}</Text>
                      <Text style={styles.activityMeta}>{rowMeta}</Text>
                    </View>
                  </View>
                  <Text style={[styles.activityAmount, isPositive && styles.activityAmountPositive]}>
                    {isPositive ? '+' : '-'}
                    {formatCurrency(movement.amount)}
                  </Text>
                </Pressable>
              );
            })}
            <View style={styles.activityFooter}>
              <Pressable onPress={onOpenBudgetTemplates} style={({ pressed }) => [styles.historyButton, pressed && styles.inlineButtonPressed]}>
                <Text style={styles.historyButtonText}>View All History</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScrollView>
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
  statusFilled,
}: CycleCardProps) {
  return (
    <View style={styles.cycleCard}>
      <View style={styles.cycleTopRow}>
        <View>
          <Text style={styles.cycleKicker}>{title}</Text>
          <Text style={[styles.cycleValue, amount <= 0 && styles.cycleValueMuted]}>
            {formatCurrency(amount)}
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <View style={[styles.progressRing, { borderColor: accentBg }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(progress, 0.12) * 100}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
            <Text style={[styles.progressText, { color: accentColor }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cycleBottomRow}>
        <View style={styles.cycleDateRow}>
          <MaterialIcons color="#404848" name="calendar-today" size={16} />
          <Text style={styles.cycleDateText}>{nextLabel}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            statusFilled ? styles.statusPillFilled : styles.statusPillPending,
          ]}>
          <Text
            style={[
              styles.statusPillText,
              statusFilled ? styles.statusPillTextFilled : styles.statusPillTextPending,
            ]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 132,
    gap: 16,
  },
  sectionTitle: {
    color: '#0D1C2F',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#003535',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0B2222',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroPattern: {
    position: 'absolute',
    right: -8,
    top: -6,
  },
  heroContent: {
    zIndex: 1,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  heroValue: {
    marginTop: 6,
    marginBottom: 18,
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  heroStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 16,
    gap: 8,
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatValue: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRowMeta: {
    color: '#707978',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cycleGrid: {
    gap: 16,
  },
  cycleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 20,
    gap: 16,
    shadowColor: '#0D1C2F',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cycleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  cycleKicker: {
    color: '#404848',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cycleValue: {
    marginTop: 4,
    color: '#003535',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  cycleValueMuted: {
    color: '#0D1C2F',
  },
  progressBadge: {
    width: 68,
    alignItems: 'center',
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: '100%',
    opacity: 0.18,
  },
  progressText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  cycleBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cycleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycleDateText: {
    color: '#404848',
    fontSize: 14,
    lineHeight: 20,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillFilled: {
    backgroundColor: '#C6EDC4',
  },
  statusPillPending: {
    backgroundColor: '#E6EEFF',
  },
  statusPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  statusPillTextFilled: {
    color: '#4B6C4C',
  },
  statusPillTextPending: {
    color: '#404848',
  },
  insightCard: {
    backgroundColor: '#C6EDC4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C6EDC4',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  insightIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(1,33,8,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
    gap: 3,
  },
  insightTitle: {
    color: '#2E4E30',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  insightText: {
    color: '#2E4E30',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.92,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineButtonPressed: {
    opacity: 0.76,
  },
  inlineButtonText: {
    color: '#003535',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  walletTile: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 14,
    gap: 14,
  },
  walletTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconBlue: {
    backgroundColor: 'rgba(36,110,233,0.1)',
  },
  walletIconGreen: {
    backgroundColor: 'rgba(0,255,41,0.1)',
  },
  walletIconNeutral: {
    backgroundColor: '#E6EEFF',
  },
  walletIconPrimary: {
    backgroundColor: 'rgba(13,77,77,0.1)',
  },
  walletTileLabel: {
    color: '#707978',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  walletTileValue: {
    color: '#0D1C2F',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  activityPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    overflow: 'hidden',
  },
  activityRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#BFC8C8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityNeutralBg: {
    backgroundColor: '#E6EEFF',
  },
  activityPositiveBg: {
    backgroundColor: '#C6EDC4',
  },
  activityTitle: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  activityMeta: {
    color: '#707978',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activityAmount: {
    color: '#0D1C2F',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  activityAmountPositive: {
    color: '#456646',
  },
  activityFooter: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(230,238,255,0.3)',
    alignItems: 'center',
  },
  historyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  historyButtonText: {
    color: '#003535',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  activityEmpty: {
    padding: 18,
    gap: 10,
  },
  activityEmptyTitle: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  activityEmptyText: {
    color: '#404848',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: '#003535',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryActionPressed: {
    opacity: 0.86,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  cardPressed: {
    opacity: 0.9,
  },
});
