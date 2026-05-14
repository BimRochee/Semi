import { BudgetTemplateItem } from '@/src/domain/types';

export const defaultBudgetTemplates: BudgetTemplateItem[] = [
  {
    id: 'tpl-apartment',
    label: 'Apartment',
    category: 'Housing',
    amount: 1250,
    targetWalletId: 'wallet-gcash',
  },
  {
    id: 'tpl-groceries',
    label: 'Groceries',
    category: 'Essentials',
    amount: 1800,
    targetWalletId: 'wallet-gcash',
  },
  {
    id: 'tpl-commute',
    label: 'Commute',
    category: 'Transport',
    amount: 750,
    targetWalletId: 'wallet-cash',
  },
  {
    id: 'tpl-emergency',
    label: 'Emergency Fund',
    category: 'Savings',
    amount: 1000,
    targetWalletId: 'wallet-emergency',
  },
];
