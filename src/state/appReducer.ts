import {
  BudgetTemplateItem,
  MoneyMovement,
  SalaryAllocation,
  SalaryEntry,
  SemiAppState,
  Wallet,
} from '@/src/domain/types';
import { createInitialSemiAppState } from '@/src/repositories/semiRepository';

type HydrateAction = {
  type: 'hydrate';
  payload: SemiAppState;
};

type AddWalletAction = {
  type: 'addWallet';
  payload: Wallet;
};

type AddSalaryAction = {
  type: 'addSalary';
  payload: {
    salaryEntry: SalaryEntry;
    moneyMovement: MoneyMovement;
  };
};

type AddAllocationAction = {
  type: 'addAllocation';
  payload: {
    salaryAllocation: SalaryAllocation;
    moneyMovement: MoneyMovement;
  };
};

type UpsertBudgetTemplateAction = {
  type: 'upsertBudgetTemplate';
  payload: BudgetTemplateItem;
};

type UpdateSettingsAction = {
  type: 'updateSettings';
  payload: Partial<SemiAppState['settings']>;
};

export type AppAction =
  | HydrateAction
  | AddWalletAction
  | AddSalaryAction
  | AddAllocationAction
  | UpsertBudgetTemplateAction
  | UpdateSettingsAction;

export const initialSemiAppState = createInitialSemiAppState();

export function appReducer(state: SemiAppState, action: AppAction): SemiAppState {
  switch (action.type) {
    case 'hydrate':
      return action.payload;
    case 'addWallet':
      return {
        ...state,
        wallets: [...state.wallets, action.payload],
      };
    case 'addSalary':
      return {
        ...state,
        salaryEntries: [...state.salaryEntries, action.payload.salaryEntry],
        moneyMovements: [...state.moneyMovements, action.payload.moneyMovement],
      };
    case 'addAllocation':
      return {
        ...state,
        salaryAllocations: [...state.salaryAllocations, action.payload.salaryAllocation],
        moneyMovements: [...state.moneyMovements, action.payload.moneyMovement],
      };
    case 'upsertBudgetTemplate': {
      const existingIndex = state.budgetTemplates.findIndex(
        (template) => template.id === action.payload.id
      );

      if (existingIndex < 0) {
        return {
          ...state,
          budgetTemplates: [...state.budgetTemplates, action.payload],
        };
      }

      const budgetTemplates = [...state.budgetTemplates];
      budgetTemplates[existingIndex] = action.payload;

      return {
        ...state,
        budgetTemplates,
      };
    }
    case 'updateSettings':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
