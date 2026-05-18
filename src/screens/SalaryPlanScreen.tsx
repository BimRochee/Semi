import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function SalaryPlanScreen({
  onAddSalary,
  onAddExtraMoney,
  onOpenBudgetTemplates,
}: {
  onAddSalary: () => void;
  onAddExtraMoney: () => void;
  onOpenBudgetTemplates: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Salary Plan</Text>
      
      <View style={styles.choiceMenu}>
        <Pressable 
          onPress={onAddSalary}
          style={({ pressed }) => [styles.choiceItem, pressed && styles.choicePressed]}
        >
          <View style={[styles.choiceIcon, { backgroundColor: '#C6EDC4' }]}>
            <MaterialIcons name="payments" size={24} color="#003535" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.choiceLabel}>New Salary</Text>
            <Text style={styles.choiceSub}>Log your semi-monthly salary payout and allocate budget.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#BFC8C8" />
        </Pressable>

        <Pressable 
          onPress={onAddExtraMoney}
          style={({ pressed }) => [styles.choiceItem, pressed && styles.choicePressed]}
        >
          <View style={[styles.choiceIcon, { backgroundColor: '#E6EEFF' }]}>
            <MaterialIcons name="add-card" size={24} color="#003535" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.choiceLabel}>Extra Money</Text>
            <Text style={styles.choiceSub}>Log gifts, bonuses, or found money.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#BFC8C8" />
        </Pressable>
        
        <Pressable 
          onPress={onOpenBudgetTemplates}
          style={({ pressed }) => [styles.choiceItem, pressed && styles.choicePressed]}
        >
          <View style={[styles.choiceIcon, { backgroundColor: '#F8F9FF' }]}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#003535" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.choiceLabel}>Budget Templates</Text>
            <Text style={styles.choiceSub}>Set default allocation rules for your salary.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#BFC8C8" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#003535',
    marginBottom: 24,
  },
  choiceMenu: {
    gap: 16,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
    borderWidth: 1,
    borderColor: '#EFF4FF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  choicePressed: {
    backgroundColor: '#EFF4FF',
    transform: [{ scale: 0.98 }],
  },
  choiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
  },
  choiceSub: {
    fontSize: 12,
    color: '#707978',
    marginTop: 2,
  },
});
