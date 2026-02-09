import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { FaChevronRight } from 'react-icons/fa';

import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CategoryInsightCandidate,
  CategoryType,
} from '@api/types';
import { resolveExpenseGroup, getCssVar } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';
import { EmblaCarousel, TTIcon } from '@shared/ui';
import {
  makeSelectCategoryPanel,
  makeSelectExpenseGroupView,
  selectBudgetDoc,
  selectBudgetLoadStatus,
  selectMonthTiming,
  selectCategoriesTopInsights,
} from '@store/budget-store';
import { ExpenseGroupName, ProgressBar } from '@components';
import { CategoryPace, SmartInsightCard, SpendingTimelineBar, TransactionLine } from 'features';
import { selectSettingsAppTheme } from '@store/settings-store';

import './category.styles.scss';

const CategoryPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

  const status = useSelector(selectBudgetLoadStatus);
  const doc = useSelector(selectBudgetDoc);

  const { periodStart, periodEnd } = useSelector(selectMonthTiming);
  const selectPanel = useMemo(() => makeSelectCategoryPanel(type as Category), [type]);
  const categoryPanel = useSelector(selectPanel);
  const selectView = useMemo(() => makeSelectExpenseGroupView(type as Category), [type]);
  const view = useSelector(selectView);
  const topInsights = useSelector(selectCategoriesTopInsights);
  const theme = useSelector(selectSettingsAppTheme);

  const [categoryData, setCategoryData] = useState<{
    title?: string;
    icon: IconType;
    insights?: CategoryInsightCandidate[];
  }>({ icon: CATEGORY_ICONS.needs });

  useEffect(() => {
    switch (type) {
      case CategoryType.NEEDS:
        setCategoryData({
          title: 'Needs',
          icon: CATEGORY_ICONS.needs,
          insights: topInsights.needs,
        });
        break;
      case CategoryType.WANTS:
        setCategoryData({
          title: 'Wants',
          icon: CATEGORY_ICONS.wants,
          insights: topInsights.wants,
        });
        break;
      case CategoryType.SAVINGS:
        setCategoryData({
          title: 'Savings',
          icon: CATEGORY_ICONS.savings,
          insights: topInsights.savings,
        });
        break;

      default:
        setCategoryData({ icon: CATEGORY_ICONS.needs });

        break;
    }
  }, [type, topInsights]);

  if (status === 'loading' || !view) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const isPastPeriod = new Date() >= periodEnd;

  const asOf: Date | undefined = isPastPeriod
    ? new Date(doc?.summary?.computedAt ?? new Date())
    : new Date();

  return (
    <div className="category-page">
      <header
        className={`category-page-header category-page-header__${categoryData.title?.toLowerCase()} category-page-header__${theme}`}
      >
        <div className="category-name-line">
          <div className="category-name">
            <div
              className="category-icon-wrapper"
              style={{ backgroundColor: CATEGORY_COLORS[type as CategoryType] }}
            >
              <TTIcon icon={categoryData.icon} color="#fff" />
            </div>
            <h2>{t(`taxonomy:categoryNames.${categoryData.title?.toLowerCase()}`)}</h2>
          </div>
          <div className="allocated-container">
            <span className="allocated-label">{t('budget:allocated') ?? 'Allocated'}</span>
            <h3>{fmt(view.allocated)}</h3>
          </div>
        </div>
        <ProgressBar progress={view.progress} color={getCssVar(`--${type}`)} />
        <div className="values-line">
          <div className="category-summary category-middle">
            {t('budget:spent') ?? 'Spent'}: <strong>{fmt(view.spent)}</strong>
          </div>
          <div className="category-summary category-last">
            {t('budget:remaining') ?? 'Remaining'}: <strong>{fmt(view.remaining)}</strong>
          </div>
        </div>
      </header>

      <section className="tt-section">
        <EmblaCarousel showDots>
          {categoryData.insights?.map((insight) => (
            <SmartInsightCard key={insight.id} insight={insight} />
          ))}
        </EmblaCarousel>
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('budget:topExpGroups')}</h3>
        {view.byExpGroup.length === 0 ? (
          <div className={`top-egs-section missing-items top-egs-section__${theme}`}>
            {t('budget:noTransactions') ?? 'No transactions yet.'}
          </div>
        ) : (
          <ul className={`top-egs-section top-egs-list top-egs-section__${theme}`}>
            {view.byExpGroup.slice(0, 3).map((row) => {
              const expGroup = resolveExpenseGroup(row.expGroup);
              return (
                <li key={row.expGroup} className="egs-item">
                  <ExpenseGroupName expenseGroup={expGroup} />
                  <strong>{fmt(row.total)}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('budget:spendPace')}</h3>
        <div className={`category-chart-section category-chart-section__${theme}`}>
          <CategoryPace category={type as Category} />
        </div>
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('budget:monthPace')}</h3>
        <SpendingTimelineBar
          periodStart={periodStart}
          periodEnd={periodEnd}
          runOutDate={categoryPanel.runOutDate}
          now={asOf}
        />
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('pages.transactions') ?? 'Transactions'}</h3>
        {view.items.length === 0 ? (
          <div
            className={`category-transactions-section missing-items category-transactions-section__${theme}`}
          >
            {t('pageContent.category.noTrans')} {categoryData.title?.toLowerCase()}.
          </div>
        ) : (
          <div className={`category-transactions-section category-transactions-section__${theme}`}>
            {view.items.slice(0, 5).map((t) => {
              const expGroup = resolveExpenseGroup(t.expenseGroup);

              return (
                <div key={t.id} className="category-transaction">
                  <TransactionLine key={t.id} txn={t} expenseGroup={expGroup} showDate />
                </div>
              );
            })}
            <div className="category-transaction">
              <NavLink className="see-txns-link" to={'/transactions'}>
                <span>{t('budget:seeAllTxn')}</span>
                <TTIcon icon={FaChevronRight} size={14} color={getCssVar('--color-primary')} />
              </NavLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
