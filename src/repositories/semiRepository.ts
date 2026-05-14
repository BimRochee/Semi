import { defaultBudgetTemplates } from '@/src/data/defaultBudgetTemplates';
import { SemiAppState } from '@/src/domain/types';
import { getJsonItem, setJsonItem } from '@/src/storage/asyncStorageClient';

const SEMI_APP_STATE_KEY = '@semi/app-state/v1';

export function createInitialSemiAppState(): SemiAppState {
  return {
    wallets: [
      { id: 'wallet-bdo', name: 'BDO Payroll', type: 'Bank Account', startingBalance: 0 },
      { id: 'wallet-gcash', name: 'GCash', type: 'Digital Wallet', startingBalance: 0 },
      { id: 'wallet-cash', name: 'Cash Wallet', type: 'Physical Wallet', startingBalance: 0 },
      {
        id: 'wallet-emergency',
        name: 'Emergency Savings',
        type: 'Savings Account',
        startingBalance: 0,
      },
    ],
    salaryEntries: [],
    budgetTemplates: defaultBudgetTemplates,
    salaryAllocations: [],
    moneyMovements: [],
    settings: {
      currency: 'PHP',
      lockOnBackground: true,
      autoLockMinutes: 0,
    },
  };
}

export async function loadSemiAppState() {
  return getJsonItem<SemiAppState>(SEMI_APP_STATE_KEY, createInitialSemiAppState());
}

export async function saveSemiAppState(state: SemiAppState) {
  await setJsonItem(SEMI_APP_STATE_KEY, state);
}
