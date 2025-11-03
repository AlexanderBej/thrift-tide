import React from 'react';
import { Trans } from 'react-i18next';

const StepFive: React.FC = () => (
  <div className="step-five">
    <p className="step-p">
      <Trans i18nKey="onboarding.step5.text1" components={{ bold: <strong /> }} />
    </p>
    <p className="step-p" style={{ marginTop: 15 }}>
      <Trans i18nKey="onboarding.step5.text2" components={{ bold: <strong /> }} />
    </p>
    <p className="step-p" style={{ marginTop: 30 }}>
      <Trans i18nKey="onboarding.step5.text3" components={{ bold: <strong /> }} />
    </p>
  </div>
);

export default StepFive;
