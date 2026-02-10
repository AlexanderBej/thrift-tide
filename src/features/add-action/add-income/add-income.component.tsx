import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@api/types';
import { FauxRadios, Input, RadioOption } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectBudgetMonth,
  setIncomeForPeriod,
  changeMonthThunk,
  selectBudgetDoc,
} from '@store/budget-store';
import { selectSettingsBudgetStartDay, selectSettingsCurrency } from '@store/settings-store';
import { nextMonthKey } from '@shared/utils';
import { StepHandle } from '../steps.types';

import './add-income.styles.scss';

const AddIncome = forwardRef<StepHandle, { onCanSubmitChange?: (v: boolean) => void }>(
  function AddIncome({ onCanSubmitChange }, ref) {
    const { t } = useTranslation('budget');
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(selectAuthUser);
    const startDay = useSelector(selectSettingsBudgetStartDay);
    const monthKey = useSelector(selectBudgetMonth);

    const doc = useSelector(selectBudgetDoc);
    const currency = useSelector(selectSettingsCurrency);

    const [amount, setAmount] = useState<string>(doc?.income.toString() ?? '100');
    const [applyTo, setApplyTo] = useState<'now' | 'next'>('next');
    const [switchAfter, setSwitchAfter] = useState<boolean>(true);
    const nextKey = nextMonthKey(monthKey, startDay);

    const parsedAmount = React.useMemo(() => {
      const strAmount = amount.toString();
      const n = Number(strAmount.replace(',', '.'));
      return Number.isFinite(n) && n >= 0 ? n : null;
    }, [amount]);

    const canSubmit = useMemo(() => {
      return !!parsedAmount && !!(parsedAmount > 0);
    }, [parsedAmount]);

    useEffect(() => {
      onCanSubmitChange?.(canSubmit);
    }, [canSubmit, onCanSubmitChange]);

    const submit = async () => {
      if (!user?.uuid) return false;
      if (parsedAmount == null) return false;

      const targetKey = applyTo === 'next' ? nextKey : monthKey;

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

      return true;
    };

    useImperativeHandle(ref, () => ({
      submit,
      reset: () => {
        /* optional */
      },
    }));

    const APPLY_OPTIONS: RadioOption[] = [
      { value: 'now', label: t('sheets.common.thisMonth') },
      { value: 'next', label: t('sheets.common.nextMonth') },
    ];

    const SWITCH_OPTIONS: RadioOption[] = [
      { value: 'true', label: t('sheets.addSheet.income.switch') },
      { value: 'false', label: t('sheets.addSheet.income.stay') },
    ];

    return (
      <div className="income-form">
        <Input
          label={t('sheets.addSheet.income.input') ?? 'Amount'}
          type="text"
          name="amount"
          currency={currency}
          value={amount}
          onChange={(e: { target: { value: string } }) => setAmount(e.target.value)}
        />

        <FauxRadios
          disabled={Number(amount) < 1}
          value={applyTo}
          setValue={(apply) => setApplyTo(apply as 'now' | 'next')}
          title={t('sheets.common.applyTo')}
          valueList={APPLY_OPTIONS}
        />

        <FauxRadios
          disabled={applyTo === 'now' || Number(amount) < 1}
          value={switchAfter.toString()}
          title={t('sheets.addSheet.afterSave')}
          valueList={SWITCH_OPTIONS}
          setValue={(next) => setSwitchAfter(next === 'true' ? true : false)}
        />
      </div>
    );
  },
);

export default AddIncome;
