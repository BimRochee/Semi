import { createContext, PropsWithChildren, useEffect, useReducer, useState } from 'react';
import type { Dispatch } from 'react';

import { AppAction, appReducer, initialSemiAppState } from '@/src/state/appReducer';
import { createAllocationTransfer, createSalaryLedgerEntry } from '@/src/domain/salaryRules';
import { BudgetTemplateItem, SemiAppState, Wallet, WalletType } from '@/src/domain/types';
import {
  clearStoredPin,
  hasStoredPin,
  savePin as persistPin,
  verifyPin,
} from '@/src/repositories/securityRepository';
import { loadSemiAppState, saveSemiAppState } from '@/src/repositories/semiRepository';
import { createId } from '@/src/utils/createId';
import { getNowIsoString } from '@/src/utils/dateUtils';

type AddSalaryInput = {
  walletId: string;
  amount: number;
  source: string;
  receivedAt?: string;
  note?: string;
};

type AllocateSalaryInput = {
  salaryEntryId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  budgetTemplateItemId?: string;
  note?: string;
};

type AddWalletInput = {
  name: string;
  type: WalletType;
  startingBalance: number;
};

type AppContextValue = {
  state: SemiAppState;
  hydrated: boolean;
  hasPin: boolean;
  isLocked: boolean;
  dispatch: Dispatch<AppAction>;
  savePin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  addSalary: (input: AddSalaryInput) => string;
  allocateSalary: (input: AllocateSalaryInput) => string | null;
  addWallet: (input: AddWalletInput) => string;
  updateBudgetTemplate: (item: BudgetTemplateItem) => void;
  updateSettings: (patch: Partial<SemiAppState['settings']>) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialSemiAppState);
  const [hydrated, setHydrated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const [storedState, pinExists] = await Promise.all([loadSemiAppState(), hasStoredPin()]);

      if (!active) {
        return;
      }

      dispatch({ type: 'hydrate', payload: storedState });
      setHasPin(pinExists);
      setIsLocked(pinExists);
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

  const lockApp = () => {
    if (!hasPin) {
      return;
    }

    setIsLocked(true);
  };

  const addSalary = (input: AddSalaryInput) => {
    const salaryId = createId('salary');
    const movementId = createId('movement');
    const receivedAt = input.receivedAt ?? getNowIsoString();
    const payload = createSalaryLedgerEntry({
      id: salaryId,
      movementId,
      walletId: input.walletId,
      amount: input.amount,
      source: input.source,
      receivedAt,
      note: input.note,
    });

    dispatch({ type: 'addSalary', payload });
    return salaryId;
  };

  const allocateSalary = (input: AllocateSalaryInput) => {
    if (input.fromWalletId === input.toWalletId) {
      return null;
    }

    const allocationId = createId('allocation');
    const movementId = createId('movement');
    const payload = createAllocationTransfer({
      allocationId,
      movementId,
      salaryEntryId: input.salaryEntryId,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
      createdAt: getNowIsoString(),
      budgetTemplateItemId: input.budgetTemplateItemId,
      note: input.note,
    });

    dispatch({ type: 'addAllocation', payload });
    return allocationId;
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

  const updateBudgetTemplate = (item: BudgetTemplateItem) => {
    dispatch({ type: 'upsertBudgetTemplate', payload: item });
  };

  const updateSettings = (patch: Partial<SemiAppState['settings']>) => {
    dispatch({ type: 'updateSettings', payload: patch });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        hydrated,
        hasPin,
        isLocked,
        dispatch,
        savePin,
        clearPin,
        unlockWithPin,
        lockApp,
        addSalary,
        allocateSalary,
        addWallet,
        updateBudgetTemplate,
        updateSettings,
      }}>
      {children}
    </AppContext.Provider>
  );
}
