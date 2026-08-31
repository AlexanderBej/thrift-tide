import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { buildInsightsAnalytics } from '../../pages/insights/insights-analytics.util';

export const selectInsightsRows = (s: RootState) => s.insights.rows;
export const selectInsightsStatus = (s: RootState) => s.insights.status;
export const selectInsightsError = (s: RootState) => s.insights.error;

export const selectInsightsAnalytics = createSelector([selectInsightsRows], (rows) =>
  buildInsightsAnalytics(rows),
);
