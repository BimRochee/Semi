import { BudgetTemplateItem } from '@/src/domain/types';

export const defaultBudgetTemplates: BudgetTemplateItem[] = [
  // 15th Salary Template (Basis: â‚±6,700 | Total: â‚±6,420 | Buffer: â‚±280)
  { id: '15-apartment', cycle: '15th', category: 'Apartment', amount: 1250 },
  { id: '15-utilities', cycle: '15th', category: 'Water & Electricity', amount: 500 },
  { id: '15-rice', cycle: '15th', category: 'Rice', amount: 350 },
  { id: '15-grooming', cycle: '15th', category: 'Grooming', amount: 200 },
  { id: '15-stove', cycle: '15th', category: 'Stove', amount: 120 },
  { id: '15-spices', cycle: '15th', category: 'Spices', amount: 100 },
  { id: '15-viands', cycle: '15th', category: 'Viands', amount: 1700 },
  { id: '15-others', cycle: '15th', category: 'Others', amount: 400 },
  { id: '15-travel', cycle: '15th', category: 'Travel', amount: 450 },
  { id: '15-wants', cycle: '15th', category: 'Wants', amount: 300 },
  { id: '15-gym', cycle: '15th', category: 'Gym', amount: 550 },
  { id: '15-emergency', cycle: '15th', category: 'Emergency Fund', amount: 500 },

  // 30th Salary Template (Basis: â‚±8,500)
  { id: '30-apartment', cycle: '30th', category: 'Apartment', amount: 1250 },
  { id: '30-utilities', cycle: '30th', category: 'Water & Electricity', amount: 500 },
  { id: '30-rice', cycle: '30th', category: 'Rice', amount: 350 },
  { id: '30-grooming', cycle: '30th', category: 'Grooming', amount: 100 },
  { id: '30-stove', cycle: '30th', category: 'Stove', amount: 120 },
  { id: '30-spices', cycle: '30th', category: 'Spices', amount: 100 },
  { id: '30-viands', cycle: '30th', category: 'Viands', amount: 2000 },
  { id: '30-others', cycle: '30th', category: 'Others', amount: 500 },
  { id: '30-travel', cycle: '30th', category: 'Travel', amount: 450 },
  { id: '30-wants', cycle: '30th', category: 'Wants', amount: 800 },
  { id: '30-savings', cycle: '30th', category: 'Emergency Fund / Savings', amount: 2000 },
];
