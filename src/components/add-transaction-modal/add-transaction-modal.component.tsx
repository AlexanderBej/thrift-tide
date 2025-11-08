import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { CATEGORY_OPTIONS, toYMD } from '@shared/utils';
import { FormErrors, validateField, validateAll, toDecimal } from './add-transaction-modal.util';
import TypeBoxSelector from '../type-box-selector/type-box-selector.component';
import { Button, CheckboxInput, DatePicker, FormInput, Modal, Select, TTIcon } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import { selectBudgetMutateStatus, addTxnThunk } from '@store/budget-store';
import { AppDispatch } from '@store/store';
import { Bucket } from '@api/types';
import { Txn } from '@api/models';

import './add-transaction-modal.styles.scss';

export interface TransactionFormData {
  date: Date;
  amount: number;
  type: Bucket;
  category: string;
  note?: string;
}

interface AddTransactionProps {
  buttonShape?: 'square' | 'rounded';
}

const AddTransaction: React.FC<AddTransactionProps> = ({ buttonShape = 'rounded' }) => {
  const { t } = useTranslation(['common', 'budget']);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const mutateStatus = useSelector(selectBudgetMutateStatus);

  const [open, setOpen] = useState(false);
  const [keepModalOpen, setKeepModalOpen] = useState(false);
  const [formData, setFormData] = React.useState<TransactionFormData>({
    category: 'rent',
    amount: 0.0,
    date: new Date(),
    note: '',
    type: 'needs',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const catOptions = CATEGORY_OPTIONS[formData.type];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value } as TransactionFormData;
      const msg = validateField(name as keyof TransactionFormData, value, next);
      setErrors((prevErr) => ({ ...prevErr, [name]: msg }));

      return next;
    });
  };

  const handleTypeChange = (t: Bucket) => {
    setFormData((prev) => {
      const next = { ...prev, type: t };
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

  const handleDateChange = (d: Date | null) => {
    if (!d) return;
    setFormData((prev) => {
      const next = { ...prev, date: d };
      setErrors((prevErr) => ({ ...prevErr, date: validateField('date', d, next) }));
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateAll(formData);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    // Build the payload safely
    const amountNum = toDecimal(formData.amount);
    const payload: Txn = {
      date: toYMD(formData.date), // normalize to YYYY-MM-DD
      amount: amountNum,
      type: formData.type,
      category: formData.category,
      note: formData.note?.trim() || '',
    };

    dispatch(addTxnThunk({ uid: user?.uuid ?? '', txn: payload })).then(() => {
      setFormData({
        category: 'rent',
        amount: 0.0,
        date: new Date(),
        note: '',
        type: 'needs',
      });
    });

    if (!keepModalOpen) setOpen(false);
  };

  const isFormValid = () => {
    return !errors.amount && !errors.category && !errors.date && !errors.note;
  };

  const handleOnClose = () => {
    setFormData({
      category: 'rent',
      amount: 0.0,
      date: new Date(),
      note: '',
      type: 'needs',
    });

    setKeepModalOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        buttonType="primary"
        htmlType="button"
        customContainerClass="add-txn-btn"
        buttonShape={buttonShape}
        onClick={() => setOpen(true)}
      >
        <>
          <TTIcon className="add-txn-icon" icon={FaPlus} size={18} />
        </>
      </Button>

      <Modal
        isOpen={open}
        onClose={handleOnClose}
        title={t('budget:modals.addTransaction') ?? 'Add Transaction'}
      >
        <form className="txn-form" onSubmit={handleSubmit}>
          <TypeBoxSelector formData={formData} handleTypeChange={handleTypeChange} />

          <div className="amount-line">
            <FormInput
              label={t('budget:modals.amount') ?? 'Amount'}
              inputType="number"
              name="amount"
              prefix="euro"
              errors={errors.amount ? t(errors.amount) : ''}
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <DatePicker
              value={formData.date as unknown as Date}
              label={t('budget:modals.date') ?? 'Date'}
              onChange={handleDateChange}
            />
          </div>

          <Select
            name="category"
            label={t('budget:modals.category') ?? 'Category'}
            options={catOptions}
            value={formData.category}
            onChange={handleChange}
            required
          />

          <FormInput
            label={t('budget:modals.note') ?? 'Note (optional)'}
            inputType="textarea"
            name="note"
            value={formData.note ?? ''}
            errors={errors.note ? t(errors.note) : ''}
            onChange={handleChange}
          />

          <CheckboxInput
            name="persistance"
            checked={keepModalOpen}
            label={t('budget:modals.keepModalOpen') ?? 'Keep modal open after submit'}
            onChange={(e) => setKeepModalOpen(e.target.checked)}
          />

          <Button
            buttonType="primary"
            htmlType="submit"
            customContainerClass="save-txn-btn"
            isLoading={mutateStatus === 'loading'}
            disabled={!isFormValid()}
          >
            <span>{t('actions.save') ?? 'Save'}</span>
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default AddTransaction;
