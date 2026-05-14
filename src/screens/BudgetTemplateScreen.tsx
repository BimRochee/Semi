import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AllocationRow } from '@/src/components/AllocationRow';
import { useAppState } from '@/src/hooks/useAppState';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function BudgetTemplateScreen() {
  const { state, updateBudgetTemplate } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.copy}>
        Templates are separate from money movements. They define allocation intent, but balances change only when a movement is written to the ledger.
      </Text>
      <View style={styles.stack}>
        {state.budgetTemplates.map((template) => {
          const targetWallet = state.wallets.find((wallet) => wallet.id === template.targetWalletId);

          return (
            <View key={template.id} style={styles.templateCard}>
              <AllocationRow
                amount={formatCurrency(template.amount)}
                label={template.label}
                walletName={targetWallet ? `${template.category} · ${targetWallet.name}` : template.category}
              />
              <View style={styles.adjustRow}>
                <Pressable
                  onPress={() =>
                    updateBudgetTemplate({
                      ...template,
                      amount: Math.max(0, template.amount - 100),
                    })
                  }
                  style={({ pressed }) => [styles.adjustButton, pressed && styles.adjustButtonPressed]}>
                  <Text style={styles.adjustButtonLabel}>- ₱100</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    updateBudgetTemplate({
                      ...template,
                      amount: template.amount + 100,
                    })
                  }
                  style={({ pressed }) => [styles.adjustButton, pressed && styles.adjustButtonPressed]}>
                  <Text style={styles.adjustButtonLabel}>+ ₱100</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
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
  templateCard: {
    gap: 10,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adjustButton: {
    flex: 1,
    backgroundColor: '#EAF3FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adjustButtonPressed: {
    opacity: 0.88,
  },
  adjustButtonLabel: {
    color: '#003535',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
