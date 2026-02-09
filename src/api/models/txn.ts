import { Category } from '../types/category.types';

export interface Txn {
  id?: string;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  category: Category;
  expenseGroup: string;
  note?: string;
}
