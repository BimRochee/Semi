import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { createId } from '@/src/utils/createId';
import { getNowIsoString } from '@/src/utils/dateUtils';

type AddExtraIncomeScreenProps = {
  onSaved: () => void;
  onBack: () => void;
};

export function AddExtraIncomeScreen({ onSaved, onBack }: AddExtraIncomeScreenProps) {
  const { state, dispatch } = useAppState();
  
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(state.wallets[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWallet = state.wallets.find((w) => w.id === walletId);

  const handleSave = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!walletId) {
      setError('Please select a wallet.');
      return;
    }

    dispatch({
      type: 'addMovement',
      payload: {
        id: createId('move'),
        type: 'income',
        amount: numericAmount,
        walletId,
        note: note.trim() || 'Extra Income',
        occurredAt: getNowIsoString(),
      },
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
            <MaterialIcons name="add-card" size={40} color="#003535" />
          </View>
          <Text style={styles.title}>Extra Money</Text>
          <Text style={styles.subtitle}>Add one-time income or found money to your wallet.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.amountField}>
            <Text style={styles.labelCaps}>AMOUNT RECEIVED</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currency}>₱</Text>
              <TextInput
                keyboardType="decimal-pad"
                autoFocus
                onChangeText={(val) => {
                  setError(null);
                  setAmount(val);
                }}
                placeholder="0.00"
                placeholderTextColor="#BFC8C8"
                style={styles.amountInput}
                value={amount}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.labelCaps}>ADD TO WALLET</Text>
            <Pressable
              onPress={() => setIsWalletModalVisible(true)}
              style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
            >
              <View style={styles.pickerContent}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#003535" />
                <Text style={styles.pickerText}>{selectedWallet?.name ?? 'Select Wallet'}</Text>
              </View>
              <MaterialIcons name="arrow-drop-down" size={24} color="#707978" />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.labelCaps}>NOTE (OPTIONAL)</Text>
            <TextInput
              onChangeText={setNote}
              placeholder="Found on road, gift, bonus, etc."
              placeholderTextColor="#BFC8C8"
              style={styles.textInput}
              value={note}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
          >
            <MaterialIcons name="check" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Add to Balance</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Wallet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWalletModalVisible}
        onRequestClose={() => setIsWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Target Wallet</Text>
            {state.wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => {
                  setWalletId(wallet.id);
                  setIsWalletModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{wallet.name}</Text>
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
    backgroundColor: '#E6EEFF',
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
    paddingHorizontal: 20,
  },
  form: {
    gap: 24,
  },
  amountField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    alignItems: 'center',
  },
  labelCaps: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 32,
    fontWeight: '700',
    color: '#003535',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0D1C2F',
    minWidth: 150,
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
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
  saveButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 12,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
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
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
});
