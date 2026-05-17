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
    expectedSalaries: {
      '15th': 6800,
      '30th': 6800,
    },
    budgetTemplates: defaultBudgetTemplates,
    salaryAllocations: [],
    moneyMovements: [],
    payables: [],
    installments: [],
    settings: {
      currency: 'PHP',
      lockOnBackground: true,
      autoLockMinutes: 1,
      biometricUnlockEnabled: false,
      hasSeenOnboarding: false,
      hasSeenFeatureTour: false,
    },
  };
}

export function normalizeSemiAppState(
  storedState: Partial<SemiAppState> | null | undefined
): SemiAppState {
  const initialState = createInitialSemiAppState();

  if (!storedState) {
    return initialState;
  }

  return {
    wallets: storedState.wallets ?? initialState.wallets,
    salaryEntries: storedState.salaryEntries ?? initialState.salaryEntries,
    expectedSalaries: storedState.expectedSalaries ?? initialState.expectedSalaries,
    budgetTemplates: (storedState.budgetTemplates ?? initialState.budgetTemplates).map(t => ({
      ...t,
      allocationType: t.allocationType ?? 'amount',
      value: t.value ?? t.amount,
    })),
    salaryAllocations: storedState.salaryAllocations ?? initialState.salaryAllocations,
    moneyMovements: storedState.moneyMovements ?? initialState.moneyMovements,
    payables: storedState.payables ?? initialState.payables,
    installments: storedState.installments ?? initialState.installments,
    settings: {
      ...initialState.settings,
      ...storedState.settings,
    },
  };
}

export async function loadSemiAppState() {
  const storedState = await getJsonItem<Partial<SemiAppState> | null>(SEMI_APP_STATE_KEY, null);
  return normalizeSemiAppState(storedState);
}

export async function saveSemiAppState(state: SemiAppState) {
  await setJsonItem(SEMI_APP_STATE_KEY, state);
}
