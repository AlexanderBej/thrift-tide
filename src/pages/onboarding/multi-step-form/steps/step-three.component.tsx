import React from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';

import { FormPercentsProp } from '../multi-step-form.component';
import { PercentTriple } from '@api/types';
import { getCssVar } from '@shared/utils';
import { Button } from '@shared/ui';
import { selectSettingsDefaultPercents } from '@store/settings-store';

const StepThree: React.FC<FormPercentsProp> = ({ formData, onPercentsChange }) => {
  const percents = useSelector(selectSettingsDefaultPercents);

  const total = formData.percents.needs + formData.percents.wants + formData.percents.savings;

  const handleReset = () => {
    onPercentsChange('needs', percents.needs);
    onPercentsChange('wants', percents.wants);
    onPercentsChange('savings', percents.savings);
  };

  const isResetDisabled = () => {
    return (
      formData.percents.needs === percents.needs &&
      formData.percents.wants === percents.wants &&
      formData.percents.savings === percents.savings
    );
  };

  const getPctColor = (pct: number) => {
    if (pct < 90 || pct > 100) return 'error';
    else if (pct < 100) return 'warning';
    return 'success';
  };

  const getDonutPercentage = () => {
    return {
      value: total * 100,
      color: getCssVar(`--${getPctColor(total * 100)}`),
    };
  };

  return (
    <div className="step-three">
      <p className="step-p">
        <Trans i18nKey="onboarding.step3.text1" components={{ bold: <strong /> }} />
      </p>
      <ul className="step-p">
        <li>
          <Trans i18nKey="onboarding.step3.li1" components={{ bold: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="onboarding.step3.li2" components={{ bold: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="onboarding.step3.li3" components={{ bold: <strong /> }} />
        </li>
      </ul>
      <p className="step-p">
        <Trans i18nKey="onboarding.step3.text2" components={{ bold: <strong /> }} />
      </p>
      <div className="percents-selectors-wrapper">
        {/* <PercentsSelectors
          percents={formData.percents}
          showDonut={false}
          onPercentsChange={(bucket, value) =>
            onPercentsChange(bucket as keyof PercentTriple, value)
          }
        /> TODO */}
        <div className="reset-row">
          <Button
            buttonType="secondary"
            htmlType="button"
            disabled={isResetDisabled()}
            onClick={handleReset}
            isSmall={true}
          >
            <span>Reset percents</span>
          </Button>
          <span style={{ backgroundColor: getDonutPercentage().color }} className="percents-total">
            {getDonutPercentage().value}%
          </span>
        </div>
      </div>
      <p className="step-p">
        <Trans i18nKey="onboarding.step3.text3" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepThree;
