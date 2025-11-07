import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState, useCallback, useMemo } from 'react';

import { PercentTriple } from '../../api/types/percent.types';
import { SettingsFormData } from './settings-shell.component';
import { AppDispatch } from '../../store/store';
import {
  updateDefaultPercentsThunk,
  saveStartDayThunk,
  updateCurrencyThunk,
  saveLanguageThunk,
  setAppThemeThunk,
} from '../../store/settings-store/settings.slice';
import { updateDisplayNameThunk } from '../../store/auth-store/auth.slice';

type SaveKey = keyof SettingsFormData;

type RunSave = <K extends SaveKey>(key: K) => Promise<void>;
type ResetField = <K extends SaveKey>(key: K, value: SettingsFormData[K]) => void;

export function useSettingsForm(initial: SettingsFormData, uid?: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState<SettingsFormData>(initial);
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData(
        (prev) =>
          ({
            ...prev,
            [name]: name === 'startDay' ? Number(value).toFixed(0) : value,
          }) as SettingsFormData,
      );
    },
    [],
  );

  const resetField: ResetField = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runSave: RunSave = useCallback(
    async (key) => {
      if (!uid) return;

      const value = formData[key];

      const config: Record<
        SaveKey,
        {
          thunk: any;
          build: (v: SettingsFormData[SaveKey]) => any;
          onSuccess?: (res: any, v: any) => void;
        }
      > = {
        percents: {
          thunk: updateDefaultPercentsThunk,
          build: (v) => ({
            uid,
            percents: {
              needs: (v as PercentTriple).needs,
              wants: (v as PercentTriple).wants,
              savings: (v as PercentTriple).savings,
            },
            applyToCurrentMonth, // you have this in desktop; pass it through when relevant
          }),
        },
        startDay: { thunk: saveStartDayThunk, build: (v) => ({ uid, startDay: Number(v) }) },
        currency: { thunk: updateCurrencyThunk, build: (v) => ({ uid, currency: v }) },
        language: {
          thunk: saveLanguageThunk,
          build: (v) => ({ uid, language: v }),
          onSuccess: (res, v) => {
            if (res?.language === v) i18n.changeLanguage(res.language as string);
          },
        },
        theme: { thunk: setAppThemeThunk, build: (v) => ({ uid, theme: v }) },
        displayName: { thunk: updateDisplayNameThunk, build: (v) => ({ uid, displayName: v }) },
      };

      const { thunk, build, onSuccess } = config[key];
      const payload = build(value);

      const res = await dispatch(thunk(payload)).unwrap();
      onSuccess?.(res, value);
    },
    [applyToCurrentMonth, dispatch, formData, i18n, uid],
  );

  // handy helpers for partial pages
  const setField = useCallback(<K extends SaveKey>(key: K, val: SettingsFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  }, []);

  const api = useMemo(
    () => ({
      formData,
      setFormData, // same signature as useState setter → your existing components keep working
      setField,
      handleChange,
      resetField,
      runSave,
      applyToCurrentMonth,
      setApplyToCurrentMonth,
    }),
    [formData, handleChange, resetField, runSave, setField, applyToCurrentMonth],
  );

  return api;
}
