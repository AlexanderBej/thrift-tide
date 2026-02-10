import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FaMinus, FaPlus } from 'react-icons/fa';

import { MultiNonFormProp } from '../multi-step-form.component';
import { getCssVar } from '@shared/utils';
import { TTIcon } from '@shared/ui';
import { Category, PercentTriple } from '@api/types';

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

const StepThree: React.FC<MultiNonFormProp> = ({ formData, setFormData }) => {
  const { t } = useTranslation(['common', 'settings']);

  const adjustPercent = (cat: Category, delta: number) => {
    setFormData((prev) => {
      const current = toInt(prev.percents);
      const donor = findDonorCategoryInt(current, cat);
      if (!donor) return prev;

      // Can't take from donor or reduce below 0
      if (delta > 0 && current[donor] <= 0) return prev;
      if (delta < 0 && current[cat] <= 0) return prev;

      const next = { ...current };
      next[cat] = clampInt(current[cat] + delta);
      next[donor] = clampInt(current[donor] - delta);

      // Ensure sum stays exactly 100 (safety)
      const sum = next.needs + next.wants + next.savings;
      if (sum !== 100) {
        // Fix any drift by applying the delta back to donor
        next[donor] = clampInt(next[donor] + (100 - sum));
      }

      return { ...prev, percents: toFrac(next) };
    });
  };

  const intPercents = toInt(formData.percents);

  return (
    <div className="step-three">
      <p className="step-p">
        <Trans i18nKey="onboarding:step3.text1" components={{ bold: <strong /> }} />
      </p>
      <ul className="step-p">
        <li>
          <Trans i18nKey="onboarding:step3.li1" components={{ bold: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="onboarding:step3.li2" components={{ bold: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="onboarding:step3.li3" components={{ bold: <strong /> }} />
        </li>
      </ul>
      <p className="step-p">
        <Trans i18nKey="onboarding:step3.text2" components={{ bold: <strong /> }} />
      </p>
      <div className="percents-selectors-wrapper">
        <div className="bugget-split-bar">
          {categories.map((key, index) => {
            const inputVal = intPercents[key];
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
          {categories.map((key, index) => {
            const inputVal = intPercents[key];
            const canIncrease = inputVal < 100;
            const canDecrease = inputVal > 0;
            return (
              <div key={index} className="percent-input-line">
                <div className="percent-label">
                  <div className="bullet" style={{ backgroundColor: getCssVar(`--${key}`) }} />
                  <span className="percent-key">{t(`taxonomy:categoryNames.${key}`)}</span>
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
      </div>
      <p className="step-p">
        <Trans i18nKey="onboarding:step3.text3" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepThree;
