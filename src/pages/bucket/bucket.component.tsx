import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';

import {
  Bucket,
  BUCKET_COLORS,
  BUCKET_ICONS,
  BucketInsightCandidate,
  BucketType,
} from '@api/types';
import { resolveCategory, getCssVar } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';
import { EmblaCarousel, TTIcon } from '@shared/ui';
import {
  makeSelectBucketPanel,
  makeSelectCategoryView,
  selectBucketsTopInsights,
  selectBudgetDoc,
  selectBudgetLoadStatus,
  selectMonthTiming,
} from '@store/budget-store';
import { CategoryName, ProgressBar } from '@components';
import { BucketPace, SmartInsightCard, SpendingTimelineBar, TransactionLine } from 'features';

import './bucket.styles.scss';
import { FaChevronRight } from 'react-icons/fa';

const BucketPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

  const status = useSelector(selectBudgetLoadStatus);
  const doc = useSelector(selectBudgetDoc);

  const { periodStart, periodEnd } = useSelector(selectMonthTiming);
  const selectPanel = useMemo(() => makeSelectBucketPanel(type as Bucket), [type]);
  const bucketPanel = useSelector(selectPanel);
  const selectView = useMemo(() => makeSelectCategoryView(type as Bucket), [type]);
  const view = useSelector(selectView);
  const topInsights = useSelector(selectBucketsTopInsights);

  const [bucketData, setBucketData] = useState<{
    title?: string;
    icon: IconType;
    insights?: BucketInsightCandidate[];
  }>({ icon: BUCKET_ICONS.needs });

  useEffect(() => {
    switch (type) {
      case BucketType.NEEDS:
        setBucketData({ title: 'Needs', icon: BUCKET_ICONS.needs, insights: topInsights.needs });
        break;
      case BucketType.WANTS:
        setBucketData({ title: 'Wants', icon: BUCKET_ICONS.wants, insights: topInsights.wants });
        break;
      case BucketType.SAVINGS:
        setBucketData({
          title: 'Savings',
          icon: BUCKET_ICONS.savings,
          insights: topInsights.savings,
        });
        break;

      default:
        setBucketData({ icon: BUCKET_ICONS.needs });

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
    <div className="bucket-page">
      <header
        className={`bucket-page-header bucket-page-header__${bucketData.title?.toLowerCase()}`}
      >
        <div className="bucket-name-line">
          <div className="bucket-name">
            <div
              className="bucket-icon-wrapper"
              style={{ backgroundColor: BUCKET_COLORS[type as BucketType] }}
            >
              <TTIcon icon={bucketData.icon} color="#fff" />
            </div>
            <h2>{t(`budget:bucketNames.${bucketData.title?.toLowerCase()}`)}</h2>
          </div>
          <div className="allocated-container">
            <span className="allocated-label">{t('budget:allocated') ?? 'Allocated'}</span>
            <h3>{fmt(view.allocated)}</h3>
          </div>
        </div>
        <ProgressBar progress={view.progress} color={getCssVar(`--${type}`)} />
        <div className="values-line">
          <div className="bucket-summary bucket-middle">
            {t('budget:spent') ?? 'Spent'}: <strong>{fmt(view.spent)}</strong>
          </div>
          <div className="bucket-summary bucket-last">
            {t('budget:remaining') ?? 'Remaining'}: <strong>{fmt(view.remaining)}</strong>
          </div>
        </div>
      </header>

      <section className="tt-section">
        <EmblaCarousel showDots>
          {bucketData.insights?.map((insight) => (
            <SmartInsightCard key={insight.id} insight={insight} />
          ))}
        </EmblaCarousel>
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('budget:topCategories') ?? 'Top categories'}</h3>
        {view.byCategory.length === 0 ? (
          <div className="top-categories-section missing-items">
            {t('budget:noTransactions') ?? 'No transactions yet.'}
          </div>
        ) : (
          <ul className="top-categories-section top-categories-list">
            {view.byCategory.slice(0, 3).map((row) => {
              const cat = resolveCategory(row.category);
              return (
                <li key={row.category} className="categories-item">
                  <CategoryName category={cat} />
                  <strong>{fmt(row.total)}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">Spending pace (daily spend)</h3>
        <div className="bucket-chart-section">
          <BucketPace bucket={type as Bucket} />
        </div>
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">Month pace (run out date)</h3>
        <SpendingTimelineBar
          periodStart={periodStart}
          periodEnd={periodEnd}
          runOutDate={bucketPanel.runOutDate}
          now={asOf}
        />
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('pages.transactions') ?? 'Transactions'}</h3>
        {view.items.length === 0 ? (
          <div className="bucket-transactions-section missing-items">
            {t('pageContent.bucket.noTrans')} {bucketData.title?.toLowerCase()}.
          </div>
        ) : (
          <div className="bucket-transactions-section">
            {view.items.slice(0, 5).map((t) => {
              const cat = resolveCategory(t.category);

              return (
                <div key={t.id} className="bucket-transaction">
                  <TransactionLine key={t.id} txn={t} category={cat} showDate />
                </div>
              );
            })}
            <div className="bucket-transaction">
              <NavLink className="see-txns-link" to={'/transactions'}>
                <span>See all transactions</span>
                <TTIcon icon={FaChevronRight} size={14} color={getCssVar('--color-primary')} />
              </NavLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default BucketPage;
