import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { formatPeriodLabel, nextMonthKey, representativeDateFromMonthKey } from '@shared/utils';
import { Button, CheckboxInput, FormInput, Modal, TTIcon } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import { AppDispatch } from '@store/store';
import {
  selectBudgetMonth,
  selectMonthTiming,
  selectBudgetMutateStatus,
  setIncomeForPeriod,
  changeMonthThunk,
} from '@store/budget-store';
import { selectSettingsBudgetStartDay } from '@store/settings-store';

import './add-income-modal.styles.scss';

const AddIncome: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation(['common', 'budget']);

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

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('budget:modals.addIncome') ?? 'Add Income'}
      >
        <form className="income-form" onSubmit={handleSubmit}>
          <FormInput
            label={t('budget:modals.amount') ?? 'Amount'}
            inputType="number"
            name="amount"
            prefix="euro"
            value={amount}
            onChange={(e: { target: { value: any } }) => setAmount(Number(e.target.value))}
            required
          />

          <fieldset className="apply-to-field">
            <legend className="field-legen">{t('budget:modals.applyTo') ?? 'Apply to'}</legend>

            <label className="radio-row">
              <input
                type="radio"
                name="applyTo"
                value="current"
                checked={applyTo === 'current'}
                onChange={() => setApplyTo('current')}
              />
              <div>
                {t('budget:modals.currentPeriod') ?? 'Current Period'} <em>({monthKey})</em>
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
                {t('budget:modals.nextPeriod') ?? 'Next Period'} <em>({nextKey})</em>
              </div>
              <span className="hint">{nextLabel}</span>
            </label>
          </fieldset>

          <CheckboxInput
            label={t('budget:modals.switchPeriod') ?? 'Switch to next period after saving'}
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
            <span>{t('actions.save') ?? 'Save'}</span>
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default AddIncome;
