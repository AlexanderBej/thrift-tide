import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

import Select, { SelectOption } from '../../components/select/select.component';
import { Bucket, BUCKET_LIGHT_COLORS, BucketType } from '../../api/types/bucket.types';
import {
  selectTxnsGroupedByDate,
  selectFilteredTotal,
  selectMonthTotalsByBucket,
  selectBudgetTotal,
  selectBudgetMonth,
} from '../../store/budget-store/budget.selectors';
import MonthPicker from '../../components/datepicker/monthpicker.component';
import { AppDispatch } from '../../store/store';
import {
  setMonth,
  setTxnSearch,
  setTxnSort,
  setTxnTypeFilter,
  SortKey,
  TxnTypeFilter,
} from '../../store/budget-store/budget.slice';
import FormInput from '../../components/form-input/form-input.component';
import { resolveCategory } from '../../utils/category-options.util';
import TTIcon from '../../components/icon/icon.component';

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

  const toCamelCase = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  return (
    <div className="transactions-page">
      <header className="txn-page-header">
        <div className="txn-header-totals">
          <div className="txn-header-budget">
            <span className="total-label">Total Budget</span>
            <span className="total-value">€{totalIncome}</span>
          </div>
          <div className="txn-header-budget">
            <span className="total-label">Total spent</span>
            <span className="total-value">€{totalSpent}</span>
          </div>
        </div>
        <div className="filter-criterias-line">
          <Select
            customClassName="filter-selector"
            name="filter"
            value={filter}
            onChange={handleChange}
            options={FILTER_OPTIONS}
          />
          <FormInput
            inputType="search"
            customClassName="search-input"
            name="search"
            value={searchCriteria}
            onChange={handleChange}
            prefix="search"
            placeholder="Search..."
          />
          <Select
            customClassName="sort-selector"
            name="sort"
            value={sortCriteria}
            onChange={handleChange}
            options={SORT_OPTIONS}
          />
        </div>
      </header>
      <section className="transaction-groups">
        {groups.map((group) => (
          <div className="txn-group" key={group.date}>
            <h3>{group.date}</h3>
            <ul className="txn-group-list">
              {group.items.map((tx) => {
                const cat = resolveCategory(tx.category);

                return (
                  <li key={tx.id} className="txn-line">
                    <div className="txn-cat-row">
                      <div className="cat-icon-wrapper">
                        <TTIcon icon={cat.icon} size={18} />
                      </div>
                      <span>
                        <strong>{cat.label}</strong>
                      </span>
                      <span
                        style={{ background: BUCKET_LIGHT_COLORS[tx.type] }}
                        className="cat-type-badge"
                      >
                        {toCamelCase(tx.type)}
                      </span>
                    </div>
                    <span className="note">{tx.note}</span>
                    <div className="amount">-€{tx.amount.toFixed(2)}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <footer className="per-type">
        <span>Needs: €{perBucket.needs.toFixed(2)}</span>
        <span>Wants: €{perBucket.wants.toFixed(2)}</span>
        <span>Savings: €{perBucket.savings.toFixed(2)}</span>
      </footer>
    </div>
  );
};

export default Transaction;
