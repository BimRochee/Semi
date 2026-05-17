import { createContext, PropsWithChildren, useEffect, useReducer, useState } from 'react';
import type { Dispatch } from 'react';

import type { MoneyMovement, SalaryAllocation, SalaryCycle, Payable, Installment } from '@/src/domain/types';
import { AppAction, appReducer, initialSemiAppState } from '@/src/state/appReducer';
import { createAllocationTransfer, createSalaryLedgerEntry } from '@/src/domain/salaryRules';
import { BudgetTemplateItem, SemiAppState, Wallet, WalletType } from '@/src/domain/types';
import {
  authenticateWithBiometrics,
  BiometricUnlockResult,
  clearStoredPin,
  getBiometricStatus,
  hasStoredPin,
  savePin as persistPin,
  verifyPin,
} from '@/src/repositories/securityRepository';
import { loadSemiAppState, saveSemiAppState, normalizeSemiAppState } from '@/src/repositories/semiRepository';
import { exportAppState, importAppState } from '@/src/repositories/dataRepository';
import { createId } from '@/src/utils/createId';
import { getNowIsoString } from '@/src/utils/dateUtils';

type AddSalaryInput = {
  cycle: SalaryCycle;
  amount: number;
  receivedWalletId: string;
  dateReceived?: string;
  note?: string;
};

type AllocateSalaryInput = {
  salaryEntryId: string;
  category: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
};

type AddWalletInput = {
  name: string;
  type: WalletType;
  startingBalance: number;
};

type UpdateWalletInput = {
  id: string;
  name: string;
  type: WalletType;
  startingBalance: number;
};

