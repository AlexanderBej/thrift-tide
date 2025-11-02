import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

import { authLoading, userSignedIn, userSignedOut } from '../store/auth-store/auth.slice';
import { AppDispatch } from '../store/store';
import { _setTxns, cleanupListeners, initBudget } from '../store/budget-store/budget.slice';
import { onTransactionsSnapshot } from '../api/services/budget.service';
import { auth } from '../api/services/firebase.service';
import { loadSettings } from '../store/settings-store/settings.slice';
import { watchThemeChanges } from './theme-listener.util';

export const initApp = (dispatch: AppDispatch) => {
  dispatch(authLoading());

  const unsubTheme = watchThemeChanges(); // 👈 start listening to store theme

  const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
    // Clear previous listeners whenever auth changes
    dispatch(cleanupListeners());

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
      dispatch(loadSettings({ uid: fbUser.uid }))
        .unwrap()
        .then((set) => console.log(set))
        .finally(async () => {
          // Initialize budget (uses current or remembered month)
          const result = await dispatch(initBudget({ uid: fbUser.uid })).unwrap(); // will compute monthKey using loaded startDay

          if (result) {
            // Attach live txns listener that dispatches into Redux
            const unsub = onTransactionsSnapshot(fbUser.uid, result.month, (txns) => {
              dispatch(_setTxns(txns));
            });
            return unsub;
          }
        });
    } catch (error) {
      console.warn('App init error:', error);
      toast.error('Could not load app!');
    }
  });

  return () => {
    try {
      unsubAuth();
      unsubTheme(); // 👈 good hygiene but optional
    } catch {}
    // also ensure listeners are cleaned if app unmounts
    dispatch(cleanupListeners());
  };
};
