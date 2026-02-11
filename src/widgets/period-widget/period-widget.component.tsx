import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectBudgetMonth } from '@store/budget-store';
import { formatMonth, getCssVar } from '@shared/utils';
import { PeriodSheet } from 'widgets/sheets';

import './period-widget.styles.scss';
import { selectSettingsAppLanguage } from '@store/settings-store';
import { TTIcon } from '@shared/ui';
import { FaChevronDown } from 'react-icons/fa';
import clsx from 'clsx';

const PeriodWidget: React.FC<{ isDashboard?: boolean }> = ({ isDashboard = false }) => {
  const month = useSelector(selectBudgetMonth);
  const language = useSelector(selectSettingsAppLanguage);

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={clsx('period-widget', { 'dashboard-widget': isDashboard })}
        onClick={() => setOpen(true)}
      >
        <span className="period-month">{formatMonth(month, language)}</span>
        <TTIcon icon={FaChevronDown} size={14} color={getCssVar('--color-primary')} />
      </button>

      <PeriodSheet open={open} onOpenChange={setOpen} />
    </>
  );
};

export default PeriodWidget;
