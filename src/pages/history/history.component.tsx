import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import {
  Button,
  TTIcon,
  Accordion,
  ExpansionPanelItem,
  InfoBlock,
  DonutItem,
  Donut,
  EmblaCarousel,
} from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectHistoryStatus,
  selectHistoryHasMore,
  resetHistory,
  loadHistoryPage,
  selectHistoryDocsWithPercentsAndSummary,
  selectHistorySmartInsightsByMonth,
} from '@store/history-store';
import { AppDispatch } from '@store/store';
import { HistoryDocWithSummary } from '@api/models';
import { formatMonth, getCssVar, historyStatusBadge, toneConverter } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';
import { Language } from '@api/types';

import './history.styles.scss';
import { ProgressBar } from '@shared/components';
import { SmartInsightCard } from 'features';

interface CategoryData {
  key: string;
  weight: number;
  spentPerc: number;
  spentSum: number;

  color: string;
  alloc: number;
}

function buildSpentGradient(categories: CategoryData[]) {
  // weight: 0..1, spent: 0..1
  const filledParts = categories.map((b) => ({
    key: b.key,
    w: b.weight,
    f: b.weight * b.spentPerc,
    color: b.color,
  }));

  // cumulative stops in [0..1]
  let acc = 0;
  const stops = [];

  for (const part of filledParts) {
    const start = acc;
    const end = acc + part.f;
    if (end > start) {
      stops.push(`${part.color} ${end * 100}%`);
    }
    acc = end;
  }

  // everything after filled is "empty"
  //   stops.push(`transparent ${acc * 100}% 100%`);

  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

const History: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation(['common', 'budget', 'insights']);
  const fmtMoney = useFormatMoney(true);

  const user = useSelector(selectAuthUser);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!user?.uuid) return;

    if (didInitRef.current) return;
    didInitRef.current = true;

    dispatch(resetHistory());
    dispatch(loadHistoryPage({ uid: user.uuid, pageSize: 12 })); // last 12 periods
  }, [dispatch, user?.uuid]);

  useEffect(() => {
    didInitRef.current = false;
  }, [user?.uuid]);

  const status = useSelector(selectHistoryStatus);
  const hasMore = useSelector(selectHistoryHasMore);

  const rows = useSelector(selectHistoryDocsWithPercentsAndSummary);
  const historyInsightsByMonth = useSelector(selectHistorySmartInsightsByMonth);

  const loadMore = () => user?.uuid && dispatch(loadHistoryPage({ uid: user.uuid, pageSize: 12 }));

  const getDate = (row: HistoryDocWithSummary) => {
    const month = formatMonth(row.month, i18n.language as Language);
    const year = new Date(row.summary.computedAt).getFullYear();
    return `${month} ${year}`;
  };

  const getCategoriesData = (row: HistoryDocWithSummary): CategoryData[] => {
    return [
      {
        key: 'needs',
        weight: row.percents.needs,
        spentPerc: row.summary.spent.needs / row.summary.allocations.needs,
        spentSum: row.summary.spent.needs,
        alloc: row.summary.allocations.needs,
        color:
          row.summary.spent.needs / row.summary.allocations.needs >= 1
            ? getCssVar('--error')
            : getCssVar('--needs'),
      },
      {
        key: 'wants',
        weight: row.percents.wants,
        spentPerc: row.summary.spent.wants / row.summary.allocations.wants,
        spentSum: row.summary.spent.wants,
        alloc: row.summary.allocations.wants,
        color:
          row.summary.spent.wants / row.summary.allocations.wants >= 1
            ? getCssVar('--error')
            : getCssVar('--wants'),
      },
      {
        key: 'savings',
        weight: row.percents.savings,
        spentPerc: row.summary.spent.savings / row.summary.allocations.savings,
        spentSum: row.summary.spent.savings,
        alloc: row.summary.allocations.savings,
        color:
          row.summary.spent.savings / row.summary.allocations.savings >= 1
            ? getCssVar('--error')
            : getCssVar('--savings'),
      },
    ];
  };

  const accordionItems: ExpansionPanelItem[] = rows.map((row) => {
    const badge = historyStatusBadge(row.summary);
    const date = getDate(row);
    const badgeMeta = toneConverter(badge.tone);
    const remaining = row.summary.income - row.summary.totalSpent;
    const categoriesData = getCategoriesData(row);
    const background = buildSpentGradient(categoriesData);
    const spentPercents = (row.summary.totalSpent / row.summary.income) * 100;
    const monthInsights = historyInsightsByMonth[row.id] ?? [];

    const donutItems: DonutItem[] = categoriesData.map((cat) => ({
      id: cat.key,
      label: cat.key,
      color: cat.color,
      value: cat.weight,
    }));

    return {
      id: row.id,
      title: (
        <div className="history-doc">
          <div className="history-doc-header">
            <span className="doc-date">{date}</span>
            <div className={clsx('history-badge-wrapper', badge.tone)}>
              <TTIcon icon={badgeMeta.icon} color={badgeMeta.color} size={16} />
              <span className="history-badge">{t(badge.labelKey)}</span>
            </div>
          </div>
          <span className="remaining-line">
            {t('budget:remaining')} <strong>{fmtMoney(remaining)}</strong>
            {i18n.language === 'ro' ? ' din ' : ' of '}
            <strong>{fmtMoney(row.summary.income)}</strong>
          </span>
          <div className="categories-progress-bar">
            <div
              className="categories-progress"
              style={{
                width: `${spentPercents}%`,
                background,
              }}
            />
          </div>
          <span className="spent-value">
            {t('budget:spentInTxns', {
              spent: fmtMoney(row.summary.totalSpent),
              txns: row.summary.totalTxns,
            })}
          </span>
        </div>
      ),
      content: (
        <div className="history-doc-content">
          <div className="categories">
            <Donut height={130} showTooltip={false} data={donutItems} />
            <div className="cat-details">
              {categoriesData.map((cat, index) => (
                <div className="category" key={index}>
                  <div className="cat-header-line">
                    <h4>{cat.key}</h4>
                    <div className="cat-stats">
                      <strong>{cat.spentSum}</strong>
                      <span>
                        ({Math.round(cat.spentPerc * 100)}%) {i18n.language === 'ro' ? 'din' : 'of'}
                      </span>
                      <strong>{cat.alloc}</strong>
                    </div>
                  </div>
                  <ProgressBar color={cat.color} progress={cat.spentPerc} />
                </div>
              ))}
            </div>
          </div>

          {!!monthInsights.length && (
            <div className="history-insights">
              <EmblaCarousel showDots>
                {monthInsights.map((insight) => (
                  <SmartInsightCard key={insight.id} insight={insight} />
                ))}
              </EmblaCarousel>
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="history-page">
      <InfoBlock>
        <span>{t('pageContent.history.info')}</span>
      </InfoBlock>
      <div className="history-blocks">
        <Accordion type="single" defaultOpenId="needs" items={accordionItems} spaceLarge />
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={status === 'loading'}>
            <span>{status === 'loading' ? 'Loading…' : 'Load more'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
