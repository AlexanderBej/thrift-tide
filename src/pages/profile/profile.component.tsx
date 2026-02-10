import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BiReset } from 'react-icons/bi';

import { signOutUser } from '@api/services';
import { Donut, DonutItem, TTIcon } from '@shared/ui';
import { selectAuthUser, userSignedOut } from '@store/auth-store';
import { AppDispatch } from '@store/store';
import { UserAvatar } from '@shared/components';
import { selectSettingsAll, selectSettingsAppTheme } from '@store/settings-store';
import { formatStartDay, getCssVar } from '@shared/utils';
import { SettingsBlock, SettingsButton } from 'features';
import {
  BudgetSplitSheet,
  CurrencySheet,
  LanguageSheet,
  StartDaySheet,
  ThemeSheet,
} from '@widgets';
import { selectBudgetDoc } from '@store/budget-store';

import actionCategory from '../../assets/illustrations/action-bucket.png';
import actionHistory from '../../assets/illustrations/action-history.png';
import calendaryIcon from '../../assets/illustrations/calendar-ill.png';

import './profile.styles.scss';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ro: 'Română',
};

type SheetKey = 'language' | 'currency' | 'theme' | 'budget' | 'day';

const ORDER = ['needs', 'wants', 'savings'] as const;

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { t } = useTranslation(['common', 'budget', 'taxonomy']);

  const user = useSelector(selectAuthUser);
  const { defaultPercents, startDay, language, theme, currency } = useSelector(selectSettingsAll);
  const doc = useSelector(selectBudgetDoc);

  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);

  const languageLabel = LANGUAGE_LABELS[language] ?? language;

  const handleLogout = () => {
    signOutUser();
    dispatch(userSignedOut());
    navigate('/login');
  };

  const openSheet = (key: SheetKey) => setActiveSheet(key);

  const onSheetOpenChange = (key: SheetKey) => (isOpen: boolean) => {
    setActiveSheet(isOpen ? key : null);
  };

  const linkItems = [
    {
      key: 'categories',
      to: '/categories',
      label: 'Categories',
      i18nLabel: 'pages.categories',
      image: actionCategory,
    },
    {
      key: 'history',
      to: '/history',
      label: 'History',
      i18nLabel: 'pages.history',
      image: actionHistory,
    },
  ];

  const settingsToShow = {
    percents: doc?.percents ?? defaultPercents,
    startDay: doc?.startDay ?? startDay,
  };

  const donutItems: DonutItem[] = ORDER.map((key) => ({
    id: key,
    label: key,
    color: getCssVar(`--${key}`),
    value: settingsToShow.percents[key] * 100,
  }));

  return (
    <div className="profile-page">
      <section className={`user-container user-container__${theme}`}>
        <div className="user-info">
          <UserAvatar medium />
          <div className="user-details">
            <h3>{user?.displayName}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <h3 className="quick-actions">{t('pageContent.profile.quick')}</h3>
        <div className="quick-action-links">
          {linkItems.map((link, index) => (
            <NavLink key={index} to={link.to} className={clsx('action-link', link.key)}>
              <img src={link.image} width={50} alt="Logo" />
              <span>{t(link.i18nLabel)}</span>
            </NavLink>
          ))}
        </div>
      </section>

      <SettingsBlock title="GENERAL">
        <SettingsButton
          title={t('settings:shortNames.language') ?? 'Language'}
          value={languageLabel}
          openSheet={() => openSheet('language')}
        />
        <SettingsButton
          title={t('settings:shortNames.currency') ?? 'Currency'}
          value={currency}
          openSheet={() => openSheet('currency')}
        />
        <SettingsButton
          title={t('settings:shortNames.appearance') ?? 'Appearance'}
          value={theme?.toString()}
          openSheet={() => openSheet('theme')}
        />
      </SettingsBlock>

      <SettingsBlock title={t('settings:budgetPref')}>
        <SettingsButton
          openSheet={() => openSheet('budget')}
          title={
            <div className="settings-label-wrapper">
              <Donut height={50} showTooltip={false} data={donutItems} />
              <div className="settings-title-wrapper">
                <h3>{t('settings:percents.title')}</h3>
                <div className="settings-subtitle">
                  {donutItems.map((item, index) => (
                    <div key={index} className="percent-legend">
                      <span style={{ textTransform: 'capitalize' }}>
                        {t(`taxonomy:categoryNames.${item.label}`)}
                      </span>
                      <span style={{ color: item.color, fontWeight: 900 }}>
                        {Math.round(item.value)}%
                      </span>
                      {index < 2 && <span>&bull;</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        />
        <SettingsButton
          openSheet={() => openSheet('day')}
          title={
            <div className="settings-label-wrapper">
              <img src={calendaryIcon} height={50} alt="Calendar" />
              <div className="settings-title-wrapper">
                <h3>{t('settings:startDay.title')}</h3>
                <span className="settings-subtitle">
                  {formatStartDay(doc?.startDay, language) ?? formatStartDay(startDay, language)}{' '}
                  {t('pageContent.profile.eachMonth')}
                </span>
              </div>
            </div>
          }
        />
      </SettingsBlock>

      <SettingsBlock title="DATA">
        <SettingsButton
          openSheet={() => openSheet('language')}
          title={
            <div className="settings-label-wrapper">
              <TTIcon icon={BiReset} size={22} color={getCssVar('--error')} />
              <span className="settings-label error-label">{t('pageContent.profile.reset')}</span>
            </div>
          }
        />
      </SettingsBlock>

      <section className="tt-section">
        <button onClick={handleLogout} className={`logout-btn logout-btn__${theme}`}>
          <span>{t('pageContent.profile.logout')}</span>
        </button>
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
    </div>
  );
};

export default ProfilePage;
