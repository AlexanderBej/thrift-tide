import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectBudgetMonth } from '@store/budget-store';
import { formatMonth } from '@shared/utils';
import { PeriodSheet } from 'widgets/sheets';

import './period-widget.styles.scss';
import { selectSettingsAppLanguage } from '@store/settings-store';

const PeriodWidget: React.FC = () => {
  const month = useSelector(selectBudgetMonth);
  const language = useSelector(selectSettingsAppLanguage);

  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="period-widget" onClick={() => setOpen(true)}>
        {formatMonth(month, language)}
      </button>

      <PeriodSheet open={open} onOpenChange={setOpen} />
    </>
  );
};

export default PeriodWidget;
