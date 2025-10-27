import { CATEGORY_OPTIONS } from '../../utils/category-options.util';
import { TransactionFormData } from './add-transaction-modal.component';

export type FormErrors = Partial<Record<'amount' | 'date' | 'category' | 'note', string>>;

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
      if (String(value).trim() === '') return 'Amount is required';
      if (Number.isNaN(n)) return 'Enter a valid number';
      if (n <= 0) return 'Amount must be greater than 0';
      if (n > MAX_AMOUNT) return `Amount must be less than ${MAX_AMOUNT.toLocaleString()}`;
      // extra: enforce 2 decimals even if user bypassed UI
      const [, dec = ''] = String(value).replace(',', '.').split('.');
      if (dec.length > 2) return 'Max 2 decimal places';
      return;
    }
    case 'date': {
      if (!value) return 'Date is required';
      const d = value as Date;
      if (isNaN(d.getTime())) return 'Enter a valid date';
      if (isFuture(d)) return 'Date cannot be in the future';
      return;
    }
    case 'category': {
      const inList = CATEGORY_OPTIONS[ctx.type].some((opt) => opt.value === value);
      if (!value) return 'Category is required';
      if (!inList) return 'Choose a valid category';
      return;
    }
    case 'note': {
      const len = String(value ?? '').length;
      if (len > MAX_NOTE_LEN) return `Note must be under ${MAX_NOTE_LEN} characters`;
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
    category: validateField('category', data.category, data),
    note: validateField('note', data.note ?? '', data),
  };
};
