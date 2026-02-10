import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';
import { FaChevronDown } from 'react-icons/fa';

import { Category, CategoryType } from '@api/types';
import { ProgressBar } from '@shared/components';
import { useFormatMoney } from '@shared/hooks';
import { InfoBlock, Input, TTIcon } from '@shared/ui';
import { getCssVar, LOCALE_MAP, makeFormatter, resolveExpenseGroup } from '@shared/utils';
import {
  selectTxnListGroups,
  setTxnTypeFilter,
  TxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  SortKey,
  selectTotals,
  deleteTxnThunk,
} from '@store/budget-store';
import { AppDispatch } from '@store/store';
import { AddActionSheet, ConfirmSheet, SortSheet } from '@widgets';
import { Txn } from '@api/models';
import { SwipeRow, SwipeRowHandle, TransactionLine } from 'features';
import { selectSettingsAppTheme } from '@store/settings-store';
import { selectAuthUser } from '@store/auth-store';

import './transactions.styles.scss';

interface Option {
  value: string;
  label: string;
}

function getScopedTotals(totals: any, filter: Category | 'all') {
  const isCategory = filter !== 'all';

  const allocated = isCategory ? totals.alloc[filter] : totals.totalAllocated;
  const spent = isCategory ? totals.spent[filter] : totals.totalSpent;
  const remaining = isCategory ? totals.remaining[filter] : totals.totalRemaining;

  const budgetLabelValue = (() => {
    if (!isCategory) return totals.totalIncome;
    if (totals.income) return totals.income[filter];
    return allocated; // fallback: treat allocated as the relevant "budget"
  })();

  const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

  const cssVarName =
    filter === 'needs'
      ? '--needs'
      : filter === 'wants'
        ? '--wants'
        : filter === 'savings'
          ? '--savings'
          : '--color-primary';

  return {
    remaining,
    allocated,
    spent,
    budgetLabelValue,
    progress,
    cssVarName,
  };
}