type AppContextValue = {
  state: SemiAppState;
  hydrated: boolean;
  hasPin: boolean;
  isLocked: boolean;
  biometricAvailable: boolean;
  biometricLabel: string;
  dispatch: Dispatch<AppAction>;
  savePin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<BiometricUnlockResult>;
  lockApp: () => void;
  addSalary: (input: AddSalaryInput) => string;
  allocateSalary: (input: AllocateSalaryInput) => string | null;
  bulkAllocateSalary: (allocations: AllocateSalaryInput[]) => void;
  adjustAllocationAmount: (allocationId: string, deduction: number, note: string) => void;
  addWallet: (input: AddWalletInput) => string;
  updateWallet: (input: UpdateWalletInput) => void;
  deleteWallet: (id: string) => void;
  updateBudgetTemplate: (item: BudgetTemplateItem) => void;
  deleteBudgetTemplate: (id: string) => void;
  updateExpectedSalary: (cycle: SalaryCycle, amount: number) => void;
  updateSettings: (patch: Partial<SemiAppState['settings']>) => void;
  resetAllData: () => Promise<void>;
  transferMoney: (params: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
  }) => void;
  addPayable: (payable: Payable, installments: Installment[]) => void;
  deletePayable: (id: string) => void;
  payInstallment: (params: {
    installmentId: string;
    walletId: string;
    amount: number;
    note?: string;
  }) => void;
  syncWalletBalances: (
    adjustments: { walletId: string; diff: number; note: string }[],
    allocationDeductions: { allocationId: string; amount: number }[]
  ) => void;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialSemiAppState);
  const [hydrated, setHydrated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const [storedState, pinExists, biometricStatus] = await Promise.all([
        loadSemiAppState(),
        hasStoredPin(),
        getBiometricStatus(),
      ]);

      if (!active) {
        return;
      }

      dispatch({ type: 'hydrate', payload: storedState });
      setHasPin(pinExists);
      setIsLocked(pinExists);
      setBiometricAvailable(biometricStatus.isAvailable);
      setBiometricLabel(biometricStatus.label);
      setHydrated(true);
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void saveSemiAppState(state);
  }, [hydrated, state]);

  const savePin = async (pin: string) => {
    const pinCreatedAt = getNowIsoString();

    await persistPin(pin);
    setHasPin(true);
    setIsLocked(false);
    dispatch({
      type: 'updateSettings',
      payload: {
        pinCreatedAt,
        lastUnlockedAt: pinCreatedAt,
      },
    });
  };

  const clearPin = async () => {
    await clearStoredPin();
    setHasPin(false);
    setIsLocked(false);
  };

  const unlockWithPin = async (pin: string) => {
    const valid = await verifyPin(pin);

    if (!valid) {
      return false;
    }

    setIsLocked(false);
    dispatch({
      type: 'updateSettings',
      payload: { lastUnlockedAt: getNowIsoString() },
    });

    return true;
  };

  const unlockWithBiometrics = async () => {
    const result = await authenticateWithBiometrics();

    if (!result.success) {
      return result;
    }

    setIsLocked(false);
    dispatch({
      type: 'updateSettings',
      payload: { lastUnlockedAt: getNowIsoString() },
    });

    return result;
  };

  const lockApp = () => {
    if (!hasPin) {
      return;
    }

    setIsLocked(true);
  };

  const addSalary = (input: AddSalaryInput) => {
    const salaryId = createId('salary');
    const movementId = createId('movement');
    const dateReceived = input.dateReceived ?? getNowIsoString();
    
    const payload = createSalaryLedgerEntry({
      id: salaryId,
      movementId,
      cycle: input.cycle,
      amount: input.amount,
      receivedWalletId: input.receivedWalletId,
      dateReceived,
      note: input.note,
    });

    dispatch({ type: 'addSalary', payload });

    // Auto-generate allocations based on templates for this cycle
    const relevantTemplates = state.budgetTemplates.filter((t) => t.cycle === input.cycle);
    if (relevantTemplates.length > 0) {
      const salaryAllocations: SalaryAllocation[] = [];
      const moneyMovements: MoneyMovement[] = [];

      relevantTemplates.forEach((template) => {
        // If a default wallet is assigned, we can auto-commit the transfer
        if (template.defaultWalletId) {
          const { salaryAllocation, moneyMovement } = createAllocationTransfer({
            allocationId: createId('allocation'),
            movementId: createId('movement'),
            salaryEntryId: salaryId,
            category: template.category,
            fromWalletId: input.receivedWalletId,
            toWalletId: template.defaultWalletId,
            amount: template.amount,
            createdAt: getNowIsoString(),
          });
          salaryAllocations.push(salaryAllocation);
          moneyMovements.push(moneyMovement);
        }
      });

      if (salaryAllocations.length > 0) {
        dispatch({ type: 'addBulkAllocations', payload: { salaryAllocations, moneyMovements } });
      }
    }

    return salaryId;
  };

  const allocateSalary = (input: AllocateSalaryInput) => {
    const allocationId = createId('allocation');
    const movementId = createId('movement');
    const payload = createAllocationTransfer({
      allocationId,
      movementId,
      salaryEntryId: input.salaryEntryId,
      category: input.category,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
      createdAt: getNowIsoString(),
      note: input.note,
    });

    dispatch({ type: 'addAllocation', payload });
    return allocationId;
  };

  const bulkAllocateSalary = (allocations: AllocateSalaryInput[]) => {
    const salaryAllocations: SalaryAllocation[] = [];
    const moneyMovements: MoneyMovement[] = [];

    allocations.forEach((input) => {
      const { salaryAllocation, moneyMovement } = createAllocationTransfer({
        allocationId: createId('allocation'),
        movementId: createId('movement'),
        salaryEntryId: input.salaryEntryId,
        category: input.category,
        fromWalletId: input.fromWalletId,
        toWalletId: input.toWalletId,
        amount: input.amount,
        createdAt: getNowIsoString(),
        note: input.note,
      });
      salaryAllocations.push(salaryAllocation);
      moneyMovements.push(moneyMovement);
    });

    if (salaryAllocations.length > 0) {
      dispatch({ type: 'addBulkAllocations', payload: { salaryAllocations, moneyMovements } });
    }
  };

  const adjustAllocationAmount = (allocationId: string, deduction: number, note: string) => {
    const allocation = state.salaryAllocations.find((a) => a.id === allocationId);
    if (!allocation) return;

    const salaryEntry = state.salaryEntries.find((s) => s.id === allocation.salaryEntryId);

    const movement: MoneyMovement = {
      id: createId('movement'),
      type: 'transfer',
      amount: deduction,
      fromWalletId: allocation.walletId,
      toWalletId: salaryEntry?.receivedWalletId || allocation.walletId,
      note,
      occurredAt: getNowIsoString(),
    };

    dispatch({
      type: 'adjustAllocation',
      payload: {
        allocationId,
        newAmount: allocation.amount - deduction,
        moneyMovement: movement,
      },
    });
  };

  const addWallet = (input: AddWalletInput) => {
    const wallet: Wallet = {
      id: createId('wallet'),
      name: input.name,
      type: input.type,
      startingBalance: input.startingBalance,
    };

    dispatch({ type: 'addWallet', payload: wallet });
    return wallet.id;
  };

  const updateWallet = (input: UpdateWalletInput) => {
    const existing = state.wallets.find((w) => w.id === input.id);
    if (!existing) return;
    dispatch({
      type: 'updateWallet',
      payload: { ...existing, ...input },
    });
  };

  const deleteWallet = (id: string) => {
    dispatch({ type: 'deleteWallet', payload: id });
  };

  const updateBudgetTemplate = (item: BudgetTemplateItem) => {
    dispatch({ type: 'upsertBudgetTemplate', payload: item });
  };

  const deleteBudgetTemplate = (id: string) => {
    dispatch({ type: 'deleteBudgetTemplate', payload: id });
  };

  const updateExpectedSalary = (cycle: SalaryCycle, amount: number) => {
    dispatch({ type: 'updateExpectedSalary', payload: { cycle, amount } });
  };

  const updateSettings = (patch: Partial<SemiAppState['settings']>) => {
    dispatch({ type: 'updateSettings', payload: patch });
  };

  const resetAllData = async () => {
    await clearPin();
    dispatch({ type: 'reset' });
  };

  const transferMoney = (params: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
  }) => {
    const movement: MoneyMovement = {
      id: createId('movement'),
      type: 'transfer',
      amount: params.amount,
      fromWalletId: params.fromWalletId,
      toWalletId: params.toWalletId,
      note: params.note || 'Transfer',
      occurredAt: getNowIsoString(),
    };
    dispatch({ type: 'addMovement', payload: movement });
  };

  const addPayable = (payable: Payable, installments: Installment[]) => {
    dispatch({ type: 'addPayable', payload: { payable, installments } });
  };

  const deletePayable = (id: string) => {
    dispatch({ type: 'deletePayable', payload: id });
  };

  const payInstallment = ({
    installmentId,
    walletId,
    amount,
    note,
  }: {
    installmentId: string;
    walletId: string;
    amount: number;
    note?: string;
  }) => {
    const movement: MoneyMovement = {
      id: createId('movement'),
      type: 'expense',
      amount,
      walletId,
      note: note || 'Debt Payment',
      occurredAt: getNowIsoString(),
    };
    dispatch({
      type: 'payInstallment',
      payload: {
        installmentId,
        movement,
        paidAt: getNowIsoString(),
      },
    });
  };

  const syncWalletBalances = (
    adjustments: { walletId: string; diff: number; note: string }[],
    allocationDeductions: { allocationId: string; amount: number }[]
  ) => {
    const adj = adjustments[0];
    if (!adj || adj.diff === 0) return;

    if (adj.diff > 0) {
      // Extra funds: create a single balance correction adjustment
      const movement: MoneyMovement = {
        id: createId('movement'),
        type: 'adjustment',
        amount: adj.diff,
        walletId: adj.walletId,
        note: adj.note || 'Balance correction / extra money adjustment',
        occurredAt: getNowIsoString(),
      };
      dispatch({ type: 'addMovement', payload: movement });
    } else {
      // Untracked spending: create an expense movement for each envelope deducted
      allocationDeductions.forEach((deduction) => {
        if (deduction.amount <= 0) return;

        const allocation = state.salaryAllocations.find(a => a.id === deduction.allocationId);
        const template = state.budgetTemplates.find(t => t.id === allocation?.category) || state.budgetTemplates.find(t => t.name === allocation?.category);
        const categoryName = template ? template.name : (allocation?.category || 'Unknown');

        const movement: MoneyMovement = {
          id: createId('movement'),
          type: 'expense',
          amount: deduction.amount,
          walletId: adj.walletId,
          note: `Adjustment Expense - ${categoryName}`,
          occurredAt: getNowIsoString(),
        };
        dispatch({ type: 'addMovement', payload: movement });

        adjustAllocationAmount(deduction.allocationId, deduction.amount, 'Reconciliation adjustment');
      });
    }
  };

  const exportData = async () => {
    await exportAppState(state);
  };

  const importData = async () => {
    const importedState = await importAppState();
    if (importedState) {
      const normalizedState = normalizeSemiAppState(importedState);
      dispatch({ type: 'hydrate', payload: normalizedState });
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        hydrated,
        hasPin,
        isLocked,
        biometricAvailable,
        biometricLabel,
        dispatch,
        savePin,
        clearPin,
        unlockWithPin,
        unlockWithBiometrics,
        lockApp,
        addSalary,
        allocateSalary,
        bulkAllocateSalary,
        adjustAllocationAmount,
        addWallet,
        updateWallet,
        deleteWallet,
        updateBudgetTemplate,
        deleteBudgetTemplate,
        updateExpectedSalary,
        updateSettings,
        resetAllData,
        transferMoney,
        addPayable,
        deletePayable,
        payInstallment,
        syncWalletBalances,
        exportData,
        importData,
      }}>
      {children}
    </AppContext.Provider>
  );
}
