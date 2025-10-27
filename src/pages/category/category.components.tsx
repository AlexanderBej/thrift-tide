import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { makeSelectCategoryView } from '../../store/budget-store/budget.selectors';
import Breadcrumbs from '../../components-ui/breadcrumb/breadcrumb.component';
import ProgressBar from '../../components-ui/progress-bar/progress-bar.component';
import { getCssVar } from '../../utils/style-variable.util';
import { Bucket } from '../../api/types/bucket.types';
import { resolveCategory } from '../../utils/category-options.util';
import TTIcon from '../../components-ui/icon/icon.component';
import { BadgePills } from '../../components/badge-pills/badge-pills.component';
import { makeSelectBucketBadges } from '../../store/budget-store/budget-badges.selectors';
import { selectDashboardInsights } from '../../store/budget-store/budget-insights.selectors';
import { fmt, toYMD } from '../../utils/format-data.util';
import { selectBudgetStatus } from '../../store/budget-store/budget.selectors.base';

import './category.styles.scss';

const Category: React.FC = () => {
  const { type } = useParams<{ type: string }>();

  const status = useSelector(selectBudgetStatus);
  const badges = useSelector(makeSelectBucketBadges(type as Bucket));
  const insights = useSelector(selectDashboardInsights);

  const selectView = useMemo(() => makeSelectCategoryView(type as Bucket), [type]);
  const view = useSelector(selectView);

  if (status === 'loading' || !view) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const title = type === 'needs' ? 'Needs' : type === 'wants' ? 'Wants' : 'Savings';

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

  return (
    <div className="category-page">
      <Breadcrumbs />
      <header className="category-page-header">
        <h2>{title}</h2>
      </header>
      <div
        className="category-summary-container"
        style={{ backgroundColor: getCssVar(`--${title.toLowerCase()}-light`) }}
      >
        <div className="category-summary-line">
          <div className="category-summary">
            Allocated: <strong>{fmt(view.allocated)}</strong>
          </div>
          <div className="category-summary category-middle">
            Spent: <strong>{fmt(view.spent)}</strong>
          </div>
          <div className="category-summary category-last">
            Remaining: <strong>{fmt(view.remaining)}</strong>
          </div>
        </div>

        <ProgressBar progress={view.progress} />
        <BadgePills badges={badges} />
      </div>

      {/* By-category breakdown */}
      <section className="higlights-section">
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
                    <strong>{fmt(row.total)}</strong>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="insights-container">
          <h2 className="category-header">Insights</h2>
          <span>Avg. daily spend</span>
          <h3>{fmt(insights.avgDaily)}</h3>
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
                  <div style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(t.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Category;
