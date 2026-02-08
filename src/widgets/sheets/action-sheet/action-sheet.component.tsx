import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BaseSheet, SliderViewport } from '@shared/ui';
import { ActionSelector, AddExpense, AddIncome, StepHandle } from 'features';
import { SheetStep } from '@api/types';

import './action-sheet.styles.scss';

interface AddActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStep?: SheetStep;
}

const AddActionSheet: React.FC<AddActionSheetProps> = ({
  open,
  onOpenChange,
  defaultStep = 'choose',
}) => {
  const { t } = useTranslation('budget');

  const [step, setStep] = useState<SheetStep>(defaultStep);
  const [canSubmit, setCanSubmit] = useState(false);

  const stepIndex = step === 'choose' ? 0 : step === 'income' ? 1 : 2;

  const expenseRef = useRef<StepHandle>(null);
  const incomeRef = useRef<StepHandle>(null);

  const activeRef = step === 'income' ? incomeRef : step === 'expense' ? expenseRef : null;

  const onPrimary = async () => {
    const ok = await activeRef?.current?.submit?.();
    if (ok) onOpenChange(false);
  };

  const btnDisabled = step === 'choose' ? true : !canSubmit;

  useEffect(() => {
    if (open) {
      setStep(defaultStep);
    } else {
      setStep('choose');
    }
  }, [open, defaultStep]);

  useEffect(() => {
    setCanSubmit(false);
  }, [step]);

  const title = t(`sheets.addSheet.${step}.title`);
  const description = t(`sheets.addSheet.${step}.subtitle`);

  const isIncome = step === 'income';
  const isExpense = step === 'expense';

  const btnLabel = isExpense ? 'Add transaction' : isIncome ? 'Add income' : '';
  const className = isExpense ? 'expense-sheet' : isIncome ? 'income-sheet' : 'action-sheet';

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="compact"
      btnLabel={btnLabel}
      btnDisabled={btnDisabled}
      className={className}
      onButtonClick={onPrimary}
      headerNode={
        step !== 'choose' ? (
          <button className="reset-btn" onClick={() => setStep('choose')}>
            Back
          </button>
        ) : null
      }
    >
      <SliderViewport
        activeIndex={stepIndex}
        animateHeight
        initialHeight={140}
        durationMs={240}
        easing="cubic-bezier(0.4, 0, 0.2, 1)"
        className="action-sheet-viewport"
      >
        {[
          <ActionSelector setStep={setStep} />,
          <AddIncome ref={incomeRef} onCanSubmitChange={setCanSubmit} />,
          <AddExpense ref={expenseRef} onCanSubmitChange={setCanSubmit} />,
        ]}
      </SliderViewport>
    </BaseSheet>
  );
};

export default AddActionSheet;
