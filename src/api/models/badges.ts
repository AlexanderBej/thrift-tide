import { Category } from '../types/category.types';

export type BadgeKind = 'danger' | 'warn' | 'info' | 'success';

export type Badge = {
  id: string;
  text: string;
  kind: BadgeKind;
  scope?: 'total' | Category;
};
