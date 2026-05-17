import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { useWallets } from '@/src/hooks/useWallets';
import { formatCurrency } from '@/src/utils/formatCurrency';

type PayInstallmentScreenProps = {
  installmentId: string;
  onSaved: () => void;
  onBack: () => void;
};

export function PayInstallmentScreen({ installmentId, onSaved, onBack }: PayInstallmentScreenProps) {
  const { state, payInstallment } = useAppState();
  const { walletSummaries } = useWallets();
  
  const installment = state.installments.find((i) => i.id === installmentId);
  const payable = state.payables.find((p) => p.id === installment?.payableId);
  
  const [walletId, setWalletId] = useState(state.wallets[0]?.id ?? '');
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!installment || !payable) {
    return (
      <View style={styles.center}>
        <Text>Installment not found.</Text>
      </View>
    );
  }

  const selectedWallet = state.wallets.find((w) => w.id === walletId);
  const selectedSummary = walletSummaries.find((s) => s.id === walletId);
  const currentBalance = selectedSummary?.currentBalance ?? 0;

  const handlePay = () => {
    if (currentBalance < installment.amount) {
      setError(`Insufficient funds in ${selectedWallet?.name}. You only have ${formatCurrency(currentBalance)}.`);
      return;
    }

    payInstallment({
      installmentId,
      walletId,
      amount: installment.amount,
      note: `Payment for ${payable.name}`,
    });
    onSaved();
  };

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
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-balance" size={40} color="#003535" />
          </View>
          <Text style={styles.title}>Confirm Payment</Text>
          <Text style={styles.subtitle}>Execute debt payment and update your ledger.</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PAYABLE</Text>
            <Text style={styles.detailValue}>{payable.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DUE DATE</Text>
            <Text style={styles.detailValue}>
              {new Date(installment.dueDate).toLocaleDateString('en-PH', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>AMOUNT TO PAY</Text>
            <Text style={styles.amountValue}>{formatCurrency(installment.amount)}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PAY FROM WALLET</Text>
          <Pressable
            onPress={() => {
              setError(null);
              setIsWalletModalVisible(true);
            }}
            style={({ pressed }) => [styles.walletPicker, pressed && styles.pressed]}
          >
            <View style={styles.walletInfo}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#003535" />
              <View>
                <Text style={styles.walletName}>{selectedWallet?.name ?? 'Select Wallet'}</Text>
                <Text style={styles.walletBalance}>Current: {formatCurrency(currentBalance)}</Text>
              </View>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#707978" />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={handlePay}
          style={({ pressed }) => [
            styles.payButton, 
            pressed && styles.payButtonPressed,
            currentBalance < installment.amount && styles.payButtonDisabled
          ]}
          disabled={currentBalance < installment.amount}
        >
          <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.payButtonText}>Pay and Mark as Paid</Text>
        </Pressable>
      </ScrollView>

      {/* Wallet Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWalletModalVisible}
        onRequestClose={() => setIsWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Source</Text>
            {state.wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => {
                  setWalletId(wallet.id);
                  setIsWalletModalVisible(false);
                }}
              >
                <View style={styles.optionLead}>
                  <MaterialIcons name="account-balance-wallet" size={20} color="#707978" />
                  <Text style={styles.optionText}>{wallet.name}</Text>
                </View>
                {walletId === wallet.id && <MaterialIcons name="check" size={20} color="#003535" />}
              </Pressable>
            ))}
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: '#F0F4F4',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C6EDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#404848',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    gap: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  formSection: {
    gap: 12,
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#003535',
    letterSpacing: 1,
    marginLeft: 4,
  },
  walletPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  pressed: {
    backgroundColor: '#F0F4F4',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  walletBalance: {
    fontSize: 12,
    color: '#707978',
    marginTop: 2,
  },
  payButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#BFC8C8',
  },
  payButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 20,
  },
  walletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
});
