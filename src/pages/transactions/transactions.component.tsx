import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select, { SelectOption } from '../../components-ui/select/select.component';
import { Bucket, BucketType } from '../../api/types/bucket.types';
import {
  selectTxnsGroupedByDate,
  selectFilteredTotal,
  selectMonthTotalsByBucket,
} from '../../store/budget-store/budget.selectors';
import { AppDispatch } from '../../store/store';
import {
  setTxnSearch,
  setTxnSort,
  setTxnTypeFilter,
  SortKey,
  TxnTypeFilter,
} from '../../store/budget-store/budget.slice';
import FormInput from '../../components-ui/form-input/form-input.component';
import { resolveCategory } from '../../utils/category-options.util';
import { selectBudgetTotal } from '../../store/budget-store/budget.selectors.base';
import TransactionRow from '../../components/transaction-row/transaction-row.component';
import { fmt, toEMD } from '../../utils/format-data.util';

import './transactions.styles.scss';

const Transaction: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector(selectTxnsGroupedByDate);
  const totalSpent = useSelector(selectFilteredTotal);
  const totalIncome = useSelector(selectBudgetTotal);
  const perBucket = useSelector(selectMonthTotalsByBucket);

  const [filter, setFilter] = useState<Bucket | 'all'>('all');
  const [searchCriteria, setSearchCriteria] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<string>('date');

  const FILTER_OPTIONS: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Needs', value: BucketType.NEEDS },
    { label: 'Wants', value: BucketType.WANTS },
    { label: 'Savings', value: BucketType.SAVINGS },
  ];

  const SORT_OPTIONS: SelectOption[] = [
    { label: 'Sort by date', value: 'date' },
    { label: 'Sort by amount', value: 'amount' },
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

  return (
    <div className="transactions-page">
      <section className="txn-total-budget-section">
        <h2 className="card-header">Total budget</h2>
        <span className="total-value">{fmt(totalIncome)}</span>
      </section>
      <section className="txn-page-spent">
        <h2 className="card-header">Spent</h2>

        <div className="spent-container-row">
          <div className="spent-container">
            <span className="spent-label">Total</span>
            <span className="spent-value">{fmt(totalSpent)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">Needs</span>
            <span className="spent-value">{fmt(perBucket.needs)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">Wants</span>
            <span className="spent-value">{fmt(perBucket.wants)}</span>
          </div>
          <div className="spent-container">
            <span className="spent-label">Savings</span>
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
          placeholder="Search..."
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
            <h3>{toEMD(new Date(group.date))}</h3>
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
