import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useWindowWidth } from './window-width.hook';

const PATH_TITLES: Record<string, string> = {
  '': 'pages.dashboard',
  dashboard: 'pages.dashboard',
  buckets: 'pages.buckets',
  bucket: 'pages.bucket',
  transactions: 'pages.transactions',
  insights: 'pages.insights',
  history: 'pages.history',
  settings: 'pages.settings',
  profile: 'pages.profile',
  budget: 'pages.budget',
  app: 'pages.app',
};

const PATH_SUBTITLES: Record<string, string> = {
  profile: 'pages.profile',
  app: 'pages.app',
  budget: 'pages.budget',
};

export function useLayoutTitle() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const width = useWindowWidth();
  const isMobile = width < 480;

  const getTitle = useCallback(
    (path: string) => {
      const parts = path.replace(/^\/+/, '').split('/');
      const first = parts[0] ?? '';

      const key = PATH_TITLES[first] || PATH_TITLES[''];
      if (key) return t(key);

      return first
        ? first.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : t('pages.settings');
    },
    [t],
  );

  const getSubtitle = (path: string) => {
    const parts = path.replace(/^\/+/, '').split('/');
    const sub = parts[1]; // /settings/[sub]
    if (!sub) return '';
    const key = PATH_SUBTITLES[sub];
    return key ? t(key) : sub.charAt(0).toUpperCase() + sub.slice(1);
  };

  const subtitle = getSubtitle(pathname);

  const title = getTitle(pathname);

  const api = useMemo(
    () => ({
      t,
      isMobile,
      getTitle,
      title,
      subtitle,
      pathname,
    }),
    [t, isMobile, getTitle, title, subtitle, pathname],
  );

  return api;
}
