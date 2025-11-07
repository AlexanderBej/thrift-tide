import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Setting from '../setting/setting.component';
import { SettingsSectionProps } from '../settings-shell.component';
import {
  selectSettingsBudgetStartDay,
  selectSettingsCurrency,
  selectSettingsDefaultPercents,
  selectSettingsStatus,
} from '../../../store/settings-store/settings.selectors';
import PercentsSelectors from '../../../components/percents-selectors/percents-selectors.component';
import CheckboxInput from '../../../components-ui/checkbox-input/checkbox-input.component';
import Select, { SelectOption } from '../../../components-ui/select/select.component';
import StartDayEditor from '../../../components/start-day-editor/start-day-editor.component';
import Popover from '../../../components-ui/info-popover/info-popover.component';

interface BudgetSettingsProps extends SettingsSectionProps {
  applyToCurrentMonth: boolean;
  setApplyToCurrentMonth: React.Dispatch<React.SetStateAction<boolean>>;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({
  formData,
  withBackground = false,
  setFormData,
  runSave,
  resetData,
  handleChange,
  applyToCurrentMonth,
  setApplyToCurrentMonth,
}) => {
  const { t } = useTranslation(['common', 'budget']);

  const defaultPercents = useSelector(selectSettingsDefaultPercents);
  const startDay = useSelector(selectSettingsBudgetStartDay);
  const currency = useSelector(selectSettingsCurrency);
  const status = useSelector(selectSettingsStatus);

  const handlePercentsChange = (bucket: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      percents: {
        ...prev.percents,
        [bucket]: value,
      },
    }));
  };

  const isPercentsButtonDisabled = (action: 'confirm' | 'reset'): boolean => {
    const total = formData.percents.needs + formData.percents.wants + formData.percents.savings;
    const notChanged =
      formData.percents.needs === defaultPercents.needs &&
      formData.percents.wants === defaultPercents.wants &&
      formData.percents.savings === defaultPercents.savings;

    if (action === 'confirm') {
      return notChanged || total > 1;
    } else {
      return notChanged;
    }
  };

  const currencyOptions: SelectOption[] = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Romanian Leu (RON)', value: 'RON' },
  ];
  return (
    <>
      <Setting
        title={t('pageContent.settings.percents.adjust') ?? 'Adjust your 50/30/20 split'}
        popoverContent=""
        confirmMessage={
          t('confirmations.percentages') ?? 'Are you sure you want to change the percentages?'
        }
        confirmDisabled={isPercentsButtonDisabled('confirm')}
        confirmLoading={status === 'loading'}
        onConfirmClick={() => runSave('percents')}
        resetDisabled={isPercentsButtonDisabled('reset')}
        onResetClick={() => resetData('percents', defaultPercents)}
        withBackground={withBackground}
      >
        <>
          <PercentsSelectors
            percents={{
              needs: formData.percents.needs,
              wants: formData.percents.wants,
              savings: formData.percents.savings,
            }}
            onPercentsChange={(bucket, value) => handlePercentsChange(bucket, value)}
          />

          <div className="apply-now-row">
            <CheckboxInput
              variant="checkbox"
              label={t('pageContent.settings.percents.checkbox') ?? 'Apply starting this month'}
              name="apply"
              checked={applyToCurrentMonth}
              onChange={(e) => setApplyToCurrentMonth(e.target.checked)}
            />

            <Popover position={'right'}>
              <span>
                {t('pageContent.settings.percents.popover') ??
                  'By checking this, the new percentages will apply from this month onwards, affecting your current budget as well.'}
              </span>
            </Popover>
          </div>
        </>
      </Setting>

      {!withBackground && <hr className="divider" />}

      <Setting
        title={t('pageContent.settings.startDay.title') ?? 'Change the start day of your period'}
        popoverContent={
          t('pageContent.settings.startDay.info') ??
          'Allowed range is from the 1st to the 28th, in order to avoid end-of-month gaps.'
        }
        confirmMessage={
          t('confirmations.startDay') ?? 'Are you sure you want to change the period start day?'
        }
        confirmDisabled={Number(startDay) === Number(formData.startDay)}
        confirmLoading={status === 'loading'}
        onConfirmClick={() => runSave('startDay')}
        resetDisabled={Number(startDay) === Number(formData.startDay)}
        onResetClick={() => resetData('startDay', startDay)}
        withBackground={withBackground}
      >
        <StartDayEditor startDay={formData.startDay} onSetStartDay={handleChange} />
      </Setting>

      {!withBackground && <hr className="divider" />}

      <Setting
        title={t('pageContent.settings.currency') ?? 'Change your budget currency'}
        confirmMessage={
          t('confirmations.currency') ?? 'Are you sure you want to change the budget currency?'
        }
        confirmDisabled={currency === formData.currency}
        confirmLoading={status === 'loading'}
        onConfirmClick={() => runSave('currency')}
        resetDisabled={currency === formData.currency}
        onResetClick={() => resetData('currency', currency)}
        withBackground={withBackground}
      >
        <Select
          name="currency"
          customClassName="settings-selector"
          value={formData.currency}
          options={currencyOptions}
          onChange={handleChange}
        />
      </Setting>
    </>
  );
};

export default BudgetSettings;
