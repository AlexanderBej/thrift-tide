import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';
import { FaChevronDown } from 'react-icons/fa';

import { Category, CategoryType } from '@api/types';
import { ProgressBar } from '@components';
import { useFormatMoney } from '@shared/hooks';
import { Input, SelectOption, TTIcon } from '@shared/ui';
import { getCssVar, LOCALE_MAP, makeFormatter, resolveExpenseGroup } from '@shared/utils';
import {
  selectTxnsGroupedByDate,
  setTxnTypeFilter,
  TxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  SortKey,
  selectTotals,
} from '@store/budget-store';
import { AppDispatch } from '@store/store';
import { SortSheet } from '@widgets';
import { Txn } from '@api/models';
import { TransactionLine } from 'features';
import { selectSettingsAppTheme } from '@store/settings-store';

import './transactions.styles.scss';

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

  const groups = useSelector(selectTxnsGroupedByDate);
  const totals = useSelector(selectTotals);
  const theme = useSelector(selectSettingsAppTheme);

  const [open, setOpen] = useState<boolean>(false);

  // const fmt = useFormatMoney();

  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [searchCriteria, setSearchCriteria] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<SortKey>('date');

  const FILTER_OPTIONS: SelectOption[] = [
    { label: t('taxonomy:categoryNames.all') ?? 'All', value: 'all' },
    { label: t('taxonomy:categoryNames.needs') ?? 'Needs', value: CategoryType.NEEDS },
    { label: t('taxonomy:categoryNames.wants') ?? 'Wants', value: CategoryType.WANTS },
    { label: t('taxonomy:categoryNames.savings') ?? 'Savings', value: CategoryType.SAVINGS },
  ];

  const SORT_OPTIONS: SelectOption[] = [
    { label: t('budget:sheets.sortSheet.sortLabel.date') ?? 'Sort by date', value: 'date' },
    { label: t('budget:sheets.sortSheet.sortLabel.amount') ?? 'Sort by amount', value: 'amount' },
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
    setOpen(true);
  };

  const handleCriteriaChange = (open: boolean, sort: SortKey) => {
    setOpen(open);
    setSortCriteria(sort);
    dispatch(setTxnSort({ key: sort as SortKey, dir: 'desc' }));
  };

  const getGroupTotal = (txns: Txn[]) => {
    return txns.reduce((sum, txn) => sum + txn.amount, 0);
  };

  return (
    <div className="transactions-page">
      <section className={clsx(`txn-total-budget txn-total-budget__${theme}`)}>
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
        <ProgressBar progress={scoped.progress} color={getCssVar(scoped.cssVarName)} />
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

      <section className="tt-section txn-list-section">
        {groups.map((group) => (
          <div className="txn-group" key={group.date}>
            <div className="txn-date-row">
              <h3 className="txn-group-date">{getTranslatedFmtDate(new Date(group.date))}</h3>
              <span>{fmtCurrency(getGroupTotal(group.items))}</span>
            </div>
            <ul className={clsx(`txn-group-list txn-group-list__${theme}`)}>
              {group.items.map((tx) => {
                const ep = resolveExpenseGroup(tx.expenseGroup);

                return (
                  <div key={tx.id} className="txn-line-wrapper">
                    <TransactionLine txn={tx} expenseGroup={ep} />
                  </div>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <SortSheet open={open} onOpenChange={handleCriteriaChange} sortCriteria={sortCriteria} />
    </div>
  );
};

export default Transaction;
