import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';

import { selectBudgetMonth } from '@store/budget-store';
import { selectSettingsAppLanguage } from '@store/settings-store';
import { formatMonth } from '@shared/utils';
import { TTIcon } from '@shared/ui';
import { PeriodSheet } from 'widgets/sheets';

import './period-widget.styles.scss';

const PeriodWidget: React.FC = () => {
  const { t } = useTranslation('common');

  const month = useSelector(selectBudgetMonth);
  const language = useSelector(selectSettingsAppLanguage);

  const [open, setOpen] = useState(false);

  const period = formatMonth(month, language);

  return (
    <>
      <button
        type="button"
        className="period-widget"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={String(
          t('navigation.selectPeriod', {
            period,
          }),
        )}
      >
        <span className="period-month">{period}</span>

        <TTIcon icon={FaChevronDown} size={12} color="currentColor" />
      </button>

      <PeriodSheet open={open} onOpenChange={setOpen} />
    </>
  );
};

export default PeriodWidget;
