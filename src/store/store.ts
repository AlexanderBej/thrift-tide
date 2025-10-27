import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-store/auth.slice'; // path & filename must match case exactly
import budgetReducer from './budget-store/budget.slice'; // path & filename must match case exactly
import settingsReducer from './settings-store/settings.slice'; // path & filename must match case exactly
import historyReducer from './history-store/history.slice'; // path & filename must match case exactly

const rootReducer = combineReducers({
  auth: authReducer,
  budget: budgetReducer,
  settings: settingsReducer,
  history: historyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
