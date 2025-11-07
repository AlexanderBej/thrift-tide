import React from 'react';

import BudgetSettings from '../../settings-sections/budget-settings.component';
import { useSettingsFormContext } from '../../settings-form-context';

import './budget-page.styles.scss';

const BudgetPage: React.FC = () => {
  const {
    formData,
    setFormData,
    applyToCurrentMonth,
    setApplyToCurrentMonth,
    handleChange,
    runSave,
    resetField,
  } = useSettingsFormContext();

  return (
    <div className="budget-page">
      <BudgetSettings
        formData={formData}
        applyToCurrentMonth={applyToCurrentMonth}
        setApplyToCurrentMonth={setApplyToCurrentMonth}
        setFormData={setFormData}
        handleChange={handleChange}
        runSave={runSave}
        resetData={resetField}
        withBackground={true}
      />
    </div>
  );
};

export default BudgetPage;
