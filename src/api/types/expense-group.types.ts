import { ExpenseGroupOption } from '../models/expense-group';
import { Category } from './category.types';

export type ExpenseGroupOptions = Record<Category, ExpenseGroupOption[]>;
