import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { BudgetTemplateItem, SalaryCycle, AllocationType } from '@/src/domain/types';
import { createId } from '@/src/utils/createId';

export function BudgetTemplateScreen() {
  const { state, updateBudgetTemplate, deleteBudgetTemplate, updateExpectedSalary } = useAppState();
  const [activeCycle, setActiveCycle] = useState<SalaryCycle>('15th');
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'plan' | 'actual'>('plan');
  
  // Modal State
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BudgetTemplateItem> | null>(null);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [isSalaryModalVisible, setIsSalaryModalVisible] = useState(false);
  const [tempSalary, setTempSalary] = useState('');

  const expectedSalary = state.expectedSalaries[activeCycle];
  const filteredTemplates = state.budgetTemplates.filter((t) => t.cycle === activeCycle);
  
  const allocatedTotal = useMemo(() => {
    return filteredTemplates.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTemplates]);

  const buffer = expectedSalary - allocatedTotal;

  // Actual mode calculations
  const now = new Date();
  const currentMonthEntries = state.salaryEntries.filter((entry) => {
    const entryDate = new Date(entry.dateReceived);
    return (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth()
    );
  });
  const activeSalaryEntries = currentMonthEntries.length > 0 ? currentMonthEntries : state.salaryEntries;

  const currentMonthAllocations = state.salaryAllocations.filter(alloc => 
    activeSalaryEntries.some(entry => entry.id === alloc.salaryEntryId)
  );
  
  const totalActualRemaining = currentMonthAllocations.reduce((sum, a) => sum + a.amount, 0);

  const handleSaveItem = () => {
    if (!editingItem?.category || !editingItem?.value || !editingItem?.defaultWalletId) return;

    const value = parseFloat(editingItem.value.toString());
    let amount = value;
    
    if (editingItem.allocationType === 'percentage') {
      amount = (value / 100) * expectedSalary;
    }

    updateBudgetTemplate({
      id: editingItem.id ?? createId('temp'),
      cycle: activeCycle,
      category: editingItem.category,
      allocationType: editingItem.allocationType ?? 'amount',
      value: value,
      amount: amount,
      defaultWalletId: editingItem.defaultWalletId,
    });

    setIsItemModalVisible(false);
    setEditingItem(null);
  };

  const openAddItem = () => {
    setEditingItem({
      allocationType: 'amount',
      value: 0,
      defaultWalletId: state.wallets[0]?.id,
    });
    setIsItemModalVisible(true);
  };

  const openEditItem = (item: BudgetTemplateItem) => {
    setEditingItem(item);
    setIsItemModalVisible(true);
  };

  const handleDeleteItem = (id: string) => {
    deleteBudgetTemplate(id);
    setIsItemModalVisible(false);
    setEditingItem(null);
  };

  const handleUpdateExpectedSalary = () => {
    const val = parseFloat(tempSalary.replace(/,/g, ''));
    if (!isNaN(val)) {
      updateExpectedSalary(activeCycle, val);
      
      // Recalculate all percentage-based templates for this cycle
      state.budgetTemplates
        .filter(t => t.cycle === activeCycle && t.allocationType === 'percentage')
        .forEach(t => {
          updateBudgetTemplate({
            ...t,
            amount: (t.value / 100) * val
          });
        });
    }
    setIsSalaryModalVisible(false);
  };

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* View Mode Switcher */}
        <View style={styles.viewModeSwitcher}>
          <Pressable
            onPress={() => { setViewMode('plan'); setIsEditing(false); }}
            style={[styles.viewModeBtn, viewMode === 'plan' && styles.viewModeBtnActive]}
          >
            <Text style={[styles.viewModeText, viewMode === 'plan' && styles.viewModeTextActive]}>The Plan (Templates)</Text>
          </Pressable>
          <Pressable
            onPress={() => { setViewMode('actual'); setIsEditing(false); }}
            style={[styles.viewModeBtn, viewMode === 'actual' && styles.viewModeBtnActive]}
          >
            <Text style={[styles.viewModeText, viewMode === 'actual' && styles.viewModeTextActive]}>Actual Balances</Text>
          </Pressable>
        </View>

        {viewMode === 'plan' ? (
          <>
            {/* Cycle Switcher */}
            <View style={styles.segmentedControl}>
          {(['15th', '30th'] as SalaryCycle[]).map((cycle) => (
            <Pressable
              key={cycle}
              onPress={() => {
                setActiveCycle(cycle);
                setIsEditing(false);
              }}
              style={[styles.segmentButton, activeCycle === cycle && styles.segmentButtonActive]}>
              <Text style={[styles.segmentLabel, activeCycle === cycle && styles.segmentLabelActive]}>
                {cycle === '15th' ? '1st Half' : '2nd Half'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Header Summary */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerCol}>
              <Text style={styles.headerLabel}>EXPECTED SALARY</Text>
              <Pressable 
                onPress={() => {
                  setTempSalary(expectedSalary.toString());
                  setIsSalaryModalVisible(true);
                }}
                style={styles.salaryPressable}
              >
                <Text style={styles.headerValuePrimary}>{formatCurrency(expectedSalary)}</Text>
                <MaterialIcons name="edit" size={14} color="#B4EDEC" />
              </Pressable>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerCol}>
              <Text style={styles.headerLabel}>BUFFER</Text>
              <Text style={[styles.headerValueSecondary, buffer < 0 && styles.textError]}>
                {formatCurrency(buffer)}
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (allocatedTotal / expectedSalary) * 100)}%` },
                  buffer < 0 && { backgroundColor: '#BA1A1A' }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatCurrency(allocatedTotal)} Allocated ({( (allocatedTotal / expectedSalary) * 100 ).toFixed(1)}%)
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Salary Allocation Plan</Text>
          <Pressable 
            onPress={() => setIsEditing(!isEditing)}
            style={[styles.editModeButton, isEditing && styles.editModeButtonActive]}
          >
            <MaterialIcons name={isEditing ? 'check' : 'edit'} size={18} color={isEditing ? '#FFFFFF' : '#003535'} />
            <Text style={[styles.editModeText, isEditing && styles.editModeTextActive]}>
              {isEditing ? 'Done' : 'Edit Plan'}
            </Text>
          </Pressable>
        </View>

        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment" size={48} color="#BFC8C8" />
            <Text style={styles.emptyText}>No allocations planned yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredTemplates.map((item) => {
              const wallet = state.wallets.find(w => w.id === item.defaultWalletId);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => isEditing && openEditItem(item)}
                  style={({ pressed }) => [
                    styles.itemCard,
                    pressed && isEditing && styles.itemPressed
                  ]}
                >
                  <View style={styles.itemMain}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemWallet}>{wallet?.name ?? 'No Wallet'}</Text>
                  </View>
                  <View style={styles.itemAmountCol}>
                    <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.itemPercent}>
                      {((item.amount / expectedSalary) * 100).toFixed(2)}%
                    </Text>
                  </View>
                  {isEditing && (
                    <View style={styles.itemEditIndicator}>
                      <MaterialIcons name="chevron-right" size={20} color="#BFC8C8" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

            {isEditing && (
              <Pressable
                onPress={openAddItem}
                style={({ pressed }) => [styles.addItemButton, pressed && styles.addItemPressed]}
              >
                <MaterialIcons name="add" size={24} color="#003535" />
                <Text style={styles.addItemText}>Add New Allocation</Text>
              </Pressable>
            )}
          </>
        ) : (
          /* Actual Mode View */
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View style={styles.headerCol}>
                  <Text style={styles.headerLabel}>TOTAL REMAINING IN ENVELOPES</Text>
                  <Text style={styles.headerValuePrimary}>{formatCurrency(totalActualRemaining)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Month Envelopes</Text>
            </View>

            {currentMonthAllocations.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="account-balance-wallet" size={48} color="#BFC8C8" />
                <Text style={styles.emptyText}>No allocations generated for this month yet.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {currentMonthAllocations.map((alloc) => {
                  const template = state.budgetTemplates.find(t => t.id === alloc.category);
                  const displayName = template ? template.category : alloc.category;
                  const originalAmount = template ? template.amount : alloc.amount;
                  const deducted = originalAmount - alloc.amount;

                  return (
                    <View key={alloc.id} style={styles.itemCard}>
                      <View style={styles.itemMain}>
                        <Text style={styles.itemCategory}>{displayName}</Text>
                        <Text style={styles.itemWallet}>
                          {deducted > 0 ? `Spent/Deducted: ${formatCurrency(deducted)}` : 'Fully Intact'}
                        </Text>
                      </View>
                      <View style={styles.itemAmountCol}>
                        <Text style={styles.itemAmount}>{formatCurrency(alloc.amount)}</Text>
                        <Text style={styles.itemPercent}>Remaining</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Item Editor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isItemModalVisible}
        onRequestClose={() => setIsItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem?.id ? 'Edit' : 'Add'} Allocation</Text>
              {editingItem?.id && (
                <Pressable onPress={() => handleDeleteItem(editingItem.id!)}>
                  <MaterialIcons name="delete-outline" size={24} color="#BA1A1A" />
                </Pressable>
              )}
            </View>

            <View style={styles.modalForm}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Category Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Rent, Savings"
                  placeholderTextColor="#BFC8C8"
                  value={editingItem?.category}
                  onChangeText={(val) => setEditingItem(prev => ({ ...prev!, category: val }))}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Target Wallet</Text>
                <Pressable 
                  onPress={() => setIsWalletModalVisible(true)}
                  style={styles.modalPicker}
                >
                  <Text style={styles.pickerValue}>
                    {state.wallets.find(w => w.id === editingItem?.defaultWalletId)?.name ?? 'Select Wallet'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#707978" />
                </Pressable>
              </View>

              <View style={styles.typeRow}>
                <Pressable 
                  onPress={() => setEditingItem(prev => ({ ...prev!, allocationType: 'amount' }))}
                  style={[styles.typeButton, editingItem?.allocationType === 'amount' && styles.typeButtonActive]}
                >
                  <Text style={[styles.typeLabel, editingItem?.allocationType === 'amount' && styles.typeLabelActive]}>Exact Amount</Text>
                </Pressable>
                <Pressable 
                  onPress={() => setEditingItem(prev => ({ ...prev!, allocationType: 'percentage' }))}
                  style={[styles.typeButton, editingItem?.allocationType === 'percentage' && styles.typeButtonActive]}
                >
                  <Text style={[styles.typeLabel, editingItem?.allocationType === 'percentage' && styles.typeLabelActive]}>Percentage</Text>
                </Pressable>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>
                  {editingItem?.allocationType === 'amount' ? 'Amount (₱)' : 'Percent (%)'}
                </Text>
                <TextInput
                  style={styles.modalInputLarge}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#BFC8C8"
                  value={editingItem?.value?.toString()}
                  onChangeText={(val) => setEditingItem(prev => ({ ...prev!, value: parseFloat(val) || 0 }))}
                />
                {editingItem?.allocationType === 'percentage' && (
                  <Text style={styles.modalHint}>
                    Computes to {formatCurrency((editingItem.value! / 100) * expectedSalary)}
                  </Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable 
                  onPress={() => setIsItemModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handleSaveItem}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmText}>Save Allocation</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expected Salary Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSalaryModalVisible}
        onRequestClose={() => setIsSalaryModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.salaryModal}>
            <Text style={styles.modalTitle}>Expected {activeCycle} Salary</Text>
            <Text style={styles.modalSub}>This is the basis for your percentage calculations.</Text>
            <TextInput
              style={styles.salaryInput}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="0.00"
              placeholderTextColor="#BFC8C8"
              value={tempSalary}
              onChangeText={setTempSalary}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsSalaryModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleUpdateExpectedSalary} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Update</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wallet Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWalletModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentMini}>
            <Text style={styles.modalTitle}>Select Wallet</Text>
            {state.wallets.map(w => (
              <Pressable
                key={w.id}
                onPress={() => {
                  setEditingItem(prev => ({ ...prev!, defaultWalletId: w.id }));
                  setIsWalletModalVisible(false);
                }}
                style={styles.walletOption}
              >
                <Text style={styles.optionText}>{w.name}</Text>
                {editingItem?.defaultWalletId === w.id && <MaterialIcons name="check" size={20} color="#003535" />}
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
    paddingBottom: 100,
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#DDE9FF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  viewModeBtnActive: {
    backgroundColor: '#0D4D4D',
    elevation: 4,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003535',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E6EEFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404848',
  },
  segmentLabelActive: {
    color: '#003535',
  },
  headerCard: {
    backgroundColor: '#003535',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerCol: {
    flex: 1,
  },
  headerDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B4EDEC',
    letterSpacing: 1,
    marginBottom: 4,
  },
  salaryPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerValuePrimary: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerValueSecondary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C6EDC4',
  },
  textError: {
    color: '#FFB4AB',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C6EDC4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#B4EDEC',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003535',
  },
  editModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  editModeButtonActive: {
    backgroundColor: '#003535',
    borderColor: '#003535',
  },
  editModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003535',
  },
  editModeTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  itemPressed: {
    backgroundColor: '#F0F4F4',
  },
  itemMain: {
    flex: 1,
    gap: 2,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  itemWallet: {
    fontSize: 12,
    color: '#707978',
  },
  itemAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
  },
  itemPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#707978',
  },
  itemEditIndicator: {
    marginLeft: 12,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BFC8C8',
    marginTop: 20,
  },
  addItemPressed: {
    backgroundColor: '#EFF4FF',
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003535',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: '#BFC8C8',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalContentMini: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '40%',
  },
  salaryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
  },
  modalSub: {
    fontSize: 14,
    color: '#707978',
  },
  modalForm: {
    gap: 20,
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0D1C2F',
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  modalInputLarge: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 12,
    color: '#456646',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  typeButtonActive: {
    backgroundColor: '#003535',
    borderColor: '#003535',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#404848',
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#404848',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#003535',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  salaryInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#003535',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
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
