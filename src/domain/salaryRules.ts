import {
  MoneyMovement,
  SalaryAllocation,
  SalaryCycle,
  SalaryDetail,
  SalaryEntry,
  Wallet,
} from '@/src/domain/types';

type CreateSalaryLedgerInput = {
  id: string;
  movementId: string;
  cycle: SalaryCycle;
  amount: number;
  dateReceived: string;
  receivedWalletId: string;
  note?: string;
};

type CreateAllocationTransferInput = {
  allocationId: string;
  movementId: string;
  salaryEntryId: string;
  category: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  createdAt: string;
  note?: string;
};

export function createSalaryLedgerEntry(input: CreateSalaryLedgerInput) {
  const salaryEntry: SalaryEntry = {
    id: input.id,
    cycle: input.cycle,
    amount: input.amount,
    dateReceived: input.dateReceived,
    receivedWalletId: input.receivedWalletId,
    note: input.note,
  };

  const moneyMovement: MoneyMovement = {
    id: input.movementId,
    type: 'income',
    amount: input.amount,
    occurredAt: input.dateReceived,
    walletId: input.receivedWalletId,
    referenceId: input.id,
    note: input.note ?? `Salary Cycle: ${input.cycle}`,
  };

  return { salaryEntry, moneyMovement };
}

export function createAllocationTransfer(input: CreateAllocationTransferInput) {
  const salaryAllocation: SalaryAllocation = {
    id: input.allocationId,
    salaryEntryId: input.salaryEntryId,
    category: input.category,
    amount: input.amount,
    walletId: input.toWalletId,
    createdAt: input.createdAt,
  };

  const moneyMovement: MoneyMovement = {
    id: input.movementId,
    type: 'allocation',
    amount: input.amount,
    occurredAt: input.createdAt,
    fromWalletId: input.fromWalletId,
    toWalletId: input.toWalletId,
    category: input.category,
    referenceId: input.salaryEntryId,
    note: input.note ?? `Allocated to ${input.category}`,
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
    wallet: wallets.find((wallet) => wallet.id === salaryEntry.receivedWalletId),
    allocations,
    allocatedTotal,
    remaining: salaryEntry.amount - allocatedTotal,
  };
}
