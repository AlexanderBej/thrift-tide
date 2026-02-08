import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { format } from 'date-fns';

import { FauxRadios, Input, TTIcon } from '@shared/ui';
import { CATEGORY_OPTIONS, getCssVar } from '@shared/utils';
import { TypeBoxSelector } from '@components';
import { TransactionFormData } from '../add-expense/add-expense.util';
import { selectSettingsCurrency } from '@store/settings-store';
import { Bucket } from '@api/types';

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
  handleTypeChange: (t: Bucket) => void;
  setStep: React.Dispatch<React.SetStateAction<'form' | 'calendar'>>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  formData,
  handleChange,
  handleTypeChange,
  setFormData,
  keepSheetOpen,
  setKeepSheetOpen,
  setStep,
}) => {
  const { t } = useTranslation('budget');

  const currency = useSelector(selectSettingsCurrency);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const catOptions = CATEGORY_OPTIONS[formData.bucket];
  const dateOptions: DateMeta[] = [
    {
      label: 'Today',
      value: today,
    },
    {
      label: 'Yesterday',
      value: yesterday,
    },
    {
      label:
        formData.date &&
        formData.date.getDay() !== today.getDay() &&
        formData.date.getDay() !== yesterday.getDay()
          ? format(formData.date, 'dd MMM')
          : 'Pick a day',
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
        <span className="expense-input-label">{t('bucket')}</span>
        <TypeBoxSelector bucket={formData.bucket} handleTypeChange={handleTypeChange} />
      </div>

      <div className="expense-input-group category-chips-group">
        <span className="expense-input-label">{t('category')}</span>
        <div className="expense-chips category-chips">
          {catOptions.map((cat, index) => (
            <button
              type="button"
              key={index}
              className={clsx('chip', { active: cat.value === formData.category })}
              onClick={() =>
                setFormData((prev) => {
                  return { ...prev, category: cat.value ?? today };
                })
              }
            >
              <TTIcon icon={cat.icon} size={14} color={cat.color} />
              <span className="chip-label">{t(cat.i18nLabel)}</span>
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
        title="After save"
        falseLabel="Close sheet"
        trueLabel="Keep sheet open"
        popover="This is used in case you wish to add more transactions after this one"
      />
    </div>
  );
};

export default ExpenseForm;
