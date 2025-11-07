import React from 'react';

import AppSettings from '../../settings-sections/app-settings.component';
import { useSettingsFormContext } from '../../settings-form-context';

import './app-preferences-page.styles.scss';

const AppPreferencesPage: React.FC = () => {
  const { formData, setFormData, handleChange, runSave, resetField } = useSettingsFormContext();

  return (
    <div className="app-preferences-page">
      {' '}
      <AppSettings
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        runSave={runSave}
        resetData={resetField}
        withBackground={true}
      />
    </div>
  );
};

export default AppPreferencesPage;
