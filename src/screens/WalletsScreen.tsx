import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useWallets } from '@/src/hooks/useWallets';
import { WalletType } from '@/src/domain/types';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function WalletsScreen({ onOpenTransfer }: { onOpenTransfer?: () => void }) {
  const { walletSummaries, addWallet, updateWallet, deleteWallet } = useWallets();

  // Form State
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('Digital Wallet');
  const [startingBalance, setStartingBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingWalletId(null);
    setIsFormVisible(false);
    setName('');
    setType('Digital Wallet');
    setStartingBalance('');
    setError(null);
  };

  const handleSubmitWallet = () => {
    if (!name || !startingBalance) {
      setError('Please fill in all fields.');
      return;
    }

    const numericBalance = parseFloat(startingBalance);
    if (isNaN(numericBalance)) {
      setError('Enter a valid starting balance.');
      return;
    }

    if (editingWalletId) {
      updateWallet({
        id: editingWalletId,
        name,
        type,
        startingBalance: numericBalance,
      });
    } else {
      addWallet({
        name,
        type,
        startingBalance: numericBalance,
      });
    }

    resetForm();
  };

  const handleDeleteWallet = () => {
    if (!editingWalletId) return;

    Alert.alert(
      'Delete Wallet',
      'This will permanently remove this wallet. Note that transaction history for this wallet will be hidden from the ledger.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive', 
          onPress: () => {
            deleteWallet(editingWalletId);
            resetForm();
          } 
        },
      ]
    );
  };

  const handleStartEdit = (wallet: (typeof walletSummaries)[number]) => {
    setEditingWalletId(wallet.id);
    setIsFormVisible(true);
    setName(wallet.name);
    setType(wallet.type);
    setStartingBalance(wallet.startingBalance.toString());
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* My Wallets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Wallets</Text>
          <Text style={styles.sectionCount}>{walletSummaries.length} Total</Text>
        </View>

        <View style={styles.cardStack}>
          {walletSummaries.map((wallet) => {
            const isEditingThis = editingWalletId === wallet.id;
            return (
              <View key={wallet.id} style={{ gap: 12 }}>
                <View style={styles.walletCard}>
                  <View style={styles.cardLead}>
                    <View style={[styles.iconBox, getIconBoxStyle(wallet.type)]}>
                      <MaterialIcons
                        color={getIconColor(wallet.type)}
                        name={getWalletIcon(wallet.type)}
                        size={24}
                      />
                    </View>
                    <View>
                      <Text style={styles.walletTypeLabel}>{wallet.type}</Text>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                    </View>
                  </View>

                  <View style={styles.cardTrail}>
                    <View style={styles.balanceInfo}>
                      <Text style={styles.balanceLabel}>Balance</Text>
                      <Text style={styles.balanceValue}>{formatCurrency(wallet.currentBalance)}</Text>
                    </View>
                    <Pressable onPress={() => handleStartEdit(wallet)} style={styles.editButton}>
                      <MaterialIcons color="#707978" name="edit" size={20} />
                    </Pressable>
                  </View>
                </View>

                {isEditingThis && (
                  <View style={[styles.addFormSection, { marginTop: -4, marginBottom: 8 }]}>
                    <View style={styles.addFormHeader}>
                      <View style={styles.headerTitleRow}>
                        <MaterialIcons color="#003535" name="edit" size={24} />
                        <Text style={styles.addFormTitle}>Edit Wallet</Text>
                      </View>
                      <Pressable onPress={resetForm} style={styles.closeButton}>
                        <MaterialIcons color="#707978" name="close" size={24} />
                      </Pressable>
                    </View>

                    <View style={styles.formStack}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Wallet Name</Text>
                        <TextInput
                          placeholder="e.g. GCash or Savings Account"
                          placeholderTextColor="#bfc8c8"
                          style={styles.textInput}
                          value={name}
                          onChangeText={setName}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Wallet Type</Text>
                        <View style={styles.typeSelector}>
                          {(
                            ['Digital Wallet', 'Bank Account', 'Physical Wallet', 'Savings Account'] as WalletType[]
                          ).map((t) => (
                            <Pressable
                              key={t}
                              onPress={() => setType(t)}
                              style={[styles.typeOption, type === t && styles.typeOptionActive]}>
                              <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>
                                {t}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Starting Balance</Text>
                        <View style={styles.amountInputRow}>
                          <Text style={styles.currencySymbol}>PHP</Text>
                          <TextInput
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor="#bfc8c8"
                            style={styles.amountInput}
                            value={startingBalance}
                            onChangeText={setStartingBalance}
                          />
                        </View>
                      </View>

                      {error ? <Text style={styles.errorText}>{error}</Text> : null}

                      <View style={styles.actionRow}>
                        <Pressable
                          onPress={handleDeleteWallet}
                          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
                          <MaterialIcons color="#BA1A1A" name="delete-outline" size={24} />
                        </Pressable>

                        <Pressable
                          onPress={handleSubmitWallet}
                          style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}>
                          <MaterialIcons color="#FFFFFF" name="save" size={24} />
                          <Text style={styles.createButtonText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Add New Wallet Section */}
      {!isFormVisible ? (
        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => setIsFormVisible(true)}
            style={({ pressed }) => [styles.expandButton, pressed && styles.expandButtonPressed]}>
            <MaterialIcons color="#003535" name="add-circle-outline" size={24} />
            <Text style={styles.expandButtonText}>ADD NEW WALLET</Text>
          </Pressable>
          
          {onOpenTransfer && (
            <Pressable
              onPress={onOpenTransfer}
              style={({ pressed }) => [styles.expandButton, pressed && styles.expandButtonPressed, { backgroundColor: '#E6EEFF', borderColor: '#BFC8C8' }]}>
              <MaterialIcons color="#003535" name="swap-horiz" size={24} />
              <Text style={styles.expandButtonText}>TRANSFER MONEY</Text>
            </Pressable>
          )}
        </View>
      ) : editingWalletId === null ? (
        <View style={styles.addFormSection}>
          <View style={styles.addFormHeader}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons color="#003535" name="add-circle" size={24} />
              <Text style={styles.addFormTitle}>Add New Wallet</Text>
            </View>
            <Pressable onPress={resetForm} style={styles.closeButton}>
              <MaterialIcons color="#707978" name="close" size={24} />
            </Pressable>
          </View>

          <View style={styles.formStack}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wallet Name</Text>
              <TextInput
                placeholder="e.g. GCash or Savings Account"
                placeholderTextColor="#bfc8c8"
                style={styles.textInput}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wallet Type</Text>
              <View style={styles.typeSelector}>
                {(
                  ['Digital Wallet', 'Bank Account', 'Physical Wallet', 'Savings Account'] as WalletType[]
                ).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={[styles.typeOption, type === t && styles.typeOptionActive]}>
                    <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Starting Balance</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>PHP</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#bfc8c8"
                  style={styles.amountInput}
                  value={startingBalance}
                  onChangeText={setStartingBalance}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <Pressable
                onPress={handleSubmitWallet}
                style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}>
                <MaterialIcons color="#FFFFFF" name="add" size={24} />
                <Text style={styles.createButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function getWalletIcon(type: WalletType): any {
  switch (type) {
    case 'Bank Account':
      return 'account-balance';
    case 'Digital Wallet':
      return 'account-balance-wallet';
    case 'Physical Wallet':
      return 'payments';
    case 'Savings Account':
      return 'savings';
    default:
      return 'wallet';
  }
}

function getIconBoxStyle(type: WalletType): any {
  switch (type) {
    case 'Bank Account':
      return { backgroundColor: '#0D1C2F' };
    case 'Digital Wallet':
      return { backgroundColor: '#0D4D4D' };
    case 'Physical Wallet':
      return { backgroundColor: '#C6EDC4' };
    case 'Savings Account':
      return { backgroundColor: '#394844' };
    default:
      return { backgroundColor: '#E6EEFF' };
  }
}

function getIconColor(type: WalletType): string {
  switch (type) {
    case 'Bank Account':
      return '#FFFFFF';
    case 'Digital Wallet':
      return '#B4EDEC';
    case 'Physical Wallet':
      return '#456646';
    case 'Savings Account':
      return '#D5E6E0';
    default:
      return '#003535';
  }
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 160,
    backgroundColor: '#F8F9FF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#404848',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardStack: {
    gap: 16,
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTypeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  walletName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  cardTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#404848',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#456646',
  },
  editButton: {
    padding: 8,
  },
  expandButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BFC8C8',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  expandButtonPressed: {
    backgroundColor: '#EFF4FF',
    borderColor: '#003535',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003535',
    letterSpacing: 1,
  },
  addFormSection: {
    backgroundColor: '#EFF4FF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  addFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  addFormTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
  },
  formStack: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#404848',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#BFC8C8',
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0D1C2F',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  typeOptionActive: {
    backgroundColor: '#003535',
    borderColor: '#003535',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#404848',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#BFC8C8',
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003535',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#003535',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#003535',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  createButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    minWidth: 104,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: '#404848',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 12,
    textAlign: 'center',
  },
  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFDAD6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    backgroundColor: '#FFDAD6',
  },
});
