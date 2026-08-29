import { addDays, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';

import { MonthDoc, Txn } from '../../api/models';
import { Category } from '../../api/types';
import {
  getExpenseGroupCategory,
  getRecentExpenseGroups,
  ResolvedExpenseGroupOption,
} from '../../shared/utils/expense-group-options.util';
import { toYMD } from '../../shared/utils/format-data.util';

export type CaptureView = 'form' | 'groups' | 'date';

export type CaptureErrors = Partial<Record<'amount' | 'expenseGroup' | 'date' | 'note', string>>;

export interface CaptureFormState {
  amount: string;
  expenseGroup: string;
  date: Date | null;
  note: string;
  noteExpanded: boolean;
}

export interface CaptureDateBounds {
  min: Date;
  max: Date;
  hasValidDate: boolean;
}

export const MAX_CAPTURE_AMOUNT = 1_000_000;
export const MAX_CAPTURE_NOTE_LENGTH = 200;

export function parseAmount(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function getCategoryForExpenseGroup(expenseGroup: string): Category | null {
  return getExpenseGroupCategory(expenseGroup);
}

export function getCaptureDateBounds(doc: MonthDoc | null | undefined): CaptureDateBounds | null {
  if (!doc?.periodStart || !doc.periodEnd) return null;

  const periodStart = startOfDay(new Date(doc.periodStart));
  const periodLastDay = startOfDay(addDays(new Date(doc.periodEnd), -1));
  const today = startOfDay(new Date());
  const max = isBefore(today, periodLastDay) ? today : periodLastDay;

  return {
    min: periodStart,
    max,
    hasValidDate: !isBefore(max, periodStart),
  };
}

export function clampInitialDate(bounds: CaptureDateBounds | null, preferred = new Date()) {
  if (!bounds?.hasValidDate) return null;

  const day = startOfDay(preferred);
  if (isBefore(day, bounds.min)) return bounds.min;
  if (isAfter(day, bounds.max)) return bounds.max;
  return day;
}

export function createEmptyCaptureForm(
  noteExpandedByDefault: boolean,
  doc?: MonthDoc | null,
  preferredDate?: Date | null,
): CaptureFormState {
  return {
    amount: '',
    expenseGroup: '',
    date: clampInitialDate(getCaptureDateBounds(doc ?? null), preferredDate ?? new Date()),
    note: '',
    noteExpanded: noteExpandedByDefault,
  };
}

export function isDateAllowed(date: Date | null, bounds: CaptureDateBounds | null) {
  if (!date || !bounds?.hasValidDate) return false;
  const day = startOfDay(date);
  return !isBefore(day, bounds.min) && !isAfter(day, bounds.max);
}

export function isToday(date: Date | null) {
  return !!date && isSameDay(date, new Date());
}

export function isYesterday(date: Date | null) {
  if (!date) return false;
  return isSameDay(date, addDays(new Date(), -1));
}

export function validateCaptureForm(
  form: CaptureFormState,
  bounds: CaptureDateBounds | null,
): CaptureErrors {
  const errors: CaptureErrors = {};
  const amount = parseAmount(form.amount);

  if (!form.amount.trim()) errors.amount = 'common:validation.amount.required';
  else if (Number.isNaN(amount)) errors.amount = 'common:validation.amount.invalidNumber';
  else if (amount <= 0) errors.amount = 'common:validation.amount.gtZero';
  else if (amount > MAX_CAPTURE_AMOUNT) errors.amount = 'common:validation.amount.ltMax';
  else if ((form.amount.replace(',', '.').split('.')[1] ?? '').length > 2) {
    errors.amount = 'common:validation.amount.maxTwoDecimals';
  }

  if (!form.expenseGroup) errors.expenseGroup = 'common:validation.expGroup.required';
  else if (!getCategoryForExpenseGroup(form.expenseGroup)) {
    errors.expenseGroup = 'common:validation.expGroup.invalid';
  }

  if (!form.date) errors.date = 'common:validation.date.required';
  else if (!isDateAllowed(form.date, bounds)) errors.date = 'common:validation.date.invalid';

  if (form.note.length > MAX_CAPTURE_NOTE_LENGTH) {
    errors.note = 'budget:capture.validation.noteMax';
  }

  return errors;
}

export function hasCaptureErrors(errors: CaptureErrors) {
  return Object.values(errors).some(Boolean);
}

export function buildExpensePayload(form: CaptureFormState): Omit<Txn, 'id'> | null {
  const category = getCategoryForExpenseGroup(form.expenseGroup);
  if (!category || !form.date) return null;

  return {
    amount: parseAmount(form.amount),
    category,
    expenseGroup: form.expenseGroup,
    date: toYMD(form.date),
    note: form.note.trim(),
  };
}

export function dateFromYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formFromTxn(txn: Txn, noteExpandedByDefault: boolean): CaptureFormState {
  return {
    amount: txn.amount.toFixed(2),
    expenseGroup: txn.expenseGroup,
    date: dateFromYmd(txn.date),
    note: txn.note ?? '',
    noteExpanded: noteExpandedByDefault || !!txn.note,
  };
}

export function deriveRecentGroups(txns: Txn[]): ResolvedExpenseGroupOption[] {
  return getRecentExpenseGroups(txns, 6);
}
