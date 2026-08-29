import toast from 'react-hot-toast';
import { isAnyOf, Middleware } from '@reduxjs/toolkit';

import i18n from '../../i18n/i18n';
import {
  initBudget,
  setIncomeThunk,
  setIncomeForPeriod,
  setPercentsThunk,
  updateTxnThunk,
  updateTxnInMonthThunk,
  deleteTxnThunk,
  deleteTxnFromMonthThunk,
  changeMonthThunk,
} from '../budget-store/budget.slice';

export const budgetToastMiddleware: Middleware = () => (next) => (action) => {
  // success
  if (
    isAnyOf(
      setIncomeThunk.fulfilled,
      setIncomeForPeriod.fulfilled,
      setPercentsThunk.fulfilled,
      updateTxnThunk.fulfilled,
      updateTxnInMonthThunk.fulfilled,
      deleteTxnThunk.fulfilled,
      deleteTxnFromMonthThunk.fulfilled,
    )(action)
  ) {
    const map: Record<string, string> = {
      [setIncomeThunk.fulfilled.type]: i18n.t('budget:toast.setIncome.success'),
      [setIncomeForPeriod.fulfilled.type]: i18n.t('budget:toast.setIncome.success'),
      [setPercentsThunk.fulfilled.type]: i18n.t('budget:toast.percents.success'),
      [updateTxnThunk.fulfilled.type]: i18n.t('budget:toast.txn.updated'),
      [updateTxnInMonthThunk.fulfilled.type]: i18n.t('budget:toast.txn.updated'),
      [deleteTxnThunk.fulfilled.type]: i18n.t('budget:toast.txn.deleted'),
      [deleteTxnFromMonthThunk.fulfilled.type]: i18n.t('budget:toast.txn.deleted'),
    };
    const msg = map[action.type];
    if (msg) toast.success(msg);
  }

  // errors
  if (
    isAnyOf(
      initBudget.rejected,
      setIncomeThunk.rejected,
      setIncomeForPeriod.rejected,
      setPercentsThunk.rejected,
      updateTxnThunk.rejected,
      updateTxnInMonthThunk.rejected,
      deleteTxnThunk.rejected,
      deleteTxnFromMonthThunk.rejected,
      changeMonthThunk.rejected,
    )(action)
  ) {
    const map: Record<string, string> = {
      [initBudget.rejected.type]: i18n.t('budget:toast.init.error'),
      [setIncomeThunk.rejected.type]: i18n.t('budget:toast.setIncome.error'),
      [setIncomeForPeriod.rejected.type]: i18n.t('budget:toast.setIncome.error'),
      [setPercentsThunk.rejected.type]: i18n.t('budget:toast.percents.error'),
      [updateTxnThunk.rejected.type]: i18n.t('budget:toast.txn.updateFailed'),
      [updateTxnInMonthThunk.rejected.type]: i18n.t('budget:toast.txn.updateFailed'),
      [deleteTxnThunk.rejected.type]: i18n.t('budget:toast.txn.deleteFailed'),
      [deleteTxnFromMonthThunk.rejected.type]: i18n.t('budget:toast.txn.deleteFailed'),
      [changeMonthThunk.rejected.type]: i18n.t('budget:toast.changeMonth.error'),
    };
    const msg = map[action.type];
    if (msg) toast.error(msg);
  }

  return next(action);
};
