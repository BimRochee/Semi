import {
  BudgetTemplateItem,
  Installment,
  MoneyMovement,
  Payable,
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

type UpdateWalletAction = {
  type: 'updateWallet';
  payload: Wallet;
};

type DeleteWalletAction = {
  type: 'deleteWallet';
  payload: string; // walletId
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

type AdjustAllocationAction = {
  type: 'adjustAllocation';
  payload: {
    allocationId: string;
    newAmount: number;
    moneyMovement: MoneyMovement;
  };
};

type AddBulkAllocationsAction = {
  type: 'addBulkAllocations';
  payload: {
    salaryAllocations: SalaryAllocation[];
    moneyMovements: MoneyMovement[];
  };
};

type DeleteBudgetTemplateAction = {
  type: 'deleteBudgetTemplate';
  payload: string; // id
};

type UpdateExpectedSalaryAction = {
  type: 'updateExpectedSalary';
  payload: {
    cycle: SalaryCycle;
    amount: number;
  };
};

type DeletePayableAction = {
  type: 'deletePayable';
  payload: string; // payableId
};

type UpdateSettingsAction = {
  type: 'updateSettings';
  payload: Partial<SemiAppState['settings']>;
};

type ResetAction = {
  type: 'reset';
};

type AddMovementAction = {
  type: 'addMovement';
  payload: MoneyMovement;
};

type AddPayableAction = {
  type: 'addPayable';
  payload: {
    payable: Payable;
    installments: Installment[];
  };
};

type PayInstallmentAction = {
  type: 'payInstallment';
  payload: {
    installmentId: string;
    movement: MoneyMovement;
    paidAt: string;
  };
};

export type AppAction =
  | HydrateAction
  | AddWalletAction
  | UpdateWalletAction
  | DeleteWalletAction
  | AddSalaryAction
  | AddAllocationAction
  | AdjustAllocationAction
  | AddBulkAllocationsAction
  | UpsertBudgetTemplateAction
  | DeleteBudgetTemplateAction
  | UpdateExpectedSalaryAction
  | DeletePayableAction
  | UpdateSettingsAction
  | ResetAction
  | AddMovementAction
  | AddPayableAction
  | PayInstallmentAction;

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
    case 'updateWallet':
      return {
        ...state,
        wallets: state.wallets.map((w) => (w.id === action.payload.id ? action.payload : w)),
      };
    case 'deleteWallet':
      return {
        ...state,
        wallets: state.wallets.filter((w) => w.id !== action.payload),
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
    case 'adjustAllocation':
      return {
        ...state,
        salaryAllocations: state.salaryAllocations.map((a) =>
          a.id === action.payload.allocationId ? { ...a, amount: action.payload.newAmount } : a
        ),
        moneyMovements: [...state.moneyMovements, action.payload.moneyMovement],
      };
    case 'addBulkAllocations':
      return {
        ...state,
        salaryAllocations: [...state.salaryAllocations, ...action.payload.salaryAllocations],
        moneyMovements: [...state.moneyMovements, ...action.payload.moneyMovements],
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
    case 'deleteBudgetTemplate':
      return {
        ...state,
        budgetTemplates: state.budgetTemplates.filter((t) => t.id !== action.payload),
      };
    case 'updateExpectedSalary':
      return {
        ...state,
        expectedSalaries: {
          ...state.expectedSalaries,
          [action.payload.cycle]: action.payload.amount,
        },
      };
    case 'deletePayable':
      return {
        ...state,
        payables: state.payables.filter((p) => p.id !== action.payload),
        installments: state.installments.filter((i) => i.payableId !== action.payload),
      };
    case 'updateSettings':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    case 'reset':
      return initialSemiAppState;
    case 'addMovement':
      return {
        ...state,
        moneyMovements: [...state.moneyMovements, action.payload],
      };
    case 'addPayable':
      return {
        ...state,
        payables: [...state.payables, action.payload.payable],
        installments: [...state.installments, ...action.payload.installments],
      };
    case 'payInstallment':
      return {
        ...state,
        installments: state.installments.map((inst) =>
          inst.id === action.payload.installmentId
            ? {
                ...inst,
                status: 'paid',
                paidAt: action.payload.paidAt,
                movementId: action.payload.movement.id,
              }
            : inst
        ),
        moneyMovements: [...state.moneyMovements, action.payload.movement],
      };
    default:
      return state;
  }
}
