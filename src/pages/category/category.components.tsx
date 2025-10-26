import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';

import './category.styles.scss';
import {
  makeSelectCategoryView,
  selectBudgetMonth,
  selectBudgetStatus,
} from '../../store/budget-store/budget.selectors';
import { Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addTxnThunk } from '../../store/budget-store/budget.slice';
import { selectAuthUserId } from '../../store/auth-store/auth.selectors';
import Breadcrumbs from '../../components/breadcrumb/breadcrumb.component';
import DatePicker from '../../components/datepicker/datepicker.component';
import ProgressBar from '../../components/progress-bar/progress-bar.component';
import { getCssVar } from '../../utils/style-variable.util';
import { Bucket } from '../../api/types/bucket.types';
import { resolveCategory } from '../../utils/category-options.util';
import TTIcon from '../../components/icon/icon.component';
import { IconType } from 'react-icons';
import { FaPlus } from 'react-icons/fa';
import Button from '../../components/button/button.component';
import MonthPicker from '../../components/datepicker/monthpicker.component';

const fmt = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

const isBucket = (v: string | undefined): v is Bucket =>
  v === 'needs' || v === 'wants' || v === 'savings';

const Category: React.FC = () => {
  const { type } = useParams<{ type: string }>();

  const dispatch = useDispatch<AppDispatch>();
  // const month = useSelector(selectBudgetMonth);
  const status = useSelector(selectBudgetStatus);
  const userUId = useSelector(selectAuthUserId);

  // const [pickedMonth, setPickedMonth] = useState<Date>(new Date(month));

  // Build a memoized selector instance for this bucket
  const selectView = useMemo(() => makeSelectCategoryView(type as Bucket), [type]);
  const view = useSelector(selectView);

  if (status === 'loading' || !view) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const title = type === 'needs' ? 'Needs' : type === 'wants' ? 'Wants' : 'Savings';

  const onQuickAdd = async () => {
    if (!userUId) return;
    const today = new Date().toISOString().slice(0, 10);
    const txnType = type as Bucket;
    await dispatch(
      addTxnThunk({
        uid: userUId,
        txn: { date: today, amount: 12.34, type: txnType, category: 'Misc' },
      }),
    );
  };

  const getFormattedDate = (date: any) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (toYMD(dateObj) === toYMD(today)) return 'Today';
    if (toYMD(dateObj) === toYMD(yesterday)) return 'Yesterday';

    const formattedDate = format(new Date(date), 'EE, MMMM do');
    return formattedDate;
  };

  console.log('isBucket', isBucket(type));
  console.log('title', title, 'type', type, 'view', view);
  console.log('color', getCssVar(`--${title.toLowerCase()}-light`));

  //   if (!isBucket(type)) {
  //     return <Navigate to="/" replace />;
  //   }

  // const handleDateChange = (d: Date | null) => {
  //   if (!d) return;
  //   setPickedMonth(d);
  // };

  return (
    <div className="category-page">
      <Breadcrumbs />
      <header className="category-page-header">
        <h2>{title}</h2>
        {/* <MonthPicker
          value={pickedMonth}
          className="cat-page-monthpicker"
          onChange={handleDateChange}
        /> */}
      </header>
      <div
        className="category-summary-container"
        style={{ backgroundColor: getCssVar(`--${title.toLowerCase()}-light`) }}
      >
        <div className="category-summary-line">
          <div className="category-summary">
            Allocated: <strong>€{fmt(view.allocated)}</strong>
          </div>
          <div className="category-summary">
            Spent: <strong>€{fmt(view.spent)}</strong>
          </div>
          <div className="category-summary">
            Remaining: <strong>€{fmt(view.remaining)}</strong>
          </div>
        </div>

        <ProgressBar progress={view.progress} />
        <div>TODO: Under budget badge</div>
      </div>

      {/* By-category breakdown */}
      <section className="higlights-section" style={{ marginBottom: 24 }}>
        <div className="top-categories-container">
          <h2 className="category-header">Top categories</h2>
          {view.byCategory.length === 0 ? (
            <div className="missing-items">No transactions yet.</div>
          ) : (
            <ul className="top-categories-list">
              {view.byCategory.map((row) => {
                const cat = resolveCategory(row.category);
                return (
                  <li key={row.category} className="categories-item">
                    <div className="cat-name">
                      <TTIcon icon={cat.icon} size={18} />
                      <span>{cat.label}</span>
                    </div>
                    <strong>€{fmt(row.total)}</strong>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="insights-container">
          <h2 className="category-header">Insights</h2>
          <span>Avg. daily spend</span>
          <h3>€61</h3>
        </div>
      </section>

      {/* Transactions list */}
      <section className="transactions-section">
        <h2 className="category-header">Transactions</h2>
        {view.items.length === 0 ? (
          <div className="missing-items">No transactions for {title.toLowerCase()}.</div>
        ) : (
          <div>
            {view.items.map((t) => {
              const cat = resolveCategory(t.category);

              return (
                <div
                  key={`${t.date}-${t.category}-${t.amount}-${Math.random()}`}
                  className="transaction-line"
                >
                  <div>{getFormattedDate(t.date)}</div>
                  <div className="transaction-category">
                    <TTIcon icon={cat.icon} size={18} />
                    <span>{cat.label}</span>
                  </div>
                  <div style={{ opacity: 0.7 }}>{t.note ?? ''}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600 }}>€{fmt(t.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick add (optional) */}
      <section className="action-btns">
        <Button
          customContainerClass="quick-txn-btn"
          buttonType="primary"
          htmlType="button"
          onClick={onQuickAdd}
        >
          <>
            <TTIcon className="quick-txn-icon" icon={FaPlus} size={18} />
            <span>Quick add to {title}</span>
          </>
        </Button>
      </section>
    </div>
  );
};

export default Category;
