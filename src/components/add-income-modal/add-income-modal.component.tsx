import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import TTIcon from '../../components-ui/icon/icon.component';
import Modal from '../../components-ui/modal/modal.component';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { AppDispatch } from '../../store/store';
import Button from '../../components-ui/button/button.component';
import FormInput from '../../components-ui/form-input/form-input.component';
import { changeMonthThunk, setIncomeForPeriod } from '../../store/budget-store/budget.slice';
import { selectSettingsBudgetStartDay } from '../../store/settings-store/settings.selectors';
import {
  selectBudgetMonth,
  selectBudgetMutateStatus,
} from '../../store/budget-store/budget.selectors.base';
import {
  formatPeriodLabel,
  nextMonthKey,
  representativeDateFromMonthKey,
} from '../../utils/period.util';
import { selectMonthTiming } from '../../store/budget-store/budget-period.selectors';
import CheckboxInput from '../../components-ui/checkbox-input/checkbox-input.component';

import './add-income-modal.styles.scss';

const AddIncome: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectAuthUser);
  const startDay = useSelector(selectSettingsBudgetStartDay);
  const monthKey = useSelector(selectBudgetMonth);
  const { periodStart, periodEnd } = useSelector(selectMonthTiming);
  const mutateStatus = useSelector(selectBudgetMutateStatus);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100.0);
  const [applyTo, setApplyTo] = useState<'current' | 'next'>('current');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchAfter, setSwitchAfter] = useState<boolean>(false);

  const nextKey = nextMonthKey(monthKey, startDay);
  const nextRepr = representativeDateFromMonthKey(nextKey, startDay);
  const nextStart = new Date(nextRepr.getFullYear(), nextRepr.getMonth(), startDay);
  const nextEnd = new Date(nextRepr.getFullYear(), nextRepr.getMonth() + 1, startDay);
  const currentLabel = formatPeriodLabel(periodStart, periodEnd, { endIsExclusive: true });
  const nextLabel = formatPeriodLabel(nextStart, nextEnd, { endIsExclusive: true });

  const parsedAmount = React.useMemo(() => {
    const strAmount = amount.toString();
    const n = Number(strAmount.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.uuid) return;
    if (parsedAmount == null) return setError('Please enter a valid amount.');

    const targetKey = applyTo === 'current' ? monthKey : nextKey;

    try {
      setSaving(true);
      await dispatch(
        setIncomeForPeriod({
          uid: user.uuid,
          month: targetKey,
          income: parsedAmount,
          // only used if creating the period for the first time
          startDay,
        }),
      ).unwrap();

      if (switchAfter && targetKey !== monthKey) {
        await dispatch(changeMonthThunk({ uid: user.uuid, month: targetKey })).unwrap();
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save income');
    } finally {
      setSaving(false);
    }

    dispatch(
      setIncomeForPeriod({
        uid: user?.uuid,
        income: amount,
        startDay: startDay,
        month: monthKey,
      }),
    );
  };

  return (
    <>
      <Button
        buttonType="primary"
        htmlType="button"
        customContainerClass="add-income-btn"
        onClick={() => setOpen(true)}
      >
        <>
          <TTIcon className="add-income-icon" icon={FaPlus} size={18} />
        </>
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Income">
        <form className="income-form" onSubmit={handleSubmit}>
          <FormInput
            label="Amount"
            inputType="number"
            name="amount"
            prefix="euro"
            value={amount}
            onChange={(e: { target: { value: any } }) => setAmount(Number(e.target.value))}
            required
          />

          <fieldset className="apply-to-field">
            <legend className="field-legen">Apply to</legend>

            <label className="radio-row">
              <input
                type="radio"
                name="applyTo"
                value="current"
                checked={applyTo === 'current'}
                onChange={() => setApplyTo('current')}
              />
              <div>
                Current period <em>({monthKey})</em>
              </div>
              <span className="hint">{currentLabel}</span>
            </label>

            <label className="radio-row">
              <input
                type="radio"
                name="applyTo"
                value="next"
                checked={applyTo === 'next'}
                onChange={() => setApplyTo('next')}
              />
              <div>
                Next period <em>({nextKey})</em>
              </div>
              <span className="hint">{nextLabel}</span>
            </label>
          </fieldset>

          <CheckboxInput
            label="Switch to next period after saving"
            name="switchAfter"
            checked={switchAfter}
            onChange={(e) => setSwitchAfter(e.target.checked)}
          />

          {error && <div className="error">{error}</div>}

          <Button
            buttonType="primary"
            htmlType="submit"
            customContainerClass="save-income-btn"
            isLoading={mutateStatus === 'loading'}
            disabled={saving || parsedAmount == null}
          >
            <span>Save</span>
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default AddIncome;
