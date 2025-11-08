import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';

import { Bucket, BucketType } from '@api/types';
import { TransactionRow } from '@components';
import { useFormatMoney } from '@shared/hooks';
import { FormInput, Select, SelectOption } from '@shared/ui';
import { LOCALE_MAP, makeFormatter, resolveCategory } from '@shared/utils';
import {
  selectTxnsGroupedByDate,
  selectFilteredTotal,
  selectBudgetTotal,
  selectMonthTotalsByBucket,
  setTxnTypeFilter,
  TxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  SortKey,
} from '@store/budget-store';
import { AppDispatch } from '@store/store';

import './transactions.styles.scss';

const Transaction: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'budget']);
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector(selectTxnsGroupedByDate);
  const totalSpent = useSelector(selectFilteredTotal);
  const totalIncome = useSelector(selectBudgetTotal);
  const perBucket = useSelector(selectMonthTotalsByBucket);

  const fmt = useFormatMoney();

  const [filter, setFilter] = useState<Bucket | 'all'>('all');
  const [searchCriteria, setSearchCriteria] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<string>('date');

  const FILTER_OPTIONS: SelectOption[] = [
    { label: t('budget:bucketNames.all') ?? 'All', value: 'all' },
    { label: t('budget:bucketNames.needs') ?? 'Needs', value: BucketType.NEEDS },
    { label: t('budget:bucketNames.wants') ?? 'Wants', value: BucketType.WANTS },
    { label: t('budget:bucketNames.savings') ?? 'Savings', value: BucketType.SAVINGS },
  ];

  const SORT_OPTIONS: SelectOption[] = [
    { label: t('budget:sortOptions.byDate') ?? 'Sort by date', value: 'date' },
    { label: t('budget:sortOptions.byAmount') ?? 'Sort by amount', value: 'amount' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'filter':
        setFilter(value as Bucket | 'all');
        dispatch(setTxnTypeFilter(value as TxnTypeFilter));
        break;
      case 'search':
        setSearchCriteria(value);
        dispatch(setTxnSearch(value));
        break;
      case 'sort':
        setSortCriteria(value);
        dispatch(setTxnSort({ key: value as SortKey, dir: 'desc' }));
        break;
      default:
        break;
    }
  };

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(false, locale);
    return fmt.format(d);
  };

  return (
    <div className="transactions-page">
      <section className="txn-total-budget-section">
        <h2 className="card-header">{t('budget:totalBudget') ?? 'Total Budget'}</h2>
        <span className="total-value">{fmt(totalIncome)}</span>
      </section>
      <section className="txn-page-spent">
        <h2 className="card-header">{t('budget:spent') ?? 'Spent'}</h2>

        <div className="spent-container-row">
          <div className="spent-container">
            <span className="spent-label">Total</span>
            <span className="spent-value">{fmt(totalSpent)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">{t('budget:bucketNames.needs') ?? 'Needs'}</span>
            <span className="spent-value">{fmt(perBucket.needs)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">{t('budget:bucketNames.wants') ?? 'Wants'}</span>
            <span className="spent-value">{fmt(perBucket.wants)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">{t('budget:bucketNames.savings') ?? 'Savings'}</span>
            <span className="spent-value">{fmt(perBucket.savings)}</span>
          </div>
        </div>
      </section>
      <section className="txn-filter-select-section">
        <Select
          customClassName="filter-selector"
          name="filter"
          value={filter}
          onChange={handleChange}
          options={FILTER_OPTIONS}
        />
      </section>
      <section className="txn-filter-search-section">
        <FormInput
          inputType="search"
          customClassName="search-input"
          name="search"
          value={searchCriteria}
          onChange={handleChange}
          prefix="search"
          placeholder={t('search.placeholder') ?? 'Search...'}
        />
      </section>
      <section className="txn-sort-section">
        <Select
          customClassName="sort-selector"
          name="sort"
          value={sortCriteria}
          onChange={handleChange}
          options={SORT_OPTIONS}
        />
      </section>

      <section className="txn-list-section">
        {groups.map((group) => (
          <div className="txn-group" key={group.date}>
            <h3 className="txn-group-date">{getTranslatedFmtDate(new Date(group.date))}</h3>
            <ul className="txn-group-list">
              {group.items.map((tx) => {
                const cat = resolveCategory(tx.category);

                return <TransactionRow key={tx.id} source="transaction" txn={tx} category={cat} />;
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Transaction;
