import { isAnyOf, Middleware } from '@reduxjs/toolkit';
import { loadHistoryPage } from '../history-store/history.slice';
import toast from 'react-hot-toast';

import i18n from '../../i18n/i18n';

export const historyToastMiddleware: Middleware = () => (next) => (action) => {
  // errors
  if (isAnyOf(loadHistoryPage.rejected)(action)) {
    const map: Record<string, string> = {
      [loadHistoryPage.rejected.type]: i18n.t('budget:toast.history.loadFailed'),
    };
    const msg = map[action.type];
    if (msg) toast.error(msg);
  }

  return next(action);
};
