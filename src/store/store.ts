import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-store/auth.slice'; // path & filename must match case exactly
import budgetReducer from './budget-store/budget.slice'; // path & filename must match case exactly

const rootReducer = combineReducers({
  auth: authReducer,
  budget: budgetReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
