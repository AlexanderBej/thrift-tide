import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import { Txn } from '../../api/models/txn';
import { Bucket } from '../../api/types/bucket.types';
import CheckboxInput from '../../components-ui/checkbox-input/checkbox-input.component';
import DatePicker from '../../components-ui/datepicker/datepicker.component';
import TTIcon from '../../components-ui/icon/icon.component';
import Modal from '../../components-ui/modal/modal.component';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { addTxnThunk } from '../../store/budget-store/budget.slice';
import { AppDispatch } from '../../store/store';
import { CATEGORY_OPTIONS } from '../../utils/category-options.util';
import { toYMD } from '../../utils/format-data.util';
import { FormErrors, validateField, validateAll, toDecimal } from './add-transaction-modal.util';
import TypeBoxSelector from '../type-box-selector/type-box-selector.component';
import Button from '../../components-ui/button/button.component';
import FormInput from '../../components-ui/form-input/form-input.component';
import Select from '../../components-ui/select/select.component';

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
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);

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
      note: formData.note?.trim() || undefined,
    };

    dispatch(addTxnThunk({ uid: user?.uuid ?? '', txn: payload }));

    if (!keepModalOpen) setOpen(false);
  };

  const isFormValid = () => {
    return !errors.amount && !errors.category && !errors.date && !errors.note;
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

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Transaction">
        <form className="txn-form" onSubmit={handleSubmit}>
          <TypeBoxSelector formData={formData} handleTypeChange={handleTypeChange} />

          <div className="amount-line">
            <FormInput
              label="Amount"
              inputType="number"
              name="amount"
              prefix="euro"
              errors={errors.amount}
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <DatePicker
              value={formData.date as unknown as Date}
              label="Date"
              onChange={handleDateChange}
            />
          </div>

          <Select
            name="category"
            label="Category"
            options={catOptions}
            value={formData.category}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Note (optional)"
            inputType="textarea"
            name="note"
            value={formData.note ?? ''}
            errors={errors.note}
            onChange={handleChange}
            required
          />

          <CheckboxInput
            name="persistance"
            checked={keepModalOpen}
            label="Keep modal open after submit"
            onChange={(e) => setKeepModalOpen(e.target.checked)}
          />

          <Button
            buttonType="primary"
            htmlType="submit"
            customContainerClass="save-txn-btn"
            disabled={!isFormValid()}
          >
            <span>Save</span>
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default AddTransaction;
