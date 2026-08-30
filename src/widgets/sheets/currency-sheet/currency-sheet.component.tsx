import React, { ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { RO, EU } from 'country-flag-icons/react/3x2';

import { BaseSheet, TTIcon } from '@shared/ui';
import { AppDispatch, Currency } from '@api/types';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsCurrency, updateCurrencyThunk } from '@store/settings-store';

import '../_selection-sheet.scss';

interface CurrencySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CurrencySheet: React.FC<CurrencySheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['settings']);
  const dispatch = useDispatch<AppDispatch>();

  const currency = useSelector(selectSettingsCurrency);
  const user = useSelector(selectAuthUser);
  const [savingCurrency, setSavingCurrency] = useState<Currency | null>(null);

  const currencyOptions: { badge: ReactNode; label: string; value: Currency }[] = [
    {
      label: t('currency.labelEu'),
      value: 'EUR',
      badge: <EU title="Euro" style={{ width: 28 }} />,
    },
    { label: t('currency.labelRo'), value: 'RON', badge: <RO title="RON" style={{ width: 28 }} /> },
  ];

  const handleSelect = async (nextCurrency: Currency) => {
    if (!user || savingCurrency) return;
    if (nextCurrency === currency) {
      onOpenChange(false);
      return;
    }

    setSavingCurrency(nextCurrency);
    try {
      await dispatch(updateCurrencyThunk({ uid: user.uuid, currency: nextCurrency })).unwrap();
      onOpenChange(false);
    } catch {
      // Keep the sheet open on failure.
    } finally {
      setSavingCurrency(null);
    }
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={String(t('currency.title'))}
      description={String(t('currency.subtitle'))}
      variant="compact"
    >
      <div className="selection-sheet">
        {currencyOptions.map((curr) => {
          const isActive = currency === curr.value;
          const isSaving = savingCurrency === curr.value;

          return (
            <button
              key={curr.value}
              type="button"
              className={clsx('selection-row', { active: isActive })}
              onClick={() => handleSelect(curr.value)}
              aria-pressed={isActive}
              disabled={!!savingCurrency}
            >
              <span className="selection-row__badge" aria-hidden="true">
                {curr.badge}
              </span>
              <span className="selection-row__label">{curr.label}</span>
              <span className="selection-row__state">
                {(isActive || isSaving) && (
                  <TTIcon icon={FaCheck} size={15} color="var(--color-primary)" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </BaseSheet>
  );
};

export default CurrencySheet;
