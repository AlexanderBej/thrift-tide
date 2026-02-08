import { RxDashboard } from 'react-icons/rx';
import { MdOutlineCategory } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';
import { CiSettings } from 'react-icons/ci';
import { IconType } from 'react-icons';
import { FaHistory } from 'react-icons/fa';
import { MdInsights } from 'react-icons/md';

export type NavItem = {
  key: string;
  to: string;
  label: string;
  i18nLabel: string;
  icon: IconType;
  badgeCount?: number; // optional
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    to: '/',
    label: 'Dashboard',
    i18nLabel: 'pages.dashboard',
    icon: RxDashboard,
  },
  {
    key: 'buckets',
    to: '/buckets',
    label: 'Buckets',
    i18nLabel: 'pages.buckets',
    icon: MdOutlineCategory,
  },
  {
    key: 'txns',
    to: '/transactions',
    label: 'Transactions',
    i18nLabel: 'pages.transactions',
    icon: GrTransaction,
  },
  {
    key: 'insights',
    to: '/insights',
    label: 'Insights',
    i18nLabel: 'pages.insights',
    icon: MdInsights,
  },
  {
    key: 'history',
    to: '/history',
    label: 'History',
    i18nLabel: 'pages.history',
    icon: FaHistory,
  },
  {
    key: 'profile',
    to: '/profile',
    label: 'Profile',
    i18nLabel: 'pages.profile',
    icon: CiSettings,
  },
];
