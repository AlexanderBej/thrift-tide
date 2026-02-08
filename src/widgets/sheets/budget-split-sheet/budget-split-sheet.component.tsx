import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaMinus } from 'react-icons/fa6';

import { BaseSheet, InfoBlock, TTIcon } from '@shared/ui';
import { selectSettingsDefaultPercents, updateDefaultPercentsThunk } from '@store/settings-store';
import { AppDispatch, Bucket, PercentTriple } from '@api/types';
import { selectAuthUser } from '@store/auth-store';
import { getCssVar } from '@shared/utils';
import { ApplyEditor } from 'features';

import './budget-split-sheet.styles.scss';
import { selectBudgetDoc } from '@store/budget-store';

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
const buckets: Bucket[] = ['needs', 'wants', 'savings'];

const findDonorBucketInt = (p: PercentTripleInt, exclude: Bucket): Bucket | null => {
  const donor = buckets
    .filter((b) => b !== exclude)
    .map((b) => ({ b, v: p[b] }))
    .sort((a, c) => c.v - a.v)[0];

  return donor && donor.v > 0 ? donor.b : null;
};

const BudgetSplitSheet: React.FC<BudgetSplitSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch<AppDispatch>();

  const percents = useSelector(selectSettingsDefaultPercents);
  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const [selectedPercents, setSelectedPercents] = useState<PercentTripleInt>(() =>
    toInt(doc?.percents ?? percents),
  );
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(false);

  useEffect(() => {
    setSelectedPercents(toInt(doc?.percents ?? percents));
  }, [doc?.percents, percents]);

  const adjustPercent = (bucket: Bucket, delta: number) => {
    setSelectedPercents((prev) => {
      const donor = findDonorBucketInt(prev, bucket);
      if (!donor) return prev;

      // Can't take from donor or reduce below 0
      if (delta > 0 && prev[donor] <= 0) return prev;
      if (delta < 0 && prev[bucket] <= 0) return prev;

      const next = { ...prev };
      next[bucket] = clampInt(prev[bucket] + delta);
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

  const handleSubmit = () => {
    if (!user) return;

    dispatch(
      updateDefaultPercentsThunk({
        uid: user?.uuid,
        percents: toFrac(selectedPercents) as PercentTriple,
        startThisMonth: applyToCurrentMonth,
      }),
    )
      .unwrap()
      .then(() => {
        setTimeout(() => onOpenChange(false), 120);
      });
  };

  const getPercentsValues = (key: Bucket): number => {
    const val =
      key === 'needs'
        ? selectedPercents?.needs
        : key === 'wants'
          ? selectedPercents?.wants
          : selectedPercents?.savings;
    return val ?? 0;
  };

  const desc = t('pageContent.settings.percents.adjust');

  const originalPercentsInt = toInt(percents);

  const hasModified =
    selectedPercents.needs !== originalPercentsInt.needs ||
    selectedPercents.wants !== originalPercentsInt.wants ||
    selectedPercents.savings !== originalPercentsInt.savings;

  const areDifferent =
    percents.needs !== doc?.percents.needs ||
    percents.wants !== doc?.percents.wants ||
    percents.savings !== doc?.percents.savings;

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('pageContent.settings.percents.title')}
      description={desc}
      btnDisabled={!hasModified}
      btnLabel="Update Percents"
      onButtonClick={handleSubmit}
      headerNode={
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      }
    >
      <div className="budget-split-sheet">
        {areDifferent && (
          <InfoBlock className="sheet-info-block">
            <div>
              <span>Future months use different settings. </span>
              <span>
                From your next period the budget split will be{' '}
                <strong>
                  {percents.needs * 100}/{percents.wants * 100}/{percents.savings * 100}
                </strong>
              </span>
            </div>
          </InfoBlock>
        )}

        <div className="bugget-split-bar">
          {buckets.map((key, index) => {
            const inputVal = getPercentsValues(key);
            return (
              <div
                key={index}
                className={`budget-bar budget-bar__${key}`}
                style={{ width: `${inputVal}%` }}
              >
                {inputVal}%
              </div>
            );
          })}
        </div>

        <div className="percents-editors">
          {buckets.map((key, index) => {
            const inputVal = getPercentsValues(key);

            const canIncrease = selectedPercents[key] < 100;
            const canDecrease = selectedPercents[key] > 0;
            return (
              <div key={index} className="percent-input-line">
                <div className="percent-label">
                  <div className="bullet" style={{ backgroundColor: getCssVar(`--${key}`) }} />
                  <span className="percent-key">{key}</span>
                </div>

                <div className="percent-btn-group">
                  <button
                    className="percent-btn percent-btn__minus"
                    onClick={() => adjustPercent(key, -1)}
                    disabled={!canDecrease}
                  >
                    <TTIcon icon={FaMinus} size={16} color="fff" />
                  </button>
                  <span>{inputVal}%</span>
                  <button
                    className="percent-btn percent-btn__plus"
                    onClick={() => adjustPercent(key, +1)}
                    disabled={!canIncrease}
                  >
                    <TTIcon icon={FaPlus} size={16} color="fff" />
                  </button>
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
