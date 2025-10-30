import { createSelector } from '@reduxjs/toolkit';
import { selectAuthLoading, selectAuthStatus } from './auth-store/auth.selectors';
import { RootState } from './store';
import { selectBudgetLoadStatus } from './budget-store/budget.selectors.base';

const selectSettingsStatus = (s: RootState) => s.settings.status;

// 1) Single “key” that fully describes boot state (always a stable string)
export const selectBootKey = createSelector(
  [selectAuthStatus, selectAuthLoading, selectSettingsStatus, selectBudgetLoadStatus],
  (authStatus, authLoading, settingsStatus, budgetLoadStatus) => {
    if (authStatus === 'idle' || authLoading) return 'boot:auth';
    if (authStatus === 'unauthenticated') return 'ready:guest';
    if (settingsStatus !== 'ready') return 'boot:settings';
    if (budgetLoadStatus !== 'ready') return 'boot:budget';
    return 'ready:ok';
  },
);

// 2) Convenient primitives (stable)
export const selectIsBooting = createSelector([selectBootKey], (k) => k.startsWith('boot:'));
export const selectBootReason = createSelector([selectBootKey], (k) => k.split(':')[1]);

// 3) If you want the old object shape, map keys -> frozen objects (stable references)
const BOOT_MAP = {
  'boot:auth': Object.freeze({ booting: true, reason: 'auth' as const }),
  'boot:settings': Object.freeze({ booting: true, reason: 'settings' as const }),
  'boot:budget': Object.freeze({ booting: true, reason: 'budget' as const }),
  'ready:guest': Object.freeze({ booting: false, reason: 'guest' as const }),
  'ready:ok': Object.freeze({ booting: false, reason: 'ready' as const }),
} as const;

export const selectAppBootState = createSelector(
  [selectBootKey],
  (key) => BOOT_MAP[key as keyof typeof BOOT_MAP],
);
