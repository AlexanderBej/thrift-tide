import { RxDashboard } from 'react-icons/rx';
import { MdOutlineCategory } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';
import { CiSettings } from 'react-icons/ci';
import { IconType } from 'react-icons';

export type NavItem = {
  key: string;
  to: string;
  label: string;
  icon: IconType;
  badgeCount?: number; // optional
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', to: '/', label: 'Dashboard', icon: RxDashboard },
  { key: 'categories', to: '/categories', label: 'Categories', icon: MdOutlineCategory },
  { key: 'txns', to: '/transactions', label: 'Transactions', icon: GrTransaction },
  { key: 'settings', to: '/settings', label: 'Settings', icon: CiSettings },
];
