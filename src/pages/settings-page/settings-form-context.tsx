import { createContext, useContext } from 'react';
import type { SettingsFormData } from './settings-shell.component';
import { useSettingsForm } from './use-settings-form.hook';

export type SettingsFormApi = ReturnType<typeof useSettingsForm>;
const SettingsFormContext = createContext<SettingsFormApi | null>(null);

export function SettingsFormProvider({
  initial,
  uid,
  children,
}: { initial: SettingsFormData; uid?: string | null; children: React.ReactNode }) {
  const value = useSettingsForm(initial, uid);
  return <SettingsFormContext.Provider value={value}>{children}</SettingsFormContext.Provider>;
}

export function useSettingsFormContext() {
  const ctx = useContext(SettingsFormContext);
  if (!ctx) throw new Error('useSettingsFormContext must be used within <SettingsFormProvider>');
  return ctx;
}