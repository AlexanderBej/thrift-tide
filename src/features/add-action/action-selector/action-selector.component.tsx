import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';

import { SheetStep } from '@api/types';
import { TTIcon } from '@shared/ui';
import { getCssVar } from '@shared/utils';

import './action-selector.styles.scss';

interface ActionSelectorProps {
  setStep: (step: SheetStep) => void;
}

interface Variant {
  key: Omit<SheetStep, 'choose'>;
  icon: string;
  title: string;
  subtitle: string;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ setStep }) => {
  const { t } = useTranslation('budget');

  const variants: Variant[] = [
    {
      key: 'expense',
      icon: '🧾',
      title: t('sheets.addSheet.choose.options.expense.title'),
      subtitle: t('sheets.addSheet.choose.options.expense.subtitle'),
    },
    {
      key: 'income',
      icon: '💰',
      title: t('sheets.addSheet.choose.options.income.title'),
      subtitle: t('sheets.addSheet.choose.options.income.subtitle'),
    },
  ];

  return (
    <div className="action-selectors">
      {variants.map((variant, index) => (
        <button
          className="action-container"
          key={index}
          onClick={() => setStep(variant.key as SheetStep)}
        >
          <span className="action-icon">{variant.icon}</span>
          <div className="action-text">
            <h3 className="action-title">{variant.title}</h3>
            <span className="action-sub">{variant.subtitle}</span>
          </div>
          <TTIcon
            containerClass="action-chevron"
            icon={FaChevronRight}
            size={18}
            color={getCssVar('--color-neutral')}
          />
        </button>
      ))}
    </div>
  );
};

export default ActionSelector;
