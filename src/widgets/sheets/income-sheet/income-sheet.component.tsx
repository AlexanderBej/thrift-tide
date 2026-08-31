import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddIncome, StepHandle } from 'features';
import { BaseSheet } from '@shared/ui';

interface IncomeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncomeSheet: React.FC<IncomeSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['budget', 'common']);
  const tt = (key: string) => t(key) as unknown as string;
  const incomeRef = useRef<StepHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onPrimary = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ok = await incomeRef.current?.submit?.();
      if (ok) onOpenChange(false);
    } catch {
      // Child submit flows surface errors through existing toast handling.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tt('budget:sheets.addSheet.income.title')}
      description={tt('budget:sheets.addSheet.income.subtitle')}
      variant="compact"
      btnLabel={tt('common:actions.add')}
      btnDisabled={!canSubmit || submitting}
      className="income-sheet"
      onButtonClick={onPrimary}
    >
      <AddIncome ref={incomeRef} onCanSubmitChange={setCanSubmit} />
    </BaseSheet>
  );
};

export default IncomeSheet;
