import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';

import { BaseSheet, TTIcon } from '@shared/ui';
import { AppDispatch, Currency } from '@api/types';
import { getCssVar } from '@shared/utils';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsCurrency, updateCurrencyThunk } from '@store/settings-store';

import './currency-sheet.styles.scss';

interface CurrencySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CurrencySheet: React.FC<CurrencySheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch<AppDispatch>();

  const currency = useSelector(selectSettingsCurrency);
  const user = useSelector(selectAuthUser);

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);

  const currencyOptions: { flag: string; label: string; value: Currency }[] = [
    { label: t('pageContent.settings.currency.labelEu'), value: 'EUR', flag: '🇪🇺' },
    { label: t('pageContent.settings.currency.labelRo'), value: 'RON', flag: '🇷🇴' },
  ];

  const handleSubmit = () => {
    if (!user) return;
    dispatch(updateCurrencyThunk({ uid: user?.uuid, currency: selectedCurrency }))
      .unwrap()
      .then(() => {
        setTimeout(() => onOpenChange(false), 120);
      });
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('pageContent.settings.currency.title')}
      btnDisabled={selectedCurrency === currency}
      btnLabel="Change currency"
      onButtonClick={handleSubmit}
    >
      <div className="currency-selectors">
        {currencyOptions.map((curr, index) => (
          <button
            key={index}
            className={clsx('currency-block', { active: selectedCurrency === curr.value })}
            onClick={() => setSelectedCurrency(curr.value as Currency)}
          >
            <div className="currency-details">
              <span className="flag">{curr.flag}</span>
              <span>{curr.label}</span>
            </div>
            {selectedCurrency === curr.value && (
              <TTIcon icon={FaCheck} size={16} color={getCssVar('--color-primary')} />
            )}
          </button>
        ))}
      </div>
    </BaseSheet>
  );
};

export default CurrencySheet;
