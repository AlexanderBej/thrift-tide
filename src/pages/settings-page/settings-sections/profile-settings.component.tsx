import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Setting from '../setting/setting.component';
import { SettingsSectionProps } from '../settings-shell.component';
import { selectAuthLoading, selectAuthUser } from '../../../store/auth-store/auth.selectors';
import FormInput from '../../../components-ui/form-input/form-input.component';

const ProfileSettings: React.FC<SettingsSectionProps> = ({
  formData,
  withBackground = false,
  runSave,
  resetData,
  handleChange,
}) => {
  const { t } = useTranslation(['common', 'budget']);
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);

  return (
    <>
      <Setting
        title={t('pageContent.settings.displayName') ?? 'Change your appearance'}
        confirmMessage={
          t('confirmations.language') ?? 'Are you sure you want to change the language?'
        }
        confirmDisabled={user?.displayName === formData.displayName}
        confirmLoading={loading}
        onConfirmClick={() => runSave('language')}
        resetDisabled={user?.displayName === formData.displayName}
        onResetClick={() => resetData('displayName', user?.displayName ?? '')}
        withBackground={withBackground}
        containerClassName="settings-container__profile"
      >
        <FormInput
          inputType="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
        />
      </Setting>
    </>
  );
};

export default ProfileSettings;
