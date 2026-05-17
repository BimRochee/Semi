import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { useSalary } from '@/src/hooks/useSalary';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatShortDate, getNowIsoString } from '@/src/utils/dateUtils';

type AddSalaryScreenProps = {
  onSaved: (salaryEntryId: string) => void;
};

export function AddSalaryScreen({ onSaved }: AddSalaryScreenProps) {
  const { state } = useAppState();
  const { addSalary } = useSalary();
  const [selectedWalletId, setSelectedWalletId] = useState(state.wallets[0]?.id ?? '');
  const [amount, setAmount] = useState('6,800');
  const [cycle, setCycle] = useState<'15th' | '30th'>('15th');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);

  const selectedWallet = state.wallets.find((wallet) => wallet.id === selectedWalletId);
  const todayIso = useMemo(() => getNowIsoString(), []);

  const handleSave = () => {
    const cleanAmount = amount.replace(/,/g, '');
    const numericAmount = parseFloat(cleanAmount);

    if (!selectedWalletId || !numericAmount || numericAmount <= 0) {
      setError('Please select a wallet and enter a valid amount.');
      return;
    }

    const salaryEntryId = addSalary({
      cycle,
      receivedWalletId: selectedWalletId,
      amount: numericAmount,
      dateReceived: todayIso,
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    setError(null);
    onSaved(salaryEntryId);
  };

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Visual / Context */}
        <View style={styles.headerVisual}>
          <View style={styles.iconCircle}>
            <MaterialIcons color="#4B6C4C" name="payments" size={40} />
            <View style={styles.iconPulse} />
          </View>
          <Text style={styles.headerCopy}>Log your semi-monthly earnings to balance your cycle.</Text>
        </View>

        <View style={styles.form}>
          {/* Salary Amount Input */}
          <View style={styles.amountField}>
            <Text style={styles.capsLabel}>Salary Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                keyboardType="decimal-pad"
                onBlur={() => setIsFocused(false)}
                onChangeText={(value) => {
                  setError(null);
                  setAmount(value);
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="0.00"
                placeholderTextColor="#BFC8C8"
                style={styles.largeInput}
                value={amount}
              />
            </View>
            <View style={[styles.focusLine, isFocused && styles.focusLineActive]} />
          </View>

          {/* Salary Cycle Segmented Control */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Salary Cycle</Text>
            <View style={styles.segmentedControl}>
              <Pressable
                onPress={() => setCycle('15th')}
                style={[styles.segmentButton, cycle === '15th' && styles.segmentButtonActive]}>
                <Text style={[styles.segmentLabel, cycle === '15th' && styles.segmentLabelActive]}>
                  15th
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCycle('30th')}
                style={[styles.segmentButton, cycle === '30th' && styles.segmentButtonActive]}>
                <Text style={[styles.segmentLabel, cycle === '30th' && styles.segmentLabelActive]}>
                  30th
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Detailed Fields Grid */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <Text style={styles.capsLabel}>Date Received</Text>
              <View style={styles.bentoCardContent}>
                <MaterialIcons color="#456646" name="calendar-today" size={20} />
                <Text style={styles.bentoValue}>{formatShortDate(todayIso)}</Text>
              </View>
            </View>

            <Pressable 
              onPress={() => setIsWalletModalVisible(true)}
              style={({ pressed }) => [styles.bentoCard, pressed && styles.cardPressed]}
            >
              <Text style={styles.capsLabel}>Received Wallet</Text>
              <View style={styles.bentoCardContent}>
                <MaterialIcons color="#456646" name="account-balance-wallet" size={20} />
                <Text numberOfLines={1} style={styles.bentoValue}>
                  {selectedWallet?.name ?? 'Select Wallet'}
                </Text>
              </View>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={20} 
                color="#707978" 
                style={styles.dropdownIcon} 
              />
            </Pressable>
          </View>

          {/* Insight Card */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <MaterialIcons color="#FFFFFF" name="auto-awesome" size={14} />
              <Text style={styles.insightKicker}>Semi Insight</Text>
            </View>
            <Text style={styles.insightText}>
              Based on your last cycle, adding this will cover 85% of your fixed utilities.
            </Text>
            <View style={styles.insightShape} />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Primary Action */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}>
              <MaterialIcons color="#FFFFFF" name="save" size={24} />
              <Text style={styles.saveButtonText}>Save Salary</Text>
            </Pressable>
            <Text style={styles.disclaimerText}>ENCRYPTED AND SECURED TRANSACTION</Text>
          </View>
        </View>
      </ScrollView>

      {/* Wallet Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWalletModalVisible}
        onRequestClose={() => setIsWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Wallet</Text>
              <Pressable onPress={() => setIsWalletModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#003535" />
              </Pressable>
            </View>
            <ScrollView>
              {state.wallets.map((wallet) => (
                <Pressable
                  key={wallet.id}
                  style={styles.walletOption}
                  onPress={() => {
                    setSelectedWalletId(wallet.id);
                    setIsWalletModalVisible(false);
                  }}
                >
                  <MaterialIcons name="account-balance-wallet" size={20} color="#456646" />
                  <Text style={styles.walletOptionText}>{wallet.name}</Text>
                  {selectedWalletId === wallet.id && (
                    <MaterialIcons name="check-circle" size={20} color="#003535" />
                  )}
                </Pressable>
              ))}
              {state.wallets.length === 0 && (
                <Text style={styles.noWalletsText}>No wallets found. Please add a wallet first.</Text>
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
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 220,
    paddingHorizontal: 20,
  },
  headerVisual: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C6EDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  iconPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ABD0A9',
    opacity: 0.3,
  },
  headerCopy: {
    color: '#404848',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 240,
  },
  form: {
    gap: 32,
  },
  amountField: {
    alignItems: 'center',
    gap: 4,
  },
  capsLabel: {
    color: '#404848',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    color: '#456646',
    opacity: 0.5,
  },
  largeInput: {
    minWidth: 160,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    color: '#003535',
    textAlign: 'center',
  },
  focusLine: {
    height: 2,
    width: 128,
    backgroundColor: '#003535',
    opacity: 0.2,
    marginTop: 4,
  },
  focusLineActive: {
    opacity: 1,
  },
  fieldSection: {
    gap: 8,
  },
  fieldLabel: {
    color: '#404848',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    paddingLeft: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E6EEFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(191,200,200,0.3)',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#404848',
  },
  segmentLabelActive: {
    color: '#003535',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    borderRadius: 16,
    padding: 12,
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
  dropdownIcon: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  insightCard: {
    backgroundColor: '#003535',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  insightKicker: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 13,
    color: '#B4EDEC',
    lineHeight: 18,
    fontWeight: '500',
  },
  insightShape: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4B6C4C',
    opacity: 0.2,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionRow: {
    gap: 16,
  },
  saveButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#003535',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#707978',
    textAlign: 'center',
    letterSpacing: 1.5,
    fontWeight: '700',
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
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003535',
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  walletOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#0D1C2F',
    fontWeight: '500',
  },
  noWalletsText: {
    textAlign: 'center',
    color: '#707978',
    paddingVertical: 20,
  },
});
