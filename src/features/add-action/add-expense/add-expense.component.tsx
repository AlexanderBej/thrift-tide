import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SliderViewport } from '@shared/ui';
import { CATEGORY_OPTIONS, toYMD } from '@shared/utils';
import {
  FormErrors,
  toDecimal,
  TransactionFormData,
  validateAll,
  validateField,
} from './add-expense.util';
import { Txn } from '@api/models';
import { StepHandle } from '../steps.types';
import { ExpenseForm } from '../expense-form';
import { TxnDayPicker } from '../txn-day-picker';
import { AppDispatch, Bucket } from '@api/types';
import { addTxnThunk } from '@store/budget-store';
import { selectAuthUser } from '@store/auth-store';

import './add-expense.styles.scss';

const AddExpense = forwardRef<StepHandle, { onCanSubmitChange?: (v: boolean) => void }>(
  function AddExpense({ onCanSubmitChange }, ref) {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(selectAuthUser);

    const [formData, setFormData] = useState<TransactionFormData>({
      category: 'rent',
      amount: '100',
      date: new Date(),
      note: '',
      bucket: 'needs',
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
      console.log('formdata', formData);
    };

    const handleTypeChange = (t: Bucket) => {
      setFormData((prev) => {
        const next = { ...prev, bucket: t };
        // If current category no longer valid for the new type, reset to first option
        const valid = CATEGORY_OPTIONS[t].some((o) => o.value === next.category);
        if (!valid && CATEGORY_OPTIONS[t][0]) {
          next.category = CATEGORY_OPTIONS[t][0].value as string;
        }
        // also re-validate category under new type
        setErrors((prevErr) => ({
          ...prevErr,
          category: validateField('category', next.category, next),
        }));
        return next;
      });
    };

    const canSubmit = useMemo(() => {
      return !errors.amount && !errors.category && !errors.date && !errors.note && step === 'form';
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
        type: formData.bucket,
        category: formData.category,
        note: formData.note?.trim() || '',
      };

      dispatch(addTxnThunk({ uid: user?.uuid ?? '', txn: payload })).then(() => {
        setFormData({
          category: 'rent',
          amount: '100',
          date: new Date(),
          note: '',
          bucket: 'needs',
        });
      });
      console.log('sumbit expense', payload);

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
