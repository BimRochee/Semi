import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const { allocateSalary, getSalaryDetail } = useSalary();
  const detail = getSalaryDetail(salaryEntryId);

  if (!detail) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Salary entry not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SummaryCard
        title={detail.entry.source}
        value={formatCurrency(detail.entry.amount)}
        subtitle={`${detail.wallet?.name ?? 'Unknown wallet'} · ${formatShortDate(detail.entry.receivedAt)}`}
      />

      <View style={styles.grid}>
        <SummaryCard
          title="Allocated"
          value={formatCurrency(detail.allocatedTotal)}
          subtitle="Ledger transfers already created from this salary."
        />
        <SummaryCard
          title="Remaining"
          value={formatCurrency(detail.remaining)}
          subtitle="Still available for transfer or expense."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apply budget templates</Text>
        <View style={styles.stack}>
          {state.budgetTemplates.map((template) => {
            const targetWallet = state.wallets.find((wallet) => wallet.id === template.targetWalletId);
            const allocationCount = getTemplateAllocationCount(
              state.salaryAllocations,
              detail.entry.id,
              template.id
            );
            const disabled =
              !targetWallet ||
              template.amount > detail.remaining ||
              allocationCount > 0 ||
              detail.entry.walletId === template.targetWalletId;

            return (
              <AllocationRow
                key={template.id}
                actionLabel="Apply"
                amount={formatCurrency(template.amount)}
                disabled={disabled}
                label={template.label}
                onPress={() => {
                  if (!targetWallet) {
                    return;
                  }

                  allocateSalary({
                    salaryEntryId: detail.entry.id,
                    fromWalletId: detail.entry.walletId,
                    toWalletId: targetWallet.id,
                    amount: template.amount,
                    budgetTemplateItemId: template.id,
                    note: `Allocation: ${template.label}`,
                  });
                }}
                walletName={
                  targetWallet
                    ? `${template.category} → ${targetWallet.name}`
                    : `${template.category} → No target wallet`
                }
              />
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recorded allocations</Text>
        <View style={styles.stack}>
          {detail.allocations.length === 0 ? (
            <Text style={styles.emptyText}>No allocations recorded for this salary yet.</Text>
          ) : (
            detail.allocations.map((allocation) => {
              const toWallet = state.wallets.find((wallet) => wallet.id === allocation.toWalletId);
              const template = state.budgetTemplates.find(
                (budgetTemplate) => budgetTemplate.id === allocation.budgetTemplateItemId
              );

              return (
                <AllocationRow
                  key={allocation.id}
                  amount={formatCurrency(allocation.amount)}
                  label={template?.label ?? 'Manual allocation'}
                  walletName={toWallet?.name ?? 'Unknown wallet'}
                />
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
  },
  grid: {
    gap: 14,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#0D1C2F',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  stack: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    color: '#5B6464',
    fontSize: 14,
    lineHeight: 22,
  },
});