const Transaction: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'budget']);
  const fmtCurrency = useFormatMoney();
  const dispatch = useDispatch<AppDispatch>();

  const rowRefs = useRef<Record<string, SwipeRowHandle | null>>({});

  const groups = useSelector(selectTxnListGroups);
  const totals = useSelector(selectTotals);
  const theme = useSelector(selectSettingsAppTheme);
  const user = useSelector(selectAuthUser);

  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [searchCriteria, setSearchCriteria] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<SortKey>('date');

  const [txnToDelete, setTxnToDelete] = useState<string | null>(null);
  const [txnToEdit, setTxnToEdit] = useState<Txn | null>(null);

  const FILTER_OPTIONS: Option[] = [
    { label: t('taxonomy:categoryNames.all') ?? 'All', value: 'all' },
    { label: t('taxonomy:categoryNames.needs') ?? 'Needs', value: CategoryType.NEEDS },
    { label: t('taxonomy:categoryNames.wants') ?? 'Wants', value: CategoryType.WANTS },
    { label: t('taxonomy:categoryNames.savings') ?? 'Savings', value: CategoryType.SAVINGS },
  ];

  const SORT_OPTIONS: Option[] = [
    { label: t('budget:sheets.sortSheet.sortLabel.date') ?? 'Sort by date', value: 'date' },
    { label: t('budget:sheets.sortSheet.sortLabel.amount') ?? 'Sort by amount', value: 'amount' },
    {
      label: t('budget:sheets.sortSheet.sortLabel.expenseGroup'),
      value: 'expenseGroup',
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchCriteria(value);
    dispatch(setTxnSearch(value));
  };

  const handleFilterChange = (filter: Category | 'all') => {
    setFilter(filter as Category | 'all');
    dispatch(setTxnTypeFilter(filter as TxnTypeFilter));
  };

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(locale, false, 'long');
    return fmt.format(d);
  };

  const scoped = useMemo(
    () => getScopedTotals(totals, (filter ?? 'all') as Category | 'all'),
    [totals, filter],
  );

  const onSortClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // release focus BEFORE Radix hides the app root
    (e.currentTarget as HTMLButtonElement).blur();
    setSortOpen(true);
  };

  const handleCriteriaChange = (open: boolean, sort: SortKey) => {
    setSortOpen(open);
    setSortCriteria(sort);
    dispatch(setTxnSort({ key: sort as SortKey, dir: 'desc' }));
  };

  const closeOtherRows = (activeTxnId: string) => {
    Object.entries(rowRefs.current).forEach(([txnId, rowRef]) => {
      if (txnId === activeTxnId) return;
      rowRef?.close();
    });
  };

  const openEditSheet = (tx: Txn) => {
    setTxnToEdit(tx);
    setEditOpen(true);
    if (tx.id) rowRefs.current[tx.id]?.close();
  };

  const openConfirmDelete = (tx: Txn) => {
    if (tx.id) setTxnToDelete(tx.id);
    setConfirmOpen(true);
    if (tx.id) rowRefs.current[tx.id]?.close();
  };

  const handleDeleteTransaction = () => {
    if (!user?.uuid || !txnToDelete) return;
    dispatch(deleteTxnThunk({ uid: user?.uuid, id: txnToDelete }))
      .unwrap()
      .then(() => {
        setConfirmOpen(false);
        setTxnToDelete(null);
      });
  };

  return (
    <div className="transactions-page">
      <section className={clsx(`txn-total-budget txn-total-budget__${theme}`)}>
        {scoped.allocated === 0 ? (
          <InfoBlock>
            <span>{t('budget:noBudget')}</span>
          </InfoBlock>
        ) : (
          <>
            <h3 className="spent-header">{t('budget:spent') ?? 'Spent'}</h3>
            <h2 className="spent-value">{fmtCurrency(scoped.spent)}</h2>
            <div className="txn-budget-row">
              <span>
                {t('budget:budget') ?? 'Budget'}: {scoped.allocated}
              </span>
              <span>
                {t('budget:remaining') ?? 'Remaining'}: {scoped.remaining}
              </span>
            </div>
          </>
        )}
        <div className="txn-progress-bar-wrapper">
          <ProgressBar progress={scoped.progress} color={getCssVar(scoped.cssVarName)} />
        </div>
      </section>

      <section className="tt-section">
        <div className="filters-row">
          {FILTER_OPTIONS.map((filt, index) => (
            <button
              onClick={() => handleFilterChange(filt.value as Category | 'all')}
              key={index}
              className={clsx('filter', {
                selected: filter === filt.value,
                selected__light: filter === filt.value && theme === 'light',
                selected__dark: filter === filt.value && theme === 'dark',
              })}
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
            value={searchCriteria}
            onChange={handleSearch}
            placeholder={t('search.placeholder') ?? 'Search...'}
          />

          <button onClick={onSortClick} className={`sort-btn sort-btn__${theme}`}>
            <span>{SORT_OPTIONS.find((opt) => opt.value === sortCriteria)?.label}</span>
            <TTIcon icon={FaChevronDown} color={getCssVar('--color-primary')} size={12} />
          </button>
        </div>
      </section>

      {groups.length === 0 && (
        <InfoBlock className="no-txns-block">
          <span>{t('budget:noTransactions')}</span>
        </InfoBlock>
      )}

      <section className="tt-section txn-list-section">
        {groups.map((group) => (
          <div className="txn-group" key={group.key}>
            <div className="txn-date-row">
              <h3 className="txn-group-date">
                {group.kind === 'date'
                  ? getTranslatedFmtDate(new Date(group.label))
                  : group.label || (t('budget:uncategorized') ?? 'Uncategorized')}
              </h3>
              <span>{fmtCurrency(group.total)}</span>
            </div>
            <ul className={clsx(`txn-group-list txn-group-list__${theme}`)}>
              {group.items.map((tx) => {
                const ep = resolveExpenseGroup(tx.expenseGroup);

                return (
                  <div key={tx.id} className="txn-line-wrapper">
                    <SwipeRow
                      ref={(instance) => {
                        if (!tx.id) return;
                        rowRefs.current[tx.id] = instance;
                      }}
                      key={tx.id}
                      onEdit={() => openEditSheet(tx)}
                      onDelete={() => openConfirmDelete(tx)}
                      onSwipeStart={() => {
                        if (tx.id) closeOtherRows(tx.id);
                      }}
                    >
                      <TransactionLine txn={tx} expenseGroup={ep} />
                    </SwipeRow>
                  </div>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <SortSheet open={sortOpen} onOpenChange={handleCriteriaChange} sortCriteria={sortCriteria} />
      <ConfirmSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        btnLabel={t('budget:sheets.confirmSheet.delTxn.button')}
        title={t('budget:sheets.confirmSheet.delTxn.title')}
        text={t('budget:sheets.confirmSheet.delTxn.text')}
        onConfirm={handleDeleteTransaction}
      />
      <AddActionSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultStep="expense"
        txnToEdit={txnToEdit as Txn}
      />
    </div>
  );
};

export default Transaction;
