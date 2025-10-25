import { onAuthStateChanged } from 'firebase/auth';
import { authLoading, userSignedIn, userSignedOut } from '../store/auth-store/auth.slice';
import { AppDispatch } from '../store/store';
import { auth, onTransactionsSnapshot } from './firebase.util';
import { _setTxns, cleanupListeners, initBudget } from '../store/budget-store/budget.slice';

export const initApp = (dispatch: AppDispatch) => {
  dispatch(authLoading());

  return onAuthStateChanged(auth, async (fbUser) => {
    // Clear previous listeners whenever auth changes
    // dispatch(_clearUnsub());
    dispatch(cleanupListeners());

    if (fbUser) {
      dispatch(
        userSignedIn({
          uuid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
        }),
      );

      // Initialize budget (uses current or remembered month)
      const result = await dispatch(initBudget({ uid: fbUser.uid })).unwrap();
      console.log('user', fbUser);

      console.log('result', result);

      // Attach live txns listener that dispatches into Redux
      const unsub = onTransactionsSnapshot(fbUser.uid, result.month, (txns) => {
        dispatch(_setTxns(txns));
      });

      // Store the new unsub in budget slice (reuse _clearUnsub to clean it)
      // quick hack: dispatching initBudget already stored its unsub; we replace it here:
      // or simply rely on the one from initBudget if you prefer.
      // For clarity, you can move the listener creation into initBudget if you like.
    } else {
      dispatch(userSignedOut());
    }
  });
};
