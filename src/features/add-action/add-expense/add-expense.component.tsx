import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SliderViewport } from '@shared/ui';
import { EXPENSE_GROUP_OPTIONS, toYMD } from '@shared/utils';
import {
  FormErrors,
  toDecimal,
  TransactionFormData,
  validateAll,
  validateField,
} from './add-expense.util';
import { ExpenseGroupOption, Txn } from '@api/models';
import { StepHandle } from '../steps.types';
import { ExpenseForm } from '../expense-form';
import { TxnDayPicker } from '../txn-day-picker';
import { AppDispatch, Category } from '@api/types';
import { addTxnThunk } from '@store/budget-store';
import { selectAuthUser } from '@store/auth-store';

import './add-expense.styles.scss';

const AddExpense = forwardRef<StepHandle, { onCanSubmitChange?: (v: boolean) => void }>(
  function AddExpense({ onCanSubmitChange }, ref) {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(selectAuthUser);

    const [formData, setFormData] = useState<TransactionFormData>({
      expenseGroup: 'rent',
      amount: '100',
      date: new Date(),
      note: '',
      category: 'needs',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [keepSheetOpen, setKeepSheetOpen] = useState(false);

    const [step, setStep] = useState<'form' | 'calendar'>('form');

    const stepIndex = step === 'form' ? 0 : 1;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        const next = { ...prev, [name]: value } as TransactionFormData;
        const msg = validateField(name as keyof TransactionFormData, value, next);
        setErrors((prevErr) => ({ ...prevErr, [name]: msg }));

        return next;
      });
    };

    const handleDayChange = (date: Date) => {
      setFormData((prev) => {
        return { ...prev, date };
      });

      setStep('form');
    };

    const handleTypeChange = (t: Category) => {
      setFormData((prev) => {
        const next = { ...prev, category: t };
        // If current expenseGroup no longer valid for the new type, reset to first option
        const valid = EXPENSE_GROUP_OPTIONS[t].some(
          (o: ExpenseGroupOption) => o.value === next.expenseGroup,
        );
        if (!valid && EXPENSE_GROUP_OPTIONS[t][0]) {
          next.expenseGroup = EXPENSE_GROUP_OPTIONS[t][0].value as string;
        }
        // also re-validate expenseGroup under new type
        setErrors((prevErr) => ({
          ...prevErr,
          expenseGroup: validateField('expenseGroup', next.expenseGroup, next),
        }));
        return next;
      });
    };

    const canSubmit = useMemo(() => {
      return (
        !errors.amount && !errors.expenseGroup && !errors.date && !errors.note && step === 'form'
      );
    }, [errors, step]);

    useEffect(() => {
      onCanSubmitChange?.(canSubmit);
    }, [canSubmit, onCanSubmitChange]);

    const submit = async () => {
      const newErrors = validateAll(formData);
      setErrors(newErrors);

      const hasErrors = Object.values(newErrors).some(Boolean);

      if (hasErrors) return false;

      // Build the payload safely
      const amountNum = toDecimal(formData.amount);
      const payload: Txn = {
        date: toYMD(formData.date), // normalize to YYYY-MM-DD
        amount: amountNum,
        type: formData.category,
        expenseGroup: formData.expenseGroup,
        note: formData.note?.trim() || '',
      };

      dispatch(addTxnThunk({ uid: user?.uuid ?? '', txn: payload })).then(() => {
        setFormData({
          expenseGroup: 'rent',
          amount: '100',
          date: new Date(),
          note: '',
          category: 'needs',
        });
      });

      if (keepSheetOpen) return false;
      return true;
    };

    useImperativeHandle(ref, () => ({
      submit,
      reset: () => {
        /* optional */
      },
    }));

    return (
      <div className="add-expense">
        <SliderViewport
          activeIndex={stepIndex}
          animateHeight
          initialHeight={140}
          durationMs={240}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          className="expense-viewport"
        >
          {[
            <ExpenseForm
              formData={formData}
              handleChange={handleChange}
              handleTypeChange={handleTypeChange}
              keepSheetOpen={keepSheetOpen}
              setFormData={setFormData}
              setKeepSheetOpen={setKeepSheetOpen}
              setStep={setStep}
            />,
            <TxnDayPicker setStep={setStep} onChange={handleDayChange} value={formData.date} />,
          ]}
        </SliderViewport>
      </div>
    );
  },
);

export default AddExpense;
