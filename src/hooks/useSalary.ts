import { calculateTemplateBudgetTotal } from '@/src/domain/budgetRules';
import { buildSalaryDetail } from '@/src/domain/salaryRules';
import { useAppState } from '@/src/hooks/useAppState';

export function useSalary() {
  const { state, addSalary, allocateSalary, bulkAllocateSalary, adjustAllocationAmount } = useAppState();
  const salaryEntries = [...state.salaryEntries].sort((left, right) =>
    right.receivedAt.localeCompare(left.receivedAt)
  );
  const budgetTemplateTotal = calculateTemplateBudgetTotal(state.budgetTemplates);

  const getSalaryDetail = (salaryEntryId: string) => {
    const salaryEntry = state.salaryEntries.find((entry) => entry.id === salaryEntryId);

    if (!salaryEntry) {
      return null;
    }

    return buildSalaryDetail(salaryEntry, state.wallets, state.salaryAllocations);
  };

  return {
    salaryEntries,
    budgetTemplateTotal,
    addSalary,
    allocateSalary,
    bulkAllocateSalary,
    adjustAllocationAmount,
    getSalaryDetail,
  };
}
