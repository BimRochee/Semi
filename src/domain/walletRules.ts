import { MoneyMovement, Wallet, WalletSummary } from '@/src/domain/types';

const POSITIVE_MOVEMENTS = new Set<MoneyMovement['type']>(['income', 'adjustment']);
const NEGATIVE_MOVEMENTS = new Set<MoneyMovement['type']>(['expense']);

export function calculateWalletBalance(wallet: Wallet, moneyMovements: MoneyMovement[]) {
  return moneyMovements.reduce((balance, movement) => {
    let newBalance = balance;

    if (movement.walletId === wallet.id) {
      if (POSITIVE_MOVEMENTS.has(movement.type)) newBalance += movement.amount;
      if (NEGATIVE_MOVEMENTS.has(movement.type)) newBalance -= movement.amount;
    }

    if (movement.fromWalletId === wallet.id) {
      newBalance -= movement.amount;
    }

    if (movement.toWalletId === wallet.id) {
      newBalance += movement.amount;
    }

    return newBalance;
  }, wallet.startingBalance);
}

export function calculateWalletSummaries(wallets: Wallet[], moneyMovements: MoneyMovement[]): WalletSummary[] {
  return wallets.map((wallet) => ({
    ...wallet,
    currentBalance: calculateWalletBalance(wallet, moneyMovements),
  }));
}

export function calculateTotalBalance(wallets: Wallet[], moneyMovements: MoneyMovement[]) {
  return calculateWalletSummaries(wallets, moneyMovements).reduce(
    (total, wallet) => total + wallet.currentBalance,
    0
  );
}
