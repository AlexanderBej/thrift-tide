import React from 'react';
import { Trans } from 'react-i18next';

const StepOne: React.FC = () => {
  return (
    <div className="step-one">
      <p className="step-p">
        <Trans i18nKey="onboarding:step1.text1" components={{ bold: <strong /> }} />
      </p>
      <div style={{ height: 50 }} />
      <p className="step-p">
        <Trans i18nKey="onboarding:step1.text2" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepOne;
