export interface RouteMeta {
  path: string;
  titleKey?: string;
  showBack?: boolean;
  backFallback?: string;
  showPeriod?: boolean;
  dashboard?: boolean;
}

export const routes: RouteMeta[] = [
  {
    path: '/',
    dashboard: true,
    showPeriod: true,
  },
  {
    path: '/settings',
    titleKey: 'common:pages.settings',
    showPeriod: true,
  },
  {
    path: '/insights',
    titleKey: 'common:pages.insights',
    showPeriod: false,
  },
  {
    path: '/transactions',
    titleKey: 'common:pages.transactions',
    showPeriod: true,
  },
  {
    path: '/categories',
    titleKey: 'common:pages.categories',
    showBack: true,
    backFallback: '/profile',
    showPeriod: true,
  },
  {
    path: '/categories/needs',
    titleKey: 'taxonomy:categoryNames.needs',
    showBack: true,
    backFallback: '/categories',
    showPeriod: true,
  },
  {
    path: '/categories/wants',
    titleKey: 'taxonomy:categoryNames.wants',
    showBack: true,
    backFallback: '/categories',
    showPeriod: true,
  },
  {
    path: '/categories/savings',
    titleKey: 'taxonomy:categoryNames.savings',
    showBack: true,
    backFallback: '/categories',
    showPeriod: true,
  },
  {
    path: '/history',
    titleKey: 'common:pages.history',
    showBack: true,
    backFallback: '/profile',
    showPeriod: false,
  },
  {
    path: '/profile',
    titleKey: 'common:pages.profile',
    showPeriod: true,
  },
];

export const getRouteMeta = (pathname: string) => routes.find((route) => route.path === pathname);
