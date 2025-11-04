import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { selectBudgetDoc } from '../../store/budget-store/budget.selectors.base';
import Select, { SelectOption } from '../../components-ui/select/select.component';
import {
  saveLanguageThunk,
  saveStartDayThunk,
  updateCurrencyThunk,
  updateDefaultPercentsThunk,
} from '../../store/settings-store/settings.slice';
import { selectSettingsAll } from '../../store/settings-store/settings.selectors';
import { Currency, Language } from '../../api/types/settings.types';
import PercentsSelectors from '../../components/percents-selectors/percents-selectors.component';
import StartDayEditor from '../../components/start-day-editor/start-day-editor.component';
import Setting from './setting/setting.component';
import { PercentTriple } from '../../api/types/percent.types';

import './settings.styles.scss';

interface SettingsFormData {
  percents: PercentTriple;
  startDay: number;
  currency: Currency;
  language: Language;
}

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation(['common', 'budget']);

  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const { currency, defaultPercents, language, startDay, theme, status } =
    useSelector(selectSettingsAll);

  const defaultValues: SettingsFormData = {
    percents: defaultPercents,
    startDay,
    currency,
    language,
  };

  const [formData, setFormData] = useState<SettingsFormData>(defaultValues);

  const languageOptions: SelectOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Română', value: 'ro' },
  ];

  const currencyOptions: SelectOption[] = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Romanian Leu (RON)', value: 'RON' },
  ];

  const savePercents = async () => {
    if (!user?.uuid || !doc) return;

    const percentsToSave = {
      needs: formData.percents.needs,
      wants: formData.percents.wants,
      savings: formData.percents.savings,
    };
    await dispatch(
      updateDefaultPercentsThunk({
        uid: user.uuid,
        percents: percentsToSave,
      }),
    )
      .unwrap()
      .catch((err) => {
        throw err;
      });
  };

  const saveLanguage = async () => {
    if (!user?.uuid || !doc) return;

    const languageToSave = formData.language;

    const res = await dispatch(
      saveLanguageThunk({
        uid: user.uuid,
        language: languageToSave,
      }),
    )
      .unwrap()
      .catch((err) => {
        throw err;
      });

    if (res.language === languageToSave) {
      i18n.changeLanguage(res.language);
    }
  };

  const saveStartDay = async () => {
    if (!user?.uuid || !doc) return;

    const startDayToSave = formData.startDay;
    await dispatch(
      saveStartDayThunk({
        uid: user.uuid,
        startDay: startDayToSave,
      }),
    )
      .unwrap()
      .catch((err) => {
        throw err;
      });
  };

  const saveCurrency = async () => {
    if (!user?.uuid || !doc) return;

    const currencyToSave = formData.currency;
    await dispatch(
      updateCurrencyThunk({
        uid: user.uuid,
        currency: currencyToSave,
      }),
    )
      .unwrap()
      .catch((err) => {
        throw err;
      });
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

  const resetData = (key: string, value: any) => {
    setFormData((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handlePercentsChange = (bucket: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      percents: {
        ...prev.percents,
        [bucket]: value,
      },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isStartDay = name === 'startDay';
    const num = Number(value).toFixed(0);

    setFormData((prev) => {
      return { ...prev, [name]: isStartDay ? num : value };
    });
  };

  return (
    <div className="settings-page">
      <section className="settings-page-section">
        <h2 className="card-header">
          {t('pageContent.settings.budgetPref') ?? 'Budget Preferences'}
        </h2>

        <Setting
          title={t('pageContent.settings.adjust') ?? 'Adjust your 50/30/20 split'}
          confirmMessage={
            t('confirmations.percentages') ?? 'Are you sure you want to change the percentages?'
          }
          confirmDisabled={isPercentsButtonDisabled('confirm')}
          confirmLoading={status === 'loading'}
          onConfirmClick={savePercents}
          resetDisabled={isPercentsButtonDisabled('reset')}
          onResetClick={() => resetData('percents', defaultPercents)}
        >
          <PercentsSelectors
            percents={{
              needs: formData.percents.needs,
              wants: formData.percents.wants,
              savings: formData.percents.savings,
            }}
            onPercentsChange={(bucket, value) => handlePercentsChange(bucket, value)}
          />
        </Setting>

        <hr className="divider" />

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
          onConfirmClick={saveStartDay}
          resetDisabled={Number(startDay) === Number(formData.startDay)}
          onResetClick={() => resetData('startDay', startDay)}
        >
          <StartDayEditor startDay={formData.startDay} onSetStartDay={handleChange} />
        </Setting>

        <hr className="divider" />

        <Setting
          title={t('pageContent.settings.currency') ?? 'Change your budget currency'}
          confirmMessage={
            t('confirmations.currency') ?? 'Are you sure you want to change the budget currency?'
          }
          confirmDisabled={currency === formData.currency}
          confirmLoading={status === 'loading'}
          onConfirmClick={saveCurrency}
          resetDisabled={currency === formData.currency}
          onResetClick={() => resetData('currency', currency)}
        >
          <Select
            name="currency"
            customClassName="settings-selector"
            value={formData.currency}
            options={currencyOptions}
            onChange={handleChange}
          />
        </Setting>
      </section>

      <section className="settings-page-section">
        <h2 className="card-header">{t('pageContent.settings.appPref') ?? 'App Preferences'}</h2>

        <Setting
          title={t('pageContent.settings.language') ?? 'Change the system language'}
          confirmMessage={
            t('confirmations.language') ?? 'Are you sure you want to change the language?'
          }
          confirmDisabled={language === formData.language}
          confirmLoading={status === 'loading'}
          onConfirmClick={saveLanguage}
          resetDisabled={language === formData.language}
          onResetClick={() => resetData('language', language)}
        >
          <Select
            name="language"
            customClassName="settings-selector"
            value={formData.language}
            options={languageOptions}
            onChange={handleChange}
          />
        </Setting>
      </section>
    </div>
  );
};

export default Settings;
