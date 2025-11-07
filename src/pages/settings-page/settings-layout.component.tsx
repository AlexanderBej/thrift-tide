import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectSettingsAll } from '../../store/settings-store/settings.selectors';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { DEFAULT_THEME } from '../../api/types/settings.types';
import { SettingsFormProvider } from './settings-form-context';
import { useLayoutTitle } from '../../utils/use-layout-title.hook';

import './settings-layout.styles.scss';
import Breadcrumbs from '../../components-ui/breadcrumb/breadcrumb.component';

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
