import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { format } from 'date-fns';

import { FauxRadios, Input, TTIcon } from '@shared/ui';
import { EXPENSE_GROUP_OPTIONS, getCssVar } from '@shared/utils';
import { TypeBoxSelector } from '@components';
import { TransactionFormData } from '../add-expense/add-expense.util';
import { selectSettingsCurrency } from '@store/settings-store';
import { Category } from '@api/types';

import './expense-form.styles.scss';

interface DateMeta {
  label: string;
  value: Date | null;
  open?: boolean;
}

interface ExpenseFormProps {
  formData: TransactionFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>;
  keepSheetOpen: boolean;
  setKeepSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (t: Category) => void;
  setStep: React.Dispatch<React.SetStateAction<'form' | 'calendar'>>;
  radiosDisabled: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  formData,
  handleChange,
  handleTypeChange,
  setFormData,
  keepSheetOpen,
  setKeepSheetOpen,
  setStep,
  radiosDisabled,
}) => {
  const { t } = useTranslation('budget');

  const currency = useSelector(selectSettingsCurrency);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const ExpGroupsOptions = EXPENSE_GROUP_OPTIONS[formData.category];
  const dateOptions: DateMeta[] = [
    {
      label: t('sheets.addSheet.expense.dates.today'),
      value: today,
    },
    {
      label: t('sheets.addSheet.expense.dates.yesterday'),
      value: yesterday,
    },
    {
      label:
        formData.date &&
        formData.date.getDay() !== today.getDay() &&
        formData.date.getDay() !== yesterday.getDay()
          ? format(formData.date, 'dd MMM')
          : t('sheets.addSheet.expense.dates.pick'),
      value:
        formData.date &&
        formData.date.getDay() !== today.getDay() &&
        formData.date.getDay() !== yesterday.getDay()
          ? formData.date
          : null,
      open: true,
    },
  ];

  const isSameDay = (a: Date | null, b: Date) => {
    if (!a) return;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const handleDateClick = (date: DateMeta) => {
    if (date.open) {
      setStep('calendar');
      return;
    }

    setFormData((prev) => {
      return { ...prev, date: date.value ?? today };
    });
  };

  const popover = t('sheets.addSheet.expense.after.popover');

  return (
    <div className="expense-form">
      <Input
        label={t('modals.amount') ?? 'Amount'}
        type="text"
        name="amount"
        currency={currency}
        value={formData.amount}
        onChange={handleChange}
        required
      />

      <div className="expense-input-group">
        <span className="expense-input-label">{t('category')}</span>
        <TypeBoxSelector category={formData.category} handleTypeChange={handleTypeChange} />
      </div>

      <div className="expense-input-group exp-group-chips-group">
        <span className="expense-input-label">{t('expGroup')}</span>
        <div className="expense-chips exp-group-chips">
          {ExpGroupsOptions.map((eg, index) => (
            <button
              type="button"
              key={index}
              className={clsx('chip', { active: eg.value === formData.expenseGroup })}
              onClick={() =>
                setFormData((prev) => {
                  return { ...prev, expenseGroup: eg.value ?? today };
                })
              }
            >
              <TTIcon icon={eg.icon} size={14} color={eg.color} />
              <span className="chip-label">{t(eg.i18nLabel)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="expense-input-group">
        <span className="expense-input-label">{t('date')}</span>
        <div className="expense-chips">
          {dateOptions.map((date, index) => (
            <button
              type="button"
              key={index}
              className={clsx('chip', { active: isSameDay(date.value, formData.date) })}
              onClick={() => handleDateClick(date)}
            >
              <span>{date.label}</span>
              {date.open && (
                <TTIcon icon={FaChevronRight} size={14} color={getCssVar('--color-secondary')} />
              )}
            </button>
          ))}
        </div>
      </div>

      <Input
        label={t('budget:modals.note') ?? 'Note (optional)'}
        type="text"
        name="note"
        value={formData.note ?? ''}
        onChange={handleChange}
        className="note-input"
        required
      />

      <FauxRadios
        value={keepSheetOpen}
        setValue={setKeepSheetOpen}
        disabled={radiosDisabled}
        title={t('sheets.addSheet.afterSave')}
        falseLabel={t('sheets.addSheet.expense.after.close')}
        trueLabel={t('sheets.addSheet.expense.after.open')}
        popover={popover}
      />
    </div>
  );
};

export default ExpenseForm;
