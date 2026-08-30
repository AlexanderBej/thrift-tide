import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';
import clsx from 'clsx';

import { Category, CATEGORY_ICONS, getCategoryColorVar } from '@api/types';
import { ExpenseGroupIcon } from '@shared/components';
import { useFormatMoney } from '@shared/hooks';
import { TTIcon } from '@shared/ui';
import { selectBudgetContextSemantics, selectBudgetDoc, selectCards } from '@store/budget-store';

import {
  CategoryOverviewItem,
  getAllocationSegments,
  getCategoryOverviewItems,
} from './categories-overview.util';

import './categories.styles.scss';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation(['budget', 'taxonomy']);
  const fmtMoney = useFormatMoney(true);

  const doc = useSelector(selectBudgetDoc);
  const cards = useSelector(selectCards);
  const context = useSelector(selectBudgetContextSemantics);

  const allocationSegments = useMemo(() => getAllocationSegments(doc?.percents), [doc?.percents]);
  const categoryItems = useMemo(
    () =>
      getCategoryOverviewItems({
        cards,
        pulseRows: context.pulseRows,
        percents: doc?.percents,
        phase: context.periodPhase,
      }),
    [cards, context.periodPhase, context.pulseRows, doc?.percents],
  );
  const plannedAmount = doc?.income ?? 0;
  const hasBudget = plannedAmount > 0;

  return (
    <div className="categories-page categories-page--v3">
      <section className="categories-budget-map" aria-labelledby="categories-budget-title">
        <div className="categories-budget-container">
          <p className="categories-kicker">{t('budget:categoriesOverview.eyebrow')}</p>
          <div className="categories-budget-total">
            {hasBudget ? (
              <>
                <h1 id="categories-budget-title">{fmtMoney(plannedAmount)}</h1>
                <span>{t('budget:categoriesOverview.planned')}</span>
              </>
            ) : (
              <>
                <h1 id="categories-budget-title">{t('budget:categoriesOverview.notSet')}</h1>
                <span>{t('budget:categoriesOverview.planned')}</span>
              </>
            )}
          </div>
        </div>

        <ul
          className="categories-allocation-list"
          aria-label={String(t('budget:categoriesOverview.allocationLabel'))}
        >
          {allocationSegments.map((segment) => (
            <li key={segment.key}>
              <span
                className="categories-allocation-dot"
                style={{ background: getCategoryColorVar(segment.key) }}
                aria-hidden
              />
              <span>{t(`taxonomy:categoryNames.${segment.key}`)}</span>
              <strong>{segment.percent}%</strong>
            </li>
          ))}
        </ul>

        <div
          className="categories-allocation-strip"
          role="img"
          aria-label={String(
            t('budget:categoriesOverview.stripAria', {
              needs: allocationSegments[0]?.percent ?? 0,
              wants: allocationSegments[1]?.percent ?? 0,
              savings: allocationSegments[2]?.percent ?? 0,
            }),
          )}
        >
          {allocationSegments.map((segment) => (
            <span
              key={segment.key}
              className={`categories-allocation-strip__segment categories-allocation-strip__segment--${segment.key}`}
              style={{ flexGrow: segment.percent }}
            />
          ))}
        </div>

        {!hasBudget && (
          <p className="categories-setup-copy">{t('budget:categoriesOverview.noBudgetCopy')}</p>
        )}
      </section>

      <section
        className="categories-map-list"
        aria-label={String(t('budget:categoriesOverview.categoryListLabel'))}
      >
        {categoryItems.map((item) => (
          <CategoryMapCard key={item.key} item={item} hasBudget={hasBudget} />
        ))}
      </section>
    </div>
  );
};

interface CategoryMapCardProps {
  item: CategoryOverviewItem;
  hasBudget: boolean;
}

