import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BiReset } from 'react-icons/bi';
import { FaChartPie, FaHistory, FaPalette, FaWallet } from 'react-icons/fa';
import { FiGlobe, FiLogOut } from 'react-icons/fi';
import { MdOutlineCategory, MdOutlineToday } from 'react-icons/md';

import { signOutUser } from '@api/services';
import { Button } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import { AppDispatch } from '@store/store';
import { UserAvatar } from '@shared/components';
import { selectSettingsAll } from '@store/settings-store';
import { formatStartDay } from '@shared/utils/format-data.util';
import { BudgetSplitSheet, ConfirmSheet } from '@widgets';
import CurrencySheet from 'widgets/sheets/currency-sheet/currency-sheet.component';
import LanguageSheet from 'widgets/sheets/language-sheet/language-sheet.component';
import StartDaySheet from 'widgets/sheets/start-day-sheet/start-day-sheet.component';
import ThemeSheet from 'widgets/sheets/theme-sheet/theme-sheet.component';
import { resetCurrentPeriodThunk, selectBudgetDoc } from '@store/budget-store';
import { ProfileButtonRow, ProfileNavRow, ProfileSection } from 'features/profile';

import './profile.styles.scss';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ro: 'Română',
};

type SheetKey = 'language' | 'currency' | 'theme' | 'budget' | 'day';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { t } = useTranslation(['common', 'settings', 'taxonomy']);

  const user = useSelector(selectAuthUser);
  const { defaultPercents, startDay, language, theme, currency } = useSelector(selectSettingsAll);
  const doc = useSelector(selectBudgetDoc);

  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const settingsToShow = {
    percents: doc?.percents ?? defaultPercents,
    startDay: doc?.startDay ?? startDay,
  };

  // const budgetSplitValue = ORDER.map(
  //   (key) => `${Math.round(settingsToShow.percents[key] * 100)}%`,
  // ).join(' / ');

  const startDayValue = `${formatStartDay(settingsToShow.startDay, language)} ${String(
    t('pageContent.profile.eachMonth'),
  )}`;
  const languageLabel = LANGUAGE_LABELS[language] ?? language;
  const appearanceLabel = theme ? String(t(`settings:theme.values.${theme}`)) : '';

  const handleLogout = async () => {
    if (logoutPending) return;

    setLogoutPending(true);
    try {
      await signOutUser();
      navigate('/login');
    } catch {
      toast.error(String(t('common:errors.generic')));
      setLogoutPending(false);
    }
  };

  const handleResetCurrentPeriod = async () => {
    if (!user?.uuid) return;
    await dispatch(resetCurrentPeriodThunk({ uid: user.uuid })).unwrap();
    setResetOpen(false);
  };

  const openSheet = (key: SheetKey) => setActiveSheet(key);

  const onSheetOpenChange = (key: SheetKey) => (isOpen: boolean) => {
    setActiveSheet(isOpen ? key : null);
  };

  return (
    <div className="profile-page">
      <section className="profile-identity" aria-label={String(t('pageContent.profile.account'))}>
        <UserAvatar medium />
        <div className="profile-identity__copy">
          <h1>{user?.displayName || String(t('pageContent.profile.fallbackName'))}</h1>
          {user?.email && <p>{user.email}</p>}
        </div>
      </section>

      <ProfileSection title={String(t('pageContent.profile.sections.explore'))}>
        <ProfileNavRow
          to="/categories"
          icon="category"
          title={String(t('pages.categories'))}
          subtitle={String(t('pageContent.profile.explore.categories'))}
        />
        <ProfileNavRow
          to="/history"
          icon="history"
          title={String(t('pages.history'))}
          subtitle={String(t('pageContent.profile.explore.history'))}
        />
      </ProfileSection>

      <ProfileSection title={String(t('pageContent.profile.sections.preferences'))}>
        <ProfileButtonRow
          icon={FiGlobe}
          title={String(t('settings:shortNames.language'))}
          value={languageLabel}
          onClick={() => openSheet('language')}
        />
        <ProfileButtonRow
          icon={FaWallet}
          title={String(t('settings:shortNames.currency'))}
          value={currency}
          onClick={() => openSheet('currency')}
        />
        <ProfileButtonRow
          icon={FaPalette}
          title={String(t('settings:shortNames.appearance'))}
          value={appearanceLabel}
          onClick={() => openSheet('theme')}
        />
      </ProfileSection>

      <ProfileSection title={String(t('pageContent.profile.sections.budgetSetup'))}>
        <ProfileButtonRow
          icon="donut"
          title={String(t('settings:percents.title'))}
          percents={settingsToShow.percents}
          onClick={() => openSheet('budget')}
        />
        <ProfileButtonRow
          icon="calendar"
          title={String(t('settings:startDay.title'))}
          value={startDayValue}
          onClick={() => openSheet('day')}
        />
      </ProfileSection>

      <ProfileSection title={String(t('pageContent.profile.sections.data'))}>
        <ProfileButtonRow
          icon={BiReset}
          title={String(t('pageContent.profile.reset'))}
          subtitle={String(t('pageContent.profile.resetSubtitle'))}
          tone="danger"
          onClick={() => setResetOpen(true)}
        />
      </ProfileSection>

      <section className="profile-logout">
        <Button
          variant="quiet"
          size="md"
          icon={FiLogOut}
          haptic="light"
          loading={logoutPending}
          onClick={handleLogout}
        >
          {String(t('pageContent.profile.logout'))}
        </Button>
      </section>

      <LanguageSheet
        open={activeSheet === 'language'}
        onOpenChange={onSheetOpenChange('language')}
      />
      <CurrencySheet
        open={activeSheet === 'currency'}
        onOpenChange={onSheetOpenChange('currency')}
      />
      <ThemeSheet open={activeSheet === 'theme'} onOpenChange={onSheetOpenChange('theme')} />
      <BudgetSplitSheet
        open={activeSheet === 'budget'}
        onOpenChange={onSheetOpenChange('budget')}
      />
      <StartDaySheet open={activeSheet === 'day'} onOpenChange={onSheetOpenChange('day')} />
      <ConfirmSheet
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={String(t('pageContent.profile.resetConfirm.title'))}
        description={String(t('pageContent.profile.resetConfirm.description'))}
        cancelLabel={String(t('actions.cancel'))}
        confirmLabel={String(t('pageContent.profile.resetConfirm.confirm'))}
        tone="destructive"
        onConfirm={handleResetCurrentPeriod}
      />
    </div>
  );
};

export default ProfilePage;
