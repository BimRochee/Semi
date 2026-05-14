import {
  MoneyMovement,
  SalaryAllocation,
  SalaryDetail,
  SalaryEntry,
  Wallet,
} from '@/src/domain/types';

type CreateSalaryLedgerInput = {
  id: string;
  movementId: string;
  walletId: string;
  amount: number;
  source: string;
  receivedAt: string;
  note?: string;
};

type CreateAllocationTransferInput = {
  allocationId: string;
  movementId: string;
  salaryEntryId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  createdAt: string;
  budgetTemplateItemId?: string;
  note?: string;
};

export function createSalaryLedgerEntry(input: CreateSalaryLedgerInput) {
  const salaryEntry: SalaryEntry = {
    id: input.id,
    walletId: input.walletId,
    amount: input.amount,
    source: input.source,
    receivedAt: input.receivedAt,
    note: input.note,
  };

  const moneyMovement: MoneyMovement = {
    id: input.movementId,
    type: 'income',
    amount: input.amount,
    occurredAt: input.receivedAt,
    walletId: input.walletId,
    referenceId: input.id,
    note: input.note ?? `Salary from ${input.source}`,
  };

  return { salaryEntry, moneyMovement };
}

export function createAllocationTransfer(input: CreateAllocationTransferInput) {
  const salaryAllocation: SalaryAllocation = {
    id: input.allocationId,
    salaryEntryId: input.salaryEntryId,
    fromWalletId: input.fromWalletId,
    toWalletId: input.toWalletId,
    amount: input.amount,
    createdAt: input.createdAt,
    budgetTemplateItemId: input.budgetTemplateItemId,
    note: input.note,
  };

  const moneyMovement: MoneyMovement = {
    id: input.movementId,
    type: 'allocation',
    amount: input.amount,
    occurredAt: input.createdAt,
    fromWalletId: input.fromWalletId,
    toWalletId: input.toWalletId,
    referenceId: input.salaryEntryId,
    note: input.note,
  };

  return { salaryAllocation, moneyMovement };
}

export function calculateAllocatedTotal(
  salaryEntryId: string,
  salaryAllocations: SalaryAllocation[]
) {
  return salaryAllocations
    .filter((allocation) => allocation.salaryEntryId === salaryEntryId)
    .reduce((total, allocation) => total + allocation.amount, 0);
}

export function buildSalaryDetail(
  salaryEntry: SalaryEntry,
  wallets: Wallet[],
  salaryAllocations: SalaryAllocation[]
): SalaryDetail {
  const allocations = salaryAllocations.filter(
    (allocation) => allocation.salaryEntryId === salaryEntry.id
  );
  const allocatedTotal = calculateAllocatedTotal(salaryEntry.id, salaryAllocations);

  return {
    entry: salaryEntry,
    wallet: wallets.find((wallet) => wallet.id === salaryEntry.walletId),
    allocations,
    allocatedTotal,
    remaining: salaryEntry.amount - allocatedTotal,
  };
}
