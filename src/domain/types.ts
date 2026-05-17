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

export type Payable = {
  id: string;
  name: string; // e.g. "TikTok PayLater"
  totalAmount: number;
  description?: string;
  createdAt: string;
};

export type Installment = {
  id: string;
  payableId: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
  paidAt?: string;
  movementId?: string; // Linked movement if paid
};

export type SalaryCycle = '15th' | '30th';

export type SalaryEntry = {
  id: string;
  cycle: SalaryCycle;
  amount: number;
  dateReceived: string;
  receivedWalletId: string;
  note?: string;
};

export type AllocationType = 'amount' | 'percentage';

export type BudgetTemplateItem = {
  id: string;
  cycle: SalaryCycle;
  category: string;
  amount: number; // The computed or fixed amount
  allocationType: AllocationType;
  value: number; // The input value (either ₱ or %)
  defaultWalletId?: string;
};

export type SalaryAllocation = {
  id: string;
  salaryEntryId: string;
  category: string;
  amount: number;
  walletId: string;
  createdAt: string;
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
  biometricUnlockEnabled: boolean;
  hasSeenOnboarding: boolean;
  hasSeenFeatureTour: boolean;
  pinCreatedAt?: string;
  lastUnlockedAt?: string;
  profilePictureUri?: string;
  profileName?: string;
};

export type SemiAppState = {
  wallets: Wallet[];
  salaryEntries: SalaryEntry[];
  expectedSalaries: Record<SalaryCycle, number>;
  budgetTemplates: BudgetTemplateItem[];
  salaryAllocations: SalaryAllocation[];
  moneyMovements: MoneyMovement[];
  payables: Payable[];
  installments: Installment[];
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
