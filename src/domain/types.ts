export type WalletType =
  | 'Bank Account'
  | 'Digital Wallet'
  | 'Physical Wallet'
  | 'Savings Account';

export type MoneyMovementType = 'income' | 'expense' | 'transfer' | 'allocation' | 'adjustment';

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  startingBalance: number;
};

export type SalaryEntry = {
  id: string;
  walletId: string;
  amount: number;
  source: string;
  receivedAt: string;
  note?: string;
};

export type BudgetTemplateItem = {
  id: string;
  label: string;
  category: string;
  amount: number;
  targetWalletId?: string;
};

export type SalaryAllocation = {
  id: string;
  salaryEntryId: string;
  fromWalletId: string;
  toWalletId: string;
  budgetTemplateItemId?: string;
  amount: number;
  createdAt: string;
  note?: string;
};

export type MoneyMovement = {
  id: string;
  type: MoneyMovementType;
  amount: number;
  occurredAt: string;
  walletId?: string;
  fromWalletId?: string;
  toWalletId?: string;
  referenceId?: string;
  note?: string;
};

export type AppSettings = {
  currency: 'PHP';
  lockOnBackground: boolean;
  autoLockMinutes: number;
  pinCreatedAt?: string;
  lastUnlockedAt?: string;
};

export type SemiAppState = {
  wallets: Wallet[];
  salaryEntries: SalaryEntry[];
  budgetTemplates: BudgetTemplateItem[];
  salaryAllocations: SalaryAllocation[];
  moneyMovements: MoneyMovement[];
  settings: AppSettings;
};

export type WalletSummary = Wallet & {
  currentBalance: number;
};

export type SalaryDetail = {
  entry: SalaryEntry;
  wallet?: Wallet;
  allocations: SalaryAllocation[];
  allocatedTotal: number;
  remaining: number;
};
