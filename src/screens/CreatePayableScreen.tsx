import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { createId } from '@/src/utils/createId';
import { getNowIsoString } from '@/src/utils/dateUtils';
import { Installment, Payable } from '@/src/domain/types';

type CreatePayableScreenProps = {
  onSaved: () => void;
  onBack: () => void;
};

export function CreatePayableScreen({ onSaved, onBack }: CreatePayableScreenProps) {
  const { addPayable } = useAppState();
  
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('1');
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const amount = parseFloat(totalAmount);
    const count = parseInt(installmentCount);

    if (!name || isNaN(amount) || isNaN(count) || count <= 0) {
      setError('Please enter a valid name, amount, and installment count.');
      return;
    }

    const payableId = createId('payable');
    const payable: Payable = {
      id: payableId,
      name,
      totalAmount: amount,
      createdAt: getNowIsoString(),
    };

    const installments: Installment[] = [];
    const installmentAmount = amount / count;

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        id: createId('inst'),
        payableId,
        amount: installmentAmount,
        dueDate: dueDate.toISOString(),
        status: 'unpaid',
      });
    }

    addPayable(payable, installments);
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
          <Text style={styles.title}>Add New Payable</Text>
          <Text style={styles.subtitle}>Track a new loan or PayLater installment.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name of Debt</Text>
            <TextInput
              placeholder="e.g. TikTok PayLater, Lending"
              placeholderTextColor="#BFC8C8"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currency}>₱</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#BFC8C8"
                style={styles.amountInput}
                value={totalAmount}
                onChangeText={setTotalAmount}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Months / Installments</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#BFC8C8"
                style={styles.input}
                value={installmentCount}
                onChangeText={setInstallmentCount}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date (First Due)</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#BFC8C8"
              style={styles.input}
              value={firstDueDate}
              onChangeText={setFirstDueDate}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
          >
            <MaterialIcons name="save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Schedule Payable</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    marginBottom: 32,
    paddingLeft: 48,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: -4,
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#707978',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003535',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    color: '#0D1C2F',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1C2F',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#003535',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 20,
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
});
