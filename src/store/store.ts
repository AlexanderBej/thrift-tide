import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';

import authReducer, { userSignedOut } from './auth-store/auth.slice'; // path & filename must match case exactly
import budgetReducer, { cleanupListeners, resetTxnFilters } from './budget-store/budget.slice'; // path & filename must match case exactly
import settingsReducer from './settings-store/settings.slice'; // path & filename must match case exactly
import historyReducer, { resetHistory } from './history-store/history.slice'; // path & filename must match case exactly

const lm = createListenerMiddleware();

lm.startListening({
  matcher: isAnyOf(userSignedOut),
  effect: async (_, api) => {
    api.dispatch(cleanupListeners());
    api.dispatch(resetHistory());
    api.dispatch(resetTxnFilters());
    localStorage.removeItem('month');
  },
});

const rootReducer = combineReducers({
  auth: authReducer,
  budget: budgetReducer,
  settings: settingsReducer,
  history: historyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (gdm) => gdm().concat(lm.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
