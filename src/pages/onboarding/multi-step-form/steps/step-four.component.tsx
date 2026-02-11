import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MultiNonFormProp } from '../multi-step-form.component';
import { StartDaySelector } from '@shared/components';

const StepFour: React.FC<MultiNonFormProp> = ({ formData, setFormData }) => {
  const { t } = useTranslation('common');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (formData.startDay < 1 || formData.startDay > 28) {
      setError(
        t('settings:startDay.info') ??
          'Allowed range is from the 1st to the 28th, in order to avoid end-of-month gaps.',
      );
    }
  }, [formData.startDay, t]);

  return (
    <div className="step-four">
      <p className="step-p">
        <Trans i18nKey="onboarding:step4.text1" components={{ bold: <strong /> }} />
      </p>
      <p className="step-p">
        <Trans i18nKey="onboarding:step4.text2" components={{ bold: <strong /> }} />
      </p>
      <p className="step-p">
        <Trans i18nKey="onboarding:step4.text3" components={{ bold: <strong /> }} />
      </p>
      <div className="start-day-wrapper">
        <StartDaySelector
          selectedDay={formData.startDay}
          setSelectedDay={(day) =>
            setFormData((prev) => {
              return { ...prev, startDay: day as number };
            })
          }
        />

        {error && <div className="error">{error}</div>}
      </div>
      <p className="step-p">
        <Trans i18nKey="onboarding:step4.text4" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepFour;
