import React from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';

import { FormPercentsProp } from '../multi-step-form.component';
import PercentsSelectors from '../../../../components/percents-selectors/percents-selectors.component';
import { PercentTriple } from '../../../../api/types/percent.types';
import Button from '../../../../components-ui/button/button.component';
import { selectSettingsDefaultPercents } from '../../../../store/settings-store/settings.selectors';

const StepThree: React.FC<FormPercentsProp> = ({ formData, onPercentsChange }) => {
  const percents = useSelector(selectSettingsDefaultPercents);

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
        <PercentsSelectors
          percents={formData.percents}
          onPercentsChange={(bucket, value) =>
            onPercentsChange(bucket as keyof PercentTriple, value)
          }
        />
        <Button
          buttonType="secondary"
          htmlType="button"
          disabled={isResetDisabled()}
          onClick={handleReset}
          customContainerClass="reset-percents-btn"
        >
          <span>Reset percents</span>
        </Button>
      </div>
      <p className="step-p">
        <Trans i18nKey="onboarding.step3.text3" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepThree;
