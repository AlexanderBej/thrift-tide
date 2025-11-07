import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectAuthUser } from '../../../../store/auth-store/auth.selectors';
import { selectSettingsAll } from '../../../../store/settings-store/settings.selectors';
import { DEFAULT_THEME } from '../../../../api/types/settings.types';
import BudgetSettings from '../../settings-sections/budget-settings.component';
import AppSettings from '../../settings-sections/app-settings.component';
import { SettingsFormData } from '../../settings-shell.component';
import { useSettingsForm } from '../../use-settings-form.hook';
import ProfileSettings from '../../settings-sections/profile-settings.component';

import './desktop-settings-page.styles.scss';

const DesktopSettingsPage: React.FC = () => {
  const { t } = useTranslation(['common', 'budget']);

  const user = useSelector(selectAuthUser);

  const { currency, defaultPercents, language, startDay, theme } = useSelector(selectSettingsAll);

  const defaultValues: SettingsFormData = {
    percents: defaultPercents,
    startDay,
    currency,
    language,
    theme: theme ?? DEFAULT_THEME,
    displayName: user?.displayName ?? '',
  };

  const {
    formData,
    setFormData,
    handleChange,
    runSave,
    resetField,
    applyToCurrentMonth,
    setApplyToCurrentMonth,
  } = useSettingsForm(defaultValues, user?.uuid);

  return (
    <>
      <section className="settings-page-section">
        <h2 className="card-header">
          {t('pageContent.settings.profile') ?? 'Change your appearance'}
        </h2>

        <div className="profile-settings-row">
          {user?.photoURL && (
            <img
              className="cover-img user-avatar"
              src={user.photoURL}
              alt={`${user.displayName} profile`}
            />
          )}
          <ProfileSettings
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            runSave={runSave}
            resetData={resetField}
          />
        </div>
      </section>

      <section className="settings-page-section">
        <h2 className="card-header">
          {t('pageContent.settings.budgetPref') ?? 'Budget Preferences'}
        </h2>

        <BudgetSettings
          formData={formData}
          applyToCurrentMonth={applyToCurrentMonth}
          setApplyToCurrentMonth={setApplyToCurrentMonth}
          setFormData={setFormData}
          handleChange={handleChange}
          runSave={runSave}
          resetData={resetField}
        />
      </section>

      <section className="settings-page-section">
        <h2 className="card-header">{t('pageContent.settings.appPref') ?? 'App Preferences'}</h2>

        <AppSettings
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          runSave={runSave}
          resetData={resetField}
        />
      </section>
    </>
  );
};

export default DesktopSettingsPage;
