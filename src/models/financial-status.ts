import { BudgetBucket } from './budget-bucket';

export type FinancialStatus = {
  income: { total: number; incomes: any[] };
  expenses: {
    total: number;
    needs: BudgetBucket;
    wants: BudgetBucket;
    save: BudgetBucket;
  };
  remaining: number;
};