const CategoryMapCard: React.FC<CategoryMapCardProps> = ({ item, hasBudget }) => {
  const { t } = useTranslation(['budget', 'taxonomy']);
  const fmtMoney = useFormatMoney(true);
  const Icon = CATEGORY_ICONS[item.key];
  const categoryName = t(`taxonomy:categoryNames.${item.key}`);
  const plannedLabel =
    item.key === 'savings'
      ? t('budget:categoriesOverview.target')
      : t('budget:categoriesOverview.allocated');

  return (
    <NavLink
      to={`/categories/${item.key}`}
      className="categories-map-card"
      aria-label={String(
        hasBudget
          ? t('budget:categoriesOverview.openCategoryAria', {
              category: categoryName,
              percent: item.percent,
              amount: fmtMoney(item.allocated),
            })
          : t('budget:categoriesOverview.openCategoryNoBudgetAria', {
              category: categoryName,
              percent: item.percent,
            }),
      )}
    >
      <article className={`categories-map-card__inner categories-map-card__inner--${item.key}`}>
        <div className="categories-map-card__top">
          <div
            className="categories-map-card__icon"
            style={{ background: getCategoryColorVar(item.key) }}
            aria-hidden
          >
            <TTIcon icon={Icon} size={24} color="var(--color-text-inverse)" />
          </div>
          <div className="categories-map-card__title">
            <h2>{categoryName}</h2>
            {hasBudget ? (
              <p>
                <span>{fmtMoney(item.allocated)}</span> {plannedLabel}
              </p>
            ) : (
              <p>
                <span>{item.percent}%</span> {t('budget:categoriesOverview.plannedShare')}
              </p>
            )}
          </div>
          <div className="categories-map-card__meta">
            <strong>{item.percent}%</strong>
            <TTIcon icon={FaChevronRight} size={14} color="currentColor" />
          </div>
        </div>

        <div className="categories-map-card__status">
          {hasBudget ? (
            <span>
              {t(getActivityLabelKey(item.key), { amount: fmtMoney(item.spent) })}
              {' · '}
              <strong
                className={clsx({
                  'categories-map-card__status-value--danger': item.amountKind === 'over',
                  'categories-map-card__status-value--success':
                    item.amountKind === 'goalReached' || item.amountKind === 'aboveGoal',
                })}
              >
                {t(getAmountLabelKey(item), { amount: fmtMoney(item.amount) })}
              </strong>
            </span>
          ) : (
            <span>{t('budget:categoriesOverview.structureOnly')}</span>
          )}
        </div>

        {hasBudget && (
          <div
            className="categories-map-card__progress"
            role="progressbar"
            aria-label={String(
              t('budget:categoriesOverview.progressAria', {
                category: categoryName,
                percent: Math.round(item.progress * 100),
              }),
            )}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(item.progress * 100)}
          >
            <span
              className={`categories-map-card__progress-fill categories-map-card__progress-fill--${item.progressTone}`}
              style={{
                width: `${item.progress * 100}%`,
                background:
                  item.progressTone === 'category' ? getCategoryColorVar(item.key) : undefined,
              }}
            />
          </div>
        )}

        <ul
          className="categories-group-preview"
          aria-label={String(
            t('budget:categoriesOverview.groupPreviewAria', { category: categoryName }),
          )}
        >
          {item.groups.map((group) => (
            <li key={group.value}>
              <ExpenseGroupIcon expenseGroup={group} />
              <span>{t(group.i18nLabel)}</span>
            </li>
          ))}
          <li className="categories-group-preview__more">
            <span aria-hidden>+{item.moreCount}</span>
            <em>
              {t('budget:categoriesOverview.more', {
                count: item.moreCount,
              })}
            </em>
          </li>
        </ul>
      </article>
    </NavLink>
  );
};

function getActivityLabelKey(category: Category) {
  return category === 'savings'
    ? 'budget:categoriesOverview.contributedAmount'
    : 'budget:categoriesOverview.spentAmount';
}

function getAmountLabelKey(item: CategoryOverviewItem) {
  if (item.key === 'savings') {
    if (item.amountKind === 'goalReached') return 'budget:categoriesOverview.goalReached';
    if (item.amountKind === 'aboveGoal') return 'budget:categoriesOverview.aboveGoalAmount';
    return 'budget:categoriesOverview.toGoalAmount';
  }

  if (item.amountKind === 'over') return 'budget:categoriesOverview.overAmount';
  if (item.amountKind === 'unused') return 'budget:categoriesOverview.unusedAmount';
  return 'budget:categoriesOverview.leftAmount';
}

export default CategoriesPage;
