import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEdit2, FiSearch, FiSliders, FiTrash2 } from 'react-icons/fi';
import clsx from 'clsx';

import { Category, CategoryType } from '@api/types';
import { useFormatMoney } from '@shared/hooks';
import { InfoBlock, Input, PageSpinner, TTIcon } from '@shared/ui';
import { LOCALE_MAP, makeFormatter } from '@shared/utils/format-data.util';
import { resolveExpenseGroup } from '@shared/utils/expense-group-options.util';
import {
  BudgetPeriodPhase,
  selectBudgetContextSemantics,
  selectBudgetLoadStatus,
  deleteTxnFromMonthThunk,
  setTxnGroupBy,
  setTxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  selectBudgetMonth,
  selectTxnListGroups,
  selectTxnUi,
  selectTxnsInPeriod,
  TxnGroupBy,
  TxnListGroup,
  TxnSortKey,
  TxnTypeFilter,
} from '@store/budget-store';
import type { AppDispatch } from '@store/store';
import { ConfirmSheet, SortSheet } from '@widgets';
import { Txn } from '@api/models';
import { ExpenseGroupIcon } from '@shared/components/expense-group/expense-group-icon';
import { TransactionLine } from 'features';
import { selectAuthUserId } from '@store/auth-store/auth.selectors';

import './transactions.styles.scss';

interface Option {
  value: string;
  label: string;
}

