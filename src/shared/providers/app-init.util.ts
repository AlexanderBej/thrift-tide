import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

import { auth } from '@api/services';
import { watchThemeChanges } from '../utils/theme/theme-listener.util';
import { authLoading, userSignedOut, userSignedIn } from '@store/auth-store';
import { cleanupListeners, initBudget } from '@store/budget-store';
import { loadSettings } from '@store/settings-store';
import { AppDispatch } from '@store/store';
import { resetInsights } from '@store/insights-store';

export const initApp = (dispatch: AppDispatch) => {
  dispatch(authLoading());

  const unsubTheme = watchThemeChanges();

  const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
    // Dispose listeners belonging to the previous auth/session state.
    dispatch(cleanupListeners());
    dispatch(resetInsights());

    if (!fbUser) {
      dispatch(userSignedOut());
      return;
    }

    dispatch(
      userSignedIn({
        uuid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
      }),
    );

    try {
      // Budget month selection depends on the user's startDay,
      // so settings must finish loading first.
      await dispatch(loadSettings({ uid: fbUser.uid })).unwrap();

      // initBudget owns the selected-period transaction listener.
      await dispatch(initBudget({ uid: fbUser.uid })).unwrap();
    } catch (error) {
      console.warn('App init error:', error);
      toast.error('Could not load app!');
    }
  });

  return () => {
    try {
      unsubAuth();
      unsubTheme();
    } catch {}

    dispatch(cleanupListeners());
  };
};
