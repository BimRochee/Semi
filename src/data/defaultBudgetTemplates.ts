import { BudgetTemplateItem } from '@/src/domain/types';

export const defaultBudgetTemplates: BudgetTemplateItem[] = [
  // 15th Salary Template (Basis: ₱6,700 | Total: ₱6,420 | Buffer: ₱280)
  { id: '15-apartment', cycle: '15th', category: 'Apartment', amount: 1250, defaultWalletId: 'wallet-bdo' },
  { id: '15-utilities', cycle: '15th', category: 'Water & Electricity', amount: 500, defaultWalletId: 'wallet-gcash' },
  { id: '15-rice', cycle: '15th', category: 'Rice', amount: 350, defaultWalletId: 'wallet-cash' },
  { id: '15-grooming', cycle: '15th', category: 'Grooming', amount: 200, defaultWalletId: 'wallet-cash' },
  { id: '15-stove', cycle: '15th', category: 'Stove', amount: 120, defaultWalletId: 'wallet-cash' },
  { id: '15-spices', cycle: '15th', category: 'Spices', amount: 100, defaultWalletId: 'wallet-cash' },
  { id: '15-viands', cycle: '15th', category: 'Viands', amount: 1700, defaultWalletId: 'wallet-cash' },
  { id: '15-others', cycle: '15th', category: 'Others', amount: 400, defaultWalletId: 'wallet-cash' },
  { id: '15-travel', cycle: '15th', category: 'Travel', amount: 450, defaultWalletId: 'wallet-cash' },
  { id: '15-wants', cycle: '15th', category: 'Wants', amount: 300, defaultWalletId: 'wallet-gcash' },
  { id: '15-gym', cycle: '15th', category: 'Gym', amount: 550, defaultWalletId: 'wallet-gcash' },
  { id: '15-emergency', cycle: '15th', category: 'Emergency Fund', amount: 500, defaultWalletId: 'wallet-emergency' },

  // 30th Salary Template (Basis: ₱8,500)
  { id: '30-apartment', cycle: '30th', category: 'Apartment', amount: 1250, defaultWalletId: 'wallet-bdo' },
  { id: '30-utilities', cycle: '30th', category: 'Water & Electricity', amount: 500, defaultWalletId: 'wallet-gcash' },
  { id: '30-rice', cycle: '30th', category: 'Rice', amount: 350, defaultWalletId: 'wallet-cash' },
  { id: '30-grooming', cycle: '30th', category: 'Grooming', amount: 100, defaultWalletId: 'wallet-cash' },
  { id: '30-stove', cycle: '30th', category: 'Stove', amount: 120, defaultWalletId: 'wallet-cash' },
  { id: '30-spices', cycle: '30th', category: 'Spices', amount: 100, defaultWalletId: 'wallet-cash' },
  { id: '30-viands', cycle: '30th', category: 'Viands', amount: 2000, defaultWalletId: 'wallet-cash' },
  { id: '30-others', cycle: '30th', category: 'Others', amount: 500, defaultWalletId: 'wallet-cash' },
  { id: '30-travel', cycle: '30th', category: 'Travel', amount: 450, defaultWalletId: 'wallet-cash' },
  { id: '30-wants', cycle: '30th', category: 'Wants', amount: 800, defaultWalletId: 'wallet-gcash' },
  { id: '30-savings', cycle: '30th', category: 'Emergency Fund / Savings', amount: 2000, defaultWalletId: 'wallet-emergency' },
];
