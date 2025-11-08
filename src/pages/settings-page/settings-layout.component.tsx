import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { DEFAULT_THEME } from '@api/types';
import { SettingsFormProvider } from './settings-form-context';
import { Breadcrumbs } from '@shared/ui';
import { useLayoutTitle } from '@shared/hooks';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsAll } from '@store/settings-store';

import './settings-layout.styles.scss';

const SettingsLayout: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const { currency, defaultPercents, language, startDay, theme } = useSelector(selectSettingsAll);

  const { isMobile, title, subtitle, pathname } = useLayoutTitle();

  const initial = {
    percents: defaultPercents,
    startDay,
    currency,
    language,
    theme: theme ?? DEFAULT_THEME,
    displayName: user?.displayName ?? '',
  };

  const isHeaderVisible = () => {
    return (
      isMobile &&
      (pathname.includes('profile') || pathname.includes('budget') || pathname.includes('app'))
    );
  };

  return (
    <SettingsFormProvider initial={initial} uid={user?.uuid}>
      <div className="settings-page">
        {isHeaderVisible() && (
          <>
            <h1 className="setting-page-title">{title}</h1>
            <Breadcrumbs />
            <h2 className="setting-page-subtitle">{subtitle}</h2>
          </>
        )}

        <Outlet />
      </div>
    </SettingsFormProvider>
  );
};

export default SettingsLayout;
