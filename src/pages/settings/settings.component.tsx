import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { selectBudgetDoc } from '../../store/budget-store/budget.selectors.base';
import {
  saveLanguageThunk,
  saveStartDayThunk,
  setAppThemeThunk,
  updateCurrencyThunk,
  updateDefaultPercentsThunk,
} from '../../store/settings-store/settings.slice';
import { selectSettingsAll } from '../../store/settings-store/settings.selectors';
import { Currency, DEFAULT_THEME, Language, Theme } from '../../api/types/settings.types';
import { PercentTriple } from '../../api/types/percent.types';
import BudgetSettings from './settings-sections/budget-settings.component';
import AppSettings from './settings-sections/app-settings.component';

import './settings.styles.scss';

interface SettingsFormData {
  percents: PercentTriple;
  startDay: number;
  currency: Currency;
  language: Language;
  theme: Theme;
}

type SaveKey = keyof SettingsFormData;

export interface SettingsSectionProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
  runSave: <K extends SaveKey>(key: K) => Promise<void>;
  resetData: <K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation(['common', 'budget']);

  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const { currency, defaultPercents, language, startDay, theme } = useSelector(selectSettingsAll);

  const defaultValues: SettingsFormData = {
    percents: defaultPercents,
    startDay,
    currency,
    language,
    theme: theme ?? DEFAULT_THEME,
  };

  const [formData, setFormData] = useState<SettingsFormData>(defaultValues);
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState<boolean>(false);

  const hasUserAndDoc = !!user?.uuid && !!doc;

  type SaveKey = keyof SettingsFormData;

  const runSave = useCallback(
    async <K extends SaveKey>(key: K) => {
      if (!hasUserAndDoc) return;

      const uid = user!.uuid;
      const value = formData[key];

      // Per-setting config (payload builder + optional onSuccess)
      const config: Record<
        SaveKey,
        {
          thunk: any;
          buildPayload: (uid: string, v: SettingsFormData[SaveKey]) => any;
          onSuccess?: (res: any, v: any) => void;
        }
      > = {
        percents: {
          thunk: updateDefaultPercentsThunk,
          buildPayload: (uid, v) => ({
            uid,
            percents: {
              needs: (v as PercentTriple).needs,
              wants: (v as PercentTriple).wants,
              savings: (v as PercentTriple).savings,
            },
          }),
        },
        startDay: {
          thunk: saveStartDayThunk,
          buildPayload: (uid, v) => ({ uid, startDay: Number(v) }),
        },
        currency: {
          thunk: updateCurrencyThunk,
          buildPayload: (uid, v) => ({ uid, currency: v }),
        },
        language: {
          thunk: saveLanguageThunk,
          buildPayload: (uid, v) => ({ uid, language: v }),
          onSuccess: (res, v) => {
            if (res?.language === v) i18n.changeLanguage(res.language as string);
          },
        },
        theme: {
          thunk: setAppThemeThunk,
          buildPayload: (uid, v) => ({ uid, theme: v }),
        },
      };

      const { thunk, buildPayload, onSuccess } = config[key];
      const payload = buildPayload(uid, value);

      try {
        const res = await dispatch(thunk(payload)).unwrap();
        onSuccess?.(res, value);
      } catch (err) {
        throw err;
      }
    },
    [dispatch, formData, hasUserAndDoc, i18n, user],
  );

  const resetData = <K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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

        <BudgetSettings
          formData={formData}
          applyToCurrentMonth={applyToCurrentMonth}
          setApplyToCurrentMonth={setApplyToCurrentMonth}
          setFormData={setFormData}
          handleChange={handleChange}
          runSave={runSave}
          resetData={resetData}
        />
      </section>

      <section className="settings-page-section">
        <h2 className="card-header">{t('pageContent.settings.appPref') ?? 'App Preferences'}</h2>

        <AppSettings
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          runSave={runSave}
          resetData={resetData}
        />
      </section>
    </div>
  );
};

export default Settings;
