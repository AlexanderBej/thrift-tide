import toast from 'react-hot-toast';
import { isAnyOf, Middleware } from '@reduxjs/toolkit';

import i18n from '../../i18n/i18n';
import {
  initBudget,
  setIncomeThunk,
  setIncomeForPeriod,
  setPercentsThunk,
  addTxnThunk,
  updateTxnThunk,
  deleteTxnThunk,
  changeMonthThunk,
} from '../budget-store/budget.slice';

export const budgetToastMiddleware: Middleware = () => (next) => (action) => {
  // success
  if (
    isAnyOf(
      initBudget.fulfilled,
      setIncomeThunk.fulfilled,
      setIncomeForPeriod.fulfilled,
      setPercentsThunk.fulfilled,
      addTxnThunk.fulfilled,
      updateTxnThunk.fulfilled,
      deleteTxnThunk.fulfilled,
    )(action)
  ) {
    const map: Record<string, string> = {
      [initBudget.fulfilled.type]: i18n.t('budget:toast.budget.init.success'),
      [setIncomeThunk.fulfilled.type]: i18n.t('budget:toast.budget.setIncome.success'),
      [setIncomeForPeriod.fulfilled.type]: i18n.t('budget:toast.budget.setIncome.success'),
      [setPercentsThunk.fulfilled.type]: i18n.t('budget:toast.budget.percents.success'),
      [addTxnThunk.fulfilled.type]: i18n.t('budget:toast.budget.txn.added'),
      [updateTxnThunk.fulfilled.type]: i18n.t('budget:toast.budget.txn.updated'),
      [deleteTxnThunk.fulfilled.type]: i18n.t('budget:toast.budget.txn.deleted'),
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
      addTxnThunk.rejected,
      updateTxnThunk.rejected,
      deleteTxnThunk.rejected,
      changeMonthThunk.rejected,
    )(action)
  ) {
    const map: Record<string, string> = {
      [initBudget.rejected.type]: i18n.t('budget:toast.budget.init.error'),
      [setIncomeThunk.rejected.type]: i18n.t('budget:toast.budget.setIncome.error'),
      [setIncomeForPeriod.rejected.type]: i18n.t('budget:toast.budget.setIncome.error'),
      [setPercentsThunk.rejected.type]: i18n.t('budget:toast.budget.percents.error'),
      [addTxnThunk.rejected.type]: i18n.t('budget:toast.budget.txn.addFailed'),
      [updateTxnThunk.rejected.type]: i18n.t('budget:toast.budget.txn.updateFailed'),
      [deleteTxnThunk.rejected.type]: i18n.t('budget:toast.budget.txn.deleteFailed'),
      [changeMonthThunk.rejected.type]: i18n.t('budget:toast.budget.changeMonth.error'),
    };
    const msg = map[action.type];
    if (msg) toast.error(msg);
  }

  return next(action);
};
