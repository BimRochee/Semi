import { BudgetTemplateItem, SalaryAllocation } from '@/src/domain/types';

export function calculateTemplateBudgetTotal(templates: BudgetTemplateItem[]) {
  return templates.reduce((total, template) => total + template.amount, 0);
}

export function getTemplateAllocationCount(
  salaryAllocations: SalaryAllocation[],
  salaryEntryId: string,
  templateId: string
) {
  return salaryAllocations.filter(
    (allocation) =>
      allocation.salaryEntryId === salaryEntryId && allocation.budgetTemplateItemId === templateId
  ).length;
}
