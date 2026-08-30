import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';
import clsx from 'clsx';

import { Category, CATEGORY_ICONS, getCategoryColorVar } from '@api/types';
import { useFormatMoney } from '@shared/hooks';
import { PageSpinner, TTIcon } from '@shared/ui';
import {
  makeSelectExpenseGroupView,
  selectBudgetContextSemantics,
  selectBudgetDoc,
  selectBudgetLoadStatus,
  setTxnSearch,
  setTxnTypeFilter,
} from '@store/budget-store';
import type { AppDispatch } from '@store/store';
import { ExpenseGroupIcon } from '@shared/components';

import {
  buildCategoryDetailGroups,
  buildCategoryDetailSummary,
  CategoryDetailSummary,
  isCategoryDetailCategory,
} from './category-detail.util';

import './category.styles.scss';

const CategoryPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  if (!isCategoryDetailCategory(type)) {
    return <Navigate to="/categories" replace />;
  }

  return <CategoryDetail category={type} />;
};

interface CategoryDetailProps {
  category: Category;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category }) => {
  const { t } = useTranslation(['budget', 'taxonomy']);
  const fmtMoney = useFormatMoney(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const status = useSelector(selectBudgetLoadStatus);
  const doc = useSelector(selectBudgetDoc);
  const context = useSelector(selectBudgetContextSemantics);
  const selectView = useMemo(() => makeSelectExpenseGroupView(category), [category]);
  const view = useSelector(selectView);

  if (status === 'loading' || !view) {
    return <PageSpinner />;
  }

  const categoryName = t(`taxonomy:categoryNames.${category}`);
  const Icon = CATEGORY_ICONS[category];
  const pulseRow = context.pulseRows.find((row) => row.key === category);
  const summary = buildCategoryDetailSummary({
    category,
    percents: doc?.percents,
    card: {
      key: category,
      title: categoryName,
      allocated: view.allocated,
      spent: view.spent,
      remaining: view.remaining,
      progress: view.progress,
    },
    pulseRow,
    periodPhase: context.periodPhase,
  });
  const groups = buildCategoryDetailGroups({
    category,
    byExpGroup: view.byExpGroup,
    categoryActual: summary.actual,
  });

  const onTransactionsClick = () => {
    dispatch(setTxnTypeFilter(category));
    dispatch(setTxnSearch(''));
    navigate('/transactions');
  };

  return (
    <div className="category-page category-page--v3">
      <header className="category-detail-header">
        <div className="category-detail-identity">
          <div className="category-detail-icon" style={{ background: getCategoryColorVar(category) }} aria-hidden>
            <TTIcon icon={Icon} color="var(--color-text-inverse)" size={28} />
          </div>
          <div>
            <h1>{categoryName}</h1>
            <p>{t('budget:categoryDetail.budgetShare', { percent: summary.percent })}</p>
          </div>
        </div>

        {summary.isNoBudget ? (
          <p className="category-detail-no-budget">{t('budget:categoryDetail.noBudget')}</p>
        ) : (
          <div className="category-detail-financial">
            <strong>{fmtMoney(summary.actual)}</strong>
            <span>{t(getPrimaryLabelKey(category))}</span>
            <p
              className={clsx(
                summary.progressTone === 'danger' && 'is-danger',
                summary.progressTone === 'success' && 'is-success',
              )}
            >
              {getSecondaryCopy(summary, fmtMoney, t)}
            </p>
          </div>
        )}

        {!summary.isNoBudget && (
          <div
            className="category-detail-progress"
            role="progressbar"
            aria-label={String(
              t('budget:categoryDetail.progressAria', {
                category: categoryName,
                percent: Math.round(summary.progress * 100),
              }),
            )}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(summary.progress * 100)}
          >
            <span
              className={clsx(
                'category-detail-progress__fill',
                `category-detail-progress__fill--${summary.progressTone}`,
              )}
              style={{
                width: `${summary.progress * 100}%`,
                background: summary.progressTone === 'category' ? getCategoryColorVar(category) : undefined,
              }}
            />
          </div>
        )}
      </header>

      <section className="category-groups-section" aria-labelledby="category-groups-title">
        <h2 id="category-groups-title">{t('budget:categoryDetail.expenseGroups')}</h2>
        <ul className="category-groups-list">
          {groups.map((row) => (
            <li
              key={row.group.value}
              className={clsx('category-group-row', !row.active && 'category-group-row--inactive')}
            >
              <div className="category-group-row__main">
                <ExpenseGroupIcon expenseGroup={row.group} />
                <div className="category-group-row__copy">
                  <span>{t(row.group.i18nLabel)}</span>
                  {row.compositionPercent != null && (
                    <em>
                      {t(getCompositionLabelKey(category), {
                        percent: row.compositionPercent,
                      })}
                    </em>
                  )}
                </div>
                <strong>{fmtMoney(row.total)}</strong>
              </div>
              {row.compositionPercent != null && (
                <div className="category-group-row__bar" aria-hidden>
                  <span
                    style={{
                      width: `${row.compositionPercent}%`,
                      background: row.group.color,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="category-transactions-handoff">
        <div>
          <h2>{t('budget:categoryDetail.transactionsTitle', { category: categoryName })}</h2>
          <p>{t('budget:categoryDetail.transactionsHelper')}</p>
        </div>
        <button type="button" onClick={onTransactionsClick}>
          <span>{t('budget:categoryDetail.viewTransactions', { category: categoryName })}</span>
          <TTIcon icon={FaChevronRight} size={14} color="currentColor" />
        </button>
      </section>
    </div>
  );
};

function getPrimaryLabelKey(category: Category) {
  return category === 'savings' ? 'budget:categoryDetail.contributed' : 'budget:categoryDetail.spent';
}

function getCompositionLabelKey(category: Category) {
  return `budget:categoryDetail.groupComposition.${category}`;
}

function getSecondaryCopy(
  summary: CategoryDetailSummary,
  fmtMoney: (value: number) => string,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (summary.category === 'savings') {
    if (summary.statusKind === 'goalReached') return t('budget:categoryDetail.goalReached');
    if (summary.statusKind === 'aboveGoal') {
      return t('budget:categoryDetail.aboveGoal', { amount: fmtMoney(summary.amount) });
    }
    return t('budget:categoryDetail.toGoalOf', {
      amount: fmtMoney(summary.amount),
      total: fmtMoney(summary.allocated),
    });
  }

  if (summary.statusKind === 'over') {
    return t('budget:categoryDetail.overBudget', { amount: fmtMoney(summary.amount) });
  }

  return t(
    summary.statusKind === 'unused'
      ? 'budget:categoryDetail.unusedOf'
      : 'budget:categoryDetail.leftOf',
    {
      amount: fmtMoney(summary.amount),
      total: fmtMoney(summary.allocated),
    },
  );
}

export default CategoryPage;