const Transaction: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'budget', 'taxonomy']);
  const fmtCurrency = useFormatMoney(true);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const groups = useSelector(selectTxnListGroups) as TxnListGroup[];
  const month = useSelector(selectBudgetMonth);
  const txnsInPeriod = useSelector(selectTxnsInPeriod);
  const context = useSelector(selectBudgetContextSemantics);
  const status = useSelector(selectBudgetLoadStatus);
  const txnUi = useSelector(selectTxnUi);
  const userId = useSelector(selectAuthUserId);

  const [organizeOpen, setOrganizeOpen] = useState<boolean>(false);
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [txnToDelete, setTxnToDelete] = useState<string | null>(null);

  const FILTER_OPTIONS: Option[] = [
    { label: t('taxonomy:categoryNames.all') ?? 'All', value: 'all' },
    { label: t('taxonomy:categoryNames.needs') ?? 'Needs', value: CategoryType.NEEDS },
    { label: t('taxonomy:categoryNames.wants') ?? 'Wants', value: CategoryType.WANTS },
    { label: t('taxonomy:categoryNames.savings') ?? 'Savings', value: CategoryType.SAVINGS },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    dispatch(setTxnSearch(value));
  };

  const handleFilterChange = (nextFilter: Category | 'all') => {
    dispatch(setTxnTypeFilter(nextFilter as TxnTypeFilter));
  };

  const getTranslatedFmtDate = (dateKey: string) => {
    const locale = LOCALE_MAP[i18n.language] ?? 'en-US';

    const fmt = makeFormatter(locale, false, 'long');
    return fmt.format(dateFromYmd(dateKey));
  };

  const visibleTxnCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups],
  );
  const periodSpent = useMemo(
    () => txnsInPeriod.reduce((sum, txn) => sum + txn.amount, 0),
    [txnsInPeriod],
  );
  const periodLabel = getPeriodLabel(context.periodPhase, t);
  const periodRange = formatPeriodRange(
    context.periodStart,
    context.periodLastDay,
    i18n.language,
  );
  const hasSearch = txnUi.search.trim().length > 0;
  const hasCategoryFilter = txnUi.type !== 'all';
  const hasActiveFindability = hasSearch || hasCategoryFilter;
  const emptyState = getEmptyState({
    periodPhase: context.periodPhase,
    hasAnyTransactions: txnsInPeriod.length > 0,
    hasSearch,
    hasCategoryFilter,
  });

  const organizeActive = txnUi.groupBy !== 'date' || txnUi.sortKey !== 'newest';

  useEffect(() => {
    setExpandedTxnId(null);
  }, [month]);

  useEffect(() => {
    if (!expandedTxnId) return;
    const visibleTxnIds = new Set(groups.flatMap((group) => group.items.map((txn) => txn.id)));
    if (!visibleTxnIds.has(expandedTxnId)) setExpandedTxnId(null);
  }, [expandedTxnId, groups]);

  const onOrganizeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // release focus BEFORE Radix hides the app root
    (e.currentTarget as HTMLButtonElement).blur();
    setOrganizeOpen(true);
  };

  const handleOrganizeChange = (open: boolean, groupBy: TxnGroupBy, sort: TxnSortKey) => {
    setOrganizeOpen(open);
    dispatch(setTxnGroupBy(groupBy));
    dispatch(setTxnSort(sort));
  };

  const clearFindability = () => {
    dispatch(setTxnSearch(''));
    dispatch(setTxnTypeFilter('all'));
  };

  const toggleTransaction = (tx: Txn) => {
    if (!tx.id) return;
    setExpandedTxnId((current) => (current === tx.id ? null : tx.id!));
  };

  const openEditRoute = (tx: Txn) => {
    if (tx.id)
      navigate(`/transactions/${month}/${tx.id}/edit`, { state: { from: location.pathname } });
  };

  const openConfirmDelete = (tx: Txn) => {
    if (!tx.id) return;
    setTxnToDelete(tx.id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userId || !txnToDelete) return;

    try {
      await dispatch(deleteTxnFromMonthThunk({ uid: userId, month, id: txnToDelete })).unwrap();
      setConfirmOpen(false);
      setTxnToDelete(null);
      setExpandedTxnId(null);
    } catch {
      // Existing toast/error state handles feedback; keep the row and confirmation available.
    }
  };

  const handleConfirmOpenChange = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setTxnToDelete(null);
  };

  if (status === 'loading') return <PageSpinner />;

  if (status === 'error') {
    return (
      <div className="transactions-page transactions-page--center">
        <InfoBlock className="transactions-empty">
          <strong>{t('budget:transactions.errorTitle')}</strong>
          <span>{t('common:errors.generic')}</span>
        </InfoBlock>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <header className="transactions-ledger-header">
        <div>
          <h1>{fmtCurrency(periodSpent)}</h1>
          <p>
            {t('budget:transactions.ledgerMeta', {
              count: txnsInPeriod.length,
            })}
          </p>
        </div>
        <span className={clsx('transactions-period-chip', `transactions-period-chip--${context.periodPhase}`)}>
          {periodLabel}
        </span>
        <span className="transactions-period-range">{periodRange}</span>
      </header>

      <section className="transactions-tools" aria-label={String(t('budget:transactions.toolsLabel'))}>
        <div className="filters-row">
          {FILTER_OPTIONS.map((filt) => (
            <button
              type="button"
              onClick={() => handleFilterChange(filt.value as Category | 'all')}
              key={filt.value}
              className={clsx('filter', {
                selected: txnUi.type === filt.value,
              })}
              aria-pressed={txnUi.type === filt.value}
            >
              <span>{filt.label}</span>
            </button>
          ))}
        </div>
        <div className="search-row">
          <Input
            type="search"
            className="search-input"
            name="search"
            value={txnUi.search}
            onChange={handleSearch}
            placeholder={t('common:search.placeholder') ?? 'Search...'}
            prefixIcon={FiSearch}
          />

          <button
            type="button"
            onClick={onOrganizeClick}
            className={clsx('organize-btn', organizeActive && 'organize-btn--active')}
            aria-label={String(t('budget:transactions.organize.title'))}
            aria-pressed={organizeActive}
          >
            <TTIcon icon={FiSliders} color="currentColor" size={18} />
          </button>
        </div>
        {hasActiveFindability && (
          <div className="transactions-result-row">
            <span>
              {t('budget:transactions.visibleMeta', {
                count: visibleTxnCount,
                total: txnsInPeriod.length,
              })}
            </span>
            <button type="button" onClick={clearFindability}>
              {t('budget:transactions.clearFilters')}
            </button>
          </div>
        )}
      </section>

      {groups.length === 0 && (
        <InfoBlock className="transactions-empty">
          <strong>{t(emptyState.titleKey)}</strong>
          <span>{t(emptyState.messageKey)}</span>
        </InfoBlock>
      )}

      <section className="txn-list-section" aria-label={String(t('budget:transactions.listLabel'))}>
        {groups.map((group) => (
          <div className="txn-group" key={group.key}>
            <div className={clsx('txn-date-row', group.kind === 'expenseGroup' && 'txn-date-row--expense-group')}>
              <h3 className="txn-group-date">
                {group.kind === 'expenseGroup' && group.label && (
                  <ExpenseGroupIcon expenseGroup={resolveExpenseGroup(group.label)} />
                )}
                <span>{getGroupTitle(group, getTranslatedFmtDate, t)}</span>
              </h3>
              <span>{fmtCurrency(group.total)}</span>
            </div>
            <ul className="txn-group-list">
              {group.items.map((tx) => {
                const ep = resolveExpenseGroup(tx.expenseGroup);
                const descriptor = getTransactionDescriptor(tx, String(t(ep.i18nLabel)));
                const isExpanded = tx.id === expandedTxnId;

                return (
                  <li
                    key={tx.id}
                    className={clsx('txn-line-wrapper', isExpanded && 'txn-line-wrapper--active')}
                  >
                    <button
                      type="button"
                      className="txn-row-button"
                      onClick={() => toggleTransaction(tx)}
                      aria-expanded={isExpanded}
                      aria-controls={tx.id ? `txn-actions-${tx.id}` : undefined}
                      aria-label={String(t('budget:transactions.rowToggleLabel', {
                        descriptor,
                        amount: fmtCurrency(tx.amount),
                      }))}
                    >
                      <TransactionLine
                        txn={tx}
                        expenseGroup={ep}
                        variant={group.kind === 'expenseGroup' ? 'expenseGroup' : 'date'}
                      />
                    </button>
                    <div
                      id={tx.id ? `txn-actions-${tx.id}` : undefined}
                      className="txn-action-tray"
                      aria-hidden={!isExpanded}
                    >
                      <button
                        type="button"
                        className="txn-action txn-action--edit"
                        onClick={() => openEditRoute(tx)}
                        tabIndex={isExpanded ? 0 : -1}
                        aria-label={String(t('budget:transactions.editActionLabel', { descriptor }))}
                      >
                        <TTIcon icon={FiEdit2} color="currentColor" size={16} />
                        <span>{t('budget:transactions.editAction')}</span>
                      </button>
                      <button
                        type="button"
                        className="txn-action txn-action--delete"
                        onClick={() => openConfirmDelete(tx)}
                        tabIndex={isExpanded ? 0 : -1}
                        aria-label={String(t('budget:transactions.deleteActionLabel', { descriptor }))}
                      >
                        <TTIcon icon={FiTrash2} color="currentColor" size={16} />
                        <span>{t('budget:transactions.deleteAction')}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <SortSheet
        open={organizeOpen}
        onOpenChange={handleOrganizeChange}
        groupBy={txnUi.groupBy}
        sortKey={txnUi.sortKey}
      />
      <ConfirmSheet
        open={confirmOpen}
        onOpenChange={handleConfirmOpenChange}
        title={t('budget:capture.delete.title')}
        description={t('budget:capture.delete.text')}
        confirmLabel={t('budget:capture.delete.confirm')}
        cancelLabel={t('common:actions.cancel')}
        tone="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

function getPeriodLabel(phase: BudgetPeriodPhase, t: TFunction) {
  return t(`budget:transactions.period.${phase}`);
}

function getEmptyState({
  periodPhase,
  hasAnyTransactions,
  hasSearch,
  hasCategoryFilter,
}: {
  periodPhase: BudgetPeriodPhase;
  hasAnyTransactions: boolean;
  hasSearch: boolean;
  hasCategoryFilter: boolean;
}) {
  if (hasSearch || hasCategoryFilter) {
    return {
      titleKey: 'budget:transactions.empty.filteredTitle',
      messageKey: 'budget:transactions.empty.filteredMessage',
    };
  }
  if (periodPhase === 'future') {
    return {
      titleKey: 'budget:transactions.empty.futureTitle',
      messageKey: 'budget:transactions.empty.futureMessage',
    };
  }
  if (periodPhase === 'past' && !hasAnyTransactions) {
    return {
      titleKey: 'budget:transactions.empty.pastTitle',
      messageKey: 'budget:transactions.empty.pastMessage',
    };
  }
  return {
    titleKey: 'budget:transactions.empty.defaultTitle',
    messageKey: 'budget:transactions.empty.defaultMessage',
  };
}

function dateFromYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatPeriodRange(start: Date, end: Date, language: string) {
  const locale = LOCALE_MAP[language] ?? 'en-US';
  const sameYear = start.getFullYear() === end.getFullYear();
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const dayMonthYear = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return sameYear
    ? `${dayMonth.format(start)} - ${dayMonthYear.format(end)}`
    : `${dayMonthYear.format(start)} - ${dayMonthYear.format(end)}`;
}

function getGroupTitle(
  group: TxnListGroup,
  formatDate: (dateKey: string) => string,
  t: TFunction,
) {
  if (group.kind === 'date') return formatDate(group.label);
  if (!group.label) return t('budget:uncategorized');

  const expenseGroup = resolveExpenseGroup(group.label);
  return t(expenseGroup.i18nLabel);
}

function getTransactionDescriptor(txn: Txn, expenseGroupLabel: string) {
  return txn.note?.trim() || expenseGroupLabel;
}

export default Transaction;
