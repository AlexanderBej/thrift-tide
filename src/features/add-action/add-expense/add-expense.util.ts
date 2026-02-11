import { Category } from '@api/types';
import { EXPENSE_GROUP_OPTIONS } from '@shared/utils';

export type FormErrors = Partial<Record<'amount' | 'date' | 'expenseGroup' | 'note', string>>;

export interface TransactionFormData {
  date: Date;
  amount: string;
  category: Category;
  expenseGroup: string;
  note?: string;
}

const MAX_AMOUNT = 1_000_000;
const MAX_NOTE_LEN = 200;

const isFuture = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd.getTime() > today.getTime();
};

export const toDecimal = (v: string | number) => {
  // accept comma or dot, then parse
  const s = String(v).replace(',', '.').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

export const validateField = (
  name: keyof TransactionFormData | 'amount',
  value: unknown,
  ctx: TransactionFormData,
): string | undefined => {
  switch (name) {
    case 'amount': {
      // Allow strings or numbers coming from the input
      const n = toDecimal(value as string | number);
      if (String(value).trim() === '') return 'validation.amount.required';
      if (Number.isNaN(n)) return 'validation.amount.invalidNumber';
      if (n <= 0) return 'validation.amount.gtZero';
      if (n > MAX_AMOUNT) return 'validation.amount.ltMax';
      // extra: enforce 2 decimals even if user bypassed UI
      const [, dec = ''] = String(value).replace(',', '.').split('.');
      if (dec.length > 2) return 'validation.amount.maxTwoDecimals';
      return;
    }
    case 'date': {
      if (!value) return 'validation.date.required';
      const d = value as Date;
      if (isNaN(d.getTime())) return 'validation.date.invalid';
      if (isFuture(d)) return 'validation.date.notFuture';
      return;
    }
    case 'expenseGroup': {
      const inList = EXPENSE_GROUP_OPTIONS[ctx.category].some((opt) => opt.value === value);
      if (!value) return 'validation.expGroup.required';
      if (!inList) return 'validation.expGroup.invalid';
      return;
    }
    case 'note': {
      const len = String(value ?? '').length;
      if (len > MAX_NOTE_LEN) return 'validation.note';
      return;
    }
    default:
      return;
  }
};

export const validateAll = (data: TransactionFormData): FormErrors => {
  return {
    amount: validateField('amount', data.amount, data),
    date: validateField('date', data.date, data),
    expenseGroup: validateField('expenseGroup', data.expenseGroup, data),
    note: validateField('note', data.note ?? '', data),
  };
};
