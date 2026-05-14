import { calculateTotalBalance, calculateWalletSummaries } from '@/src/domain/walletRules';
import { useAppState } from '@/src/hooks/useAppState';

export function useWallets() {
  const { state, addWallet } = useAppState();
  const walletSummaries = calculateWalletSummaries(state.wallets, state.moneyMovements);
  const totalBalance = calculateTotalBalance(state.wallets, state.moneyMovements);

  return {
    walletSummaries,
    totalBalance,
    addWallet,
  };
}
