import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAppState } from '@/src/hooks/useAppState';
import { useWallets } from '@/src/hooks/useWallets';
import { formatCurrency } from '@/src/utils/formatCurrency';

type BalanceReconciliationScreenProps = {
  onBack: () => void;
  onSaved: () => void;
};

export function BalanceReconciliationScreen({ onBack, onSaved }: BalanceReconciliationScreenProps) {
  const { walletSummaries } = useWallets();
  const { state, syncWalletBalances } = useAppState();

  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    walletSummaries[0]?.id || ''
  );
  
  const selectedWallet = useMemo(() => 
    walletSummaries.find(w => w.id === selectedWalletId), 
  [walletSummaries, selectedWalletId]);

  const [actualBalanceStr, setActualBalanceStr] = useState<string>(() => {
    if (selectedWallet && selectedWallet.currentBalance > 0) {
      return selectedWallet.currentBalance.toString();
    }
    return '';
  });

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [deductions, setDeductions] = useState<Record<string, string>>({});

  const currentBalance = selectedWallet?.currentBalance || 0;
  const actualBalance = parseFloat((actualBalanceStr || '').replace(/,/g, '')) || 0;
  const diff = actualBalance - currentBalance;
  const deficit = diff < 0 ? Math.abs(diff) : 0;

  const totalDeducted = useMemo(() => {
    return Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [deductions]);

  const remainingToDistribute = deficit - totalDeducted;

  const now = new Date();
  const currentMonthEntries = state.salaryEntries.filter((entry) => {
    const entryDate = new Date(entry.dateReceived);
    return (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth()
    );
  });
  const activeSalaryEntries = currentMonthEntries.length > 0 ? currentMonthEntries : state.salaryEntries;

  const availableAllocations = useMemo(() => {
    return state.salaryAllocations.filter((a) => 
      a.amount > 0 && 
      activeSalaryEntries.some(entry => entry.id === a.salaryEntryId)
    );
  }, [state.salaryAllocations, activeSalaryEntries]);

  const handleWalletSelect = () => {
    // In a real app we might open a modal here.
    // For now we'll just cycle through wallets if they tap it.
    const currentIndex = walletSummaries.findIndex(w => w.id === selectedWalletId);
    const nextIndex = (currentIndex + 1) % walletSummaries.length;
    const nextWallet = walletSummaries[nextIndex];
    setSelectedWalletId(nextWallet.id);
    setActualBalanceStr(nextWallet.currentBalance > 0 ? nextWallet.currentBalance.toString() : '');
    setDeductions({}); // reset deductions on wallet switch
  };

  const handleSave = () => {
    if (!selectedWallet) return;

    const adjs = [];
    if (diff !== 0) {
      adjs.push({ walletId: selectedWallet.id, diff, note: diff > 0 ? 'Balance correction / extra money adjustment' : 'Balance Reconciliation' });
    }

    const deds = Object.entries(deductions)
      .map(([id, amount]) => ({ allocationId: id, amount: parseFloat(amount) || 0 }))
      .filter((d) => d.amount > 0);

    syncWalletBalances(adjs, deds);
    onSaved();
  };

  const incrementDeduction = (allocId: string, maxAmount: number) => {
    setDeductions(prev => {
      const current = parseFloat(prev[allocId]) || 0;
      const amountToAdd = Math.min(100, remainingToDistribute, maxAmount - current);
      if (amountToAdd <= 0) return prev;
      return { ...prev, [allocId]: (current + amountToAdd).toString() };
    });
  };

  const decrementDeduction = (allocId: string) => {
    setDeductions(prev => {
      const current = parseFloat(prev[allocId]) || 0;
      const amountToSub = Math.min(100, current);
      if (amountToSub <= 0) return prev;
      const newAmount = current - amountToSub;
      return { ...prev, [allocId]: newAmount > 0 ? newAmount.toString() : '' };
    });
  };

  const handleDeductionInput = (allocId: string, val: string, maxAmount: number) => {
    if (val === '' || val === '.') {
      setDeductions(prev => ({ ...prev, [allocId]: val }));
      return;
    }
    
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return;

    const otherDeductionsTotal = Object.entries(deductions)
      .filter(([id]) => id !== allocId)
      .reduce((sum, [, amt]) => sum + (parseFloat(amt) || 0), 0);
      
    const maxAllowedHere = deficit - otherDeductionsTotal;
    const absoluteMax = Math.min(maxAmount, maxAllowedHere);

    if (num > absoluteMax) {
      setDeductions(prev => ({ ...prev, [allocId]: absoluteMax.toString() }));
    } else {
      setDeductions(prev => ({ ...prev, [allocId]: val }));
    }
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={24} color="#003535" />
            </Pressable>
            <Text style={styles.headerTitle}>Update Actual Balance</Text>
          </View>
          <View style={styles.avatarContainer}>
            {state.settings.profilePictureUri ? (
              <Image source={{ uri: state.settings.profilePictureUri }} style={styles.avatar} contentFit="cover" />
            ) : (
              <MaterialIcons color="#003535" name="person" size={20} />
            )}
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Wallet Selector */}
          <View style={styles.section}>
            <Text style={styles.labelCaps}>RECONCILING WALLET</Text>
            <Pressable 
              onPress={handleWalletSelect}
              style={({ pressed }) => [styles.walletSelector, pressed && styles.pressed]}
            >
              <View style={styles.walletSelectorInner}>
                <View style={styles.walletIconBox}>
                  <MaterialIcons name="account-balance" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.walletSelectorName}>{selectedWallet?.name || 'Select Wallet'}</Text>
                  {selectedWallet?.isIncludedInTotal && <Text style={styles.walletSelectorSub}>Primary Account</Text>}
                </View>
              </View>
              {walletSummaries.length > 1 && (
                <MaterialIcons name="expand-more" size={24} color="#707978" />
              )}
            </Pressable>
          </View>

          {/* Current App Balance */}
          <View style={styles.appBalanceSection}>
            <Text style={styles.labelCaps}>CURRENT APP BALANCE</Text>
            <Text style={styles.appBalanceText}>{formatCurrency(currentBalance)}</Text>
          </View>

          {/* Actual Bank Balance Input */}
          <View style={styles.section}>
            <Text style={styles.labelCaps}>ACTUAL BANK BALANCE</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputSymbol}>₱</Text>
              <TextInput
                style={[styles.actualInput, isInputFocused && styles.actualInputFocused]}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#BFC8C8"
                value={actualBalanceStr}
                onChangeText={setActualBalanceStr}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
            </View>
            <Text style={styles.inputHelperText}>
              Enter the exact amount shown in your banking app.
            </Text>
          </View>

          {/* Dynamic Difference Card */}
          {diff < 0 && (
            <View style={styles.differenceCard}>
              <View style={styles.differenceIconBox}>
                <MaterialIcons name="warning" size={20} color="#93000A" />
              </View>
              <View style={styles.differenceTextCol}>
                <Text style={styles.differenceTitle}>{formatCurrency(deficit)} Unaccounted Spending</Text>
                <Text style={styles.differenceDesc}>
                  Your actual balance is lower than the app's record. Distribute this amount to your categories.
                </Text>
              </View>
            </View>
          )}
          {diff > 0 && (
            <View style={[styles.differenceCard, { backgroundColor: '#C6EDC440', borderColor: '#45664640' }]}>
              <View style={[styles.differenceIconBox, { backgroundColor: '#C6EDC4' }]}>
                <MaterialIcons name="info" size={20} color="#003535" />
              </View>
              <View style={styles.differenceTextCol}>
                <Text style={[styles.differenceTitle, { color: '#003535' }]}>{formatCurrency(diff)} Extra Funds</Text>
                <Text style={styles.differenceDesc}>
                  You have more money than recorded. This will be added to your unassigned funds.
                </Text>
              </View>
            </View>
          )}

          {/* Settle Difference */}
          {diff < 0 && (
            <View style={styles.section}>
              <View style={styles.settleHeader}>
                <Text style={styles.settleTitle}>Deduct from:</Text>
                <View style={styles.remainingBadge}>
                  <Text style={styles.remainingBadgeText}>
                    {formatCurrency(remainingToDistribute)} REMAINING
                  </Text>
                </View>
              </View>

              <View style={styles.envelopeList}>
                {availableAllocations.map((alloc) => {
                  const currentAmount = alloc.amount;
                  const deducted = parseFloat(deductions[alloc.id]) || 0;
                  const newAmount = currentAmount - deducted;

                  const template = state.budgetTemplates.find((t) => t.id === alloc.category);
                  const displayName = template ? template.category : alloc.category;

                  return (
                    <View key={alloc.id} style={styles.envelopeCard}>
                      <View style={styles.envelopeCardTop}>
                        <View style={styles.envelopeCardTitleRow}>
                          <MaterialIcons name="shopping-basket" size={20} color="#003535" />
                          <Text style={styles.envelopeName}>{displayName}</Text>
                        </View>
                        <Text style={styles.envelopeAmount}>{formatCurrency(newAmount)}</Text>
                      </View>

                      <View style={styles.envelopeControlRow}>
                        <Pressable 
                          onPress={() => decrementDeduction(alloc.id)}
                          style={({pressed}) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
                        >
                          <MaterialIcons name="remove" size={20} color="#003535" />
                        </Pressable>

                        <View style={styles.deductionInputContainer}>
                          <Text style={styles.deductionInputSymbol}>₱</Text>
                          <TextInput
                            style={styles.deductionInput}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor="#BFC8C8"
                            value={deductions[alloc.id] || ''}
                            onChangeText={(val) => handleDeductionInput(alloc.id, val, currentAmount)}
                          />
                        </View>

                        <Pressable 
                          onPress={() => incrementDeduction(alloc.id, currentAmount)}
                          style={({pressed}) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
                        >
                          <MaterialIcons name="add" size={20} color="#003535" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {/* Primary Action Button */}
          <View style={styles.footer}>
            <Pressable
              disabled={diff < 0 && remainingToDistribute !== 0}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.primaryBtn,
                (diff < 0 && remainingToDistribute !== 0) && styles.disabledBtn,
                pressed && remainingToDistribute === 0 && styles.primaryBtnPressed,
              ]}>
              <Text style={[styles.primaryBtnText, (diff < 0 && remainingToDistribute !== 0) && styles.disabledBtnText]}>
                Save Adjustment
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  flex1: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDE9FF',
    borderWidth: 1,
    borderColor: '#BFC8C840',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  labelCaps: {
    fontSize: 12,
    fontFamily: 'Hanken Grotesk', // Make sure this is loaded or fall back
    fontWeight: '700',
    color: '#404848',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  walletSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E2E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  walletSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0D4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletSelectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003535',
  },
  walletSelectorSub: {
    fontSize: 14,
    color: '#707978',
  },
  appBalanceSection: {
    marginBottom: 32,
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    paddingVertical: 24,
    borderRadius: 16,
  },
  appBalanceText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#003535',
    letterSpacing: -0.8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSymbol: {
    position: 'absolute',
    left: 0,
    fontSize: 40,
    fontWeight: '700',
    color: '#BFC8C8',
    zIndex: 1,
  },
  actualInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '700',
    color: '#003535',
    borderBottomWidth: 2,
    borderBottomColor: '#BFC8C84D',
    paddingLeft: 36,
    paddingVertical: 8,
    letterSpacing: -0.8,
  },
  actualInputFocused: {
    borderBottomColor: '#003535',
  },
  inputHelperText: {
    fontSize: 14,
    color: '#404848',
    fontStyle: 'italic',
    marginTop: 4,
  },
  differenceCard: {
    backgroundColor: '#FFDAD633', // 20% opacity
    borderWidth: 1,
    borderColor: '#BA1A1A33', // 20% opacity
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  differenceIconBox: {
    backgroundColor: '#FFDAD6',
    padding: 8,
    borderRadius: 20,
  },
  differenceTextCol: {
    flex: 1,
  },
  differenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93000A',
    marginBottom: 4,
  },
  differenceDesc: {
    fontSize: 14,
    color: '#404848',
    lineHeight: 20,
  },
  settleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  remainingBadge: {
    backgroundColor: '#C6EDC4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  remainingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6C4C',
    letterSpacing: 0.6,
  },
  envelopeList: {
    gap: 16,
  },
  envelopeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C833',
    borderRadius: 12,
    padding: 16,
  },
  envelopeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  envelopeCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  envelopeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#003535',
  },
  envelopeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
  },
  envelopeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepBtnPressed: {
    backgroundColor: '#D5E3FD',
  },
  deductionInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFC8C833',
    paddingHorizontal: 12,
    height: 40,
  },
  deductionInputSymbol: {
    fontSize: 16,
    color: '#707978',
    fontWeight: '600',
    marginRight: 4,
  },
  deductionInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#0D4D4D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#003535',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  disabledBtn: {
    backgroundColor: '#B9CAC4',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtnText: {
    color: '#3B4A46',
  },
});
