import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaMinus } from 'react-icons/fa6';

import { BaseSheet, Button, InfoBlock } from '@shared/ui';
import { selectSettingsDefaultPercents, updateDefaultPercentsThunk } from '@store/settings-store';
import { AppDispatch, Category, PercentTriple } from '@api/types';
import { selectAuthUser } from '@store/auth-store';
import { ApplyEditor } from 'features/profile/apply-editor';
import { selectBudgetDoc } from '@store/budget-store';

import './budget-split-sheet.styles.scss';

interface BudgetSplitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PercentTripleInt = { needs: number; wants: number; savings: number };

const toInt = (p: PercentTriple): PercentTripleInt => ({
  needs: Math.round((p.needs ?? 0) * 100),
  wants: Math.round((p.wants ?? 0) * 100),
  savings: Math.round((p.savings ?? 0) * 100),
});

const toFrac = (p: PercentTripleInt): PercentTriple => ({
  needs: p.needs / 100,
  wants: p.wants / 100,
  savings: p.savings / 100,
});

const clampInt = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const categories: Category[] = ['needs', 'wants', 'savings'];

const findDonorCategoryInt = (p: PercentTripleInt, exclude: Category): Category | null => {
  const donor = categories
    .filter((b) => b !== exclude)
    .map((b) => ({ b, v: p[b] }))
    .sort((a, c) => c.v - a.v)[0];

  return donor && donor.v > 0 ? donor.b : null;
};

const BudgetSplitSheet: React.FC<BudgetSplitSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['common', 'settings']);
  const dispatch = useDispatch<AppDispatch>();

  const percents = useSelector(selectSettingsDefaultPercents);
  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const [selectedPercents, setSelectedPercents] = useState<PercentTripleInt>(() =>
    toInt(doc?.percents ?? percents),
  );
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedPercents(toInt(doc?.percents ?? percents));
  }, [doc?.percents, percents]);

  const adjustPercent = (cat: Category, delta: number) => {
    setSelectedPercents((prev) => {
      const donor = findDonorCategoryInt(prev, cat);
      if (!donor) return prev;

      // Can't take from donor or reduce below 0
      if (delta > 0 && prev[donor] <= 0) return prev;
      if (delta < 0 && prev[cat] <= 0) return prev;

      const next = { ...prev };
      next[cat] = clampInt(prev[cat] + delta);
      next[donor] = clampInt(prev[donor] - delta);

      // Ensure sum stays exactly 100 (safety)
      const sum = next.needs + next.wants + next.savings;
      if (sum !== 100) {
        // fix rounding drift by applying difference back to donor
        next[donor] = clampInt(next[donor] + (100 - sum));
      }

      return next;
    });
  };

  const handleReset = () => {
    setSelectedPercents(toInt(percents));
  };

  const handleSubmit = async () => {
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await dispatch(
        updateDefaultPercentsThunk({
          uid: user.uuid,
          percents: toFrac(selectedPercents) as PercentTriple,
          startThisMonth: applyToCurrentMonth,
        }),
      ).unwrap();
      onOpenChange(false);
    } catch {
      // Toasts are emitted by the thunk middleware; keep the sheet open for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const getPercentsValues = (key: Category): number => {
    const val =
      key === 'needs'
        ? selectedPercents?.needs
        : key === 'wants'
          ? selectedPercents?.wants
          : selectedPercents?.savings;
    return val ?? 0;
  };

  const desc = t('settings:percents.adjust');
  const resetLabel = t('actions.reset');
  const btnLabel = t('settings:percents.button');

  const originalPercentsInt = toInt(percents);

  const hasModified =
    selectedPercents.needs !== originalPercentsInt.needs ||
    selectedPercents.wants !== originalPercentsInt.wants ||
    selectedPercents.savings !== originalPercentsInt.savings;

  const docPercents = doc?.percents;
  const areDifferent =
    !!docPercents &&
    (percents.needs !== docPercents.needs ||
      percents.wants !== docPercents.wants ||
      percents.savings !== docPercents.savings);

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('settings:percents.title')}
      description={desc}
      btnDisabled={!hasModified || submitting}
      btnLoading={submitting}
      btnLabel={btnLabel}
      onButtonClick={handleSubmit}
      secondaryButtonLabel={resetLabel}
      handleSecondaryClick={handleReset}
    >
      <div className="budget-split-sheet">
        {areDifferent && (
          <InfoBlock className="sheet-info-block">
            <div>
              <span>{t('settings:percents.info.title')}</span>
              <span>
                {' '}
                {t('settings:percents.info.subtitle')}{' '}
                <strong>
                  {percents.needs * 100}/{percents.wants * 100}/{percents.savings * 100}
                </strong>
              </span>
            </div>
          </InfoBlock>
        )}

        <div className="budget-split-preview" aria-hidden="true">
          {categories.map((key) => {
            const inputVal = getPercentsValues(key);
            return (
              <div
                key={key}
                className={`budget-split-preview__segment budget-split-preview__segment--${key}`}
                style={{ width: `${inputVal}%` }}
              >
                {inputVal}%
              </div>
            );
          })}
        </div>

        <div className="percents-editors">
          {categories.map((key) => {
            const inputVal = getPercentsValues(key);

            const canIncrease = selectedPercents[key] < 100;
            const canDecrease = selectedPercents[key] > 0;
            return (
              <div key={key} className="percent-input-line">
                <div className="percent-label">
                  <div
                    className="bullet"
                    style={{ backgroundColor: `var(--color-category-${key})` }}
                  />
                  <span className="percent-key">{t(`taxonomy:categoryNames.${key}`)}</span>
                </div>

                <div className="percent-btn-group">
                  <Button
                    icon={FaMinus}
                    iconOnly
                    size="sm"
                    variant="secondary"
                    className="percent-btn percent-btn__minus"
                    ariaLabel={String(
                      t('settings:percents.decrease', {
                        category: t(`taxonomy:categoryNames.${key}`),
                      }),
                    )}
                    onClick={() => adjustPercent(key, -1)}
                    disabled={!canDecrease}
                  />
                  <span>{inputVal}%</span>
                  <Button
                    icon={FaPlus}
                    iconOnly
                    size="sm"
                    variant="secondary"
                    className="percent-btn percent-btn__plus"
                    ariaLabel={String(
                      t('settings:percents.increase', {
                        category: t(`taxonomy:categoryNames.${key}`),
                      }),
                    )}
                    onClick={() => adjustPercent(key, +1)}
                    disabled={!canIncrease}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <ApplyEditor
          hasModified={hasModified}
          applyToCurrentMonth={applyToCurrentMonth}
          setApplyToCurrentMonth={setApplyToCurrentMonth}
        />
      </div>
    </BaseSheet>
  );
};

export default BudgetSplitSheet;
