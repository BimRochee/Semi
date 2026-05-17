import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatCurrency } from '@/src/utils/formatCurrency';

type TransferScreenProps = {
  onSaved: () => void;
};

export function TransferScreen({ onSaved }: TransferScreenProps) {
  const { state, transferMoney } = useAppState();
  const [fromWalletId, setFromWalletId] = useState(state.wallets[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(state.wallets[1]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Withdrawal');
  const [error, setError] = useState<string | null>(null);
  
  const [isFromModalVisible, setIsFromModalVisible] = useState(false);
  const [isToModalVisible, setIsToModalVisible] = useState(false);

  const fromWallet = state.wallets.find((w) => w.id === fromWalletId);
  const toWallet = state.wallets.find((w) => w.id === toWalletId);

  const handleTransfer = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    if (!fromWalletId || !toWalletId || !numericAmount || numericAmount <= 0) {
      setError('Please select wallets and enter a valid amount.');
      return;
    }

    if (fromWalletId === toWalletId) {
      setError('Source and destination wallets must be different.');
      return;
    }

    transferMoney({
      fromWalletId,
      toWalletId,
      amount: numericAmount,
      note: note.trim() || 'Transfer',
    });

    onSaved();
  };

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialIcons color="#003535" name="swap-horiz" size={40} />
          </View>
          <Text style={styles.title}>Move Money</Text>
          <Text style={styles.subtitle}>Transfer balance between your accounts or withdraw cash.</Text>
        </View>

        <View style={styles.form}>
          {/* Amount Input */}
          <View style={styles.amountField}>
            <Text style={styles.capsLabel}>Transfer Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(val) => {
                  setError(null);
                  setAmount(val);
                }}
                placeholder="0.00"
                placeholderTextColor="#BFC8C8"
                style={styles.largeInput}
                value={amount}
              />
            </View>
          </View>

          {/* Wallet Selection Grid */}
          <View style={styles.bentoGrid}>
            <Pressable
              onPress={() => setIsFromModalVisible(true)}
              style={({ pressed }) => [styles.bentoCard, pressed && styles.cardPressed]}
            >
              <Text style={styles.capsLabel}>FROM ACCOUNT</Text>
              <View style={styles.bentoCardContent}>
                <MaterialIcons color="#BA1A1A" name="account-balance-wallet" size={20} />
                <Text numberOfLines={1} style={styles.bentoValue}>
                  {fromWallet?.name ?? 'Select Source'}
                </Text>
              </View>
            </Pressable>

            <View style={styles.connector}>
              <MaterialIcons name="arrow-forward" size={20} color="#707978" />
            </View>

            <Pressable
              onPress={() => setIsToModalVisible(true)}
              style={({ pressed }) => [styles.bentoCard, pressed && styles.cardPressed]}
            >
              <Text style={styles.capsLabel}>TO ACCOUNT</Text>
              <View style={styles.bentoCardContent}>
                <MaterialIcons color="#456646" name="account-balance-wallet" size={20} />
                <Text numberOfLines={1} style={styles.bentoValue}>
                  {toWallet?.name ?? 'Select Target'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Note Input */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Note / Reason</Text>
            <TextInput
              onChangeText={setNote}
              placeholder="Withdrawal, savings, etc."
              placeholderTextColor="#BFC8C8"
              style={styles.textInput}
              value={note}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Action */}
          {parseFloat(amount.replace(/,/g, '')) > 0 && (
            <Pressable
              onPress={handleTransfer}
              style={({ pressed }) => [styles.transferButton, pressed && styles.buttonPressed]}
            >
              <MaterialIcons color="#FFFFFF" name="check" size={24} />
              <Text style={styles.transferButtonText}>Confirm Transfer</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* From Wallet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFromModalVisible}
        onRequestClose={() => setIsFromModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Source Wallet</Text>
            {state.wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => {
                  setFromWalletId(wallet.id);
                  setIsFromModalVisible(false);
                }}
              >
                <Text style={styles.walletOptionText}>{wallet.name}</Text>
                {fromWalletId === wallet.id && <MaterialIcons name="check" size={20} color="#003535" />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* To Wallet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isToModalVisible}
        onRequestClose={() => setIsToModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Target Wallet</Text>
            {state.wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => {
                  setToWalletId(wallet.id);
                  setIsToModalVisible(false);
                }}
              >
                <Text style={styles.walletOptionText}>{wallet.name}</Text>
                {toWalletId === wallet.id && <MaterialIcons name="check" size={20} color="#003535" />}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#404848',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    gap: 24,
  },
  amountField: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  capsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#003535',
    marginRight: 8,
  },
  largeInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0D1C2F',
    minWidth: 150,
    textAlign: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 16,
    gap: 8,
  },
  cardPressed: {
    backgroundColor: '#F0F4F4',
  },
  bentoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bentoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1C2F',
    flex: 1,
  },
  connector: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldSection: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003535',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    color: '#0D1C2F',
  },
  transferButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 12,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
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
  walletOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
});
