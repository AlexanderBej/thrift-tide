import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Button, TTIcon, Accordion, ExpansionPanelItem, InfoBlock } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectHistoryStatus,
  selectHistoryHasMore,
  resetHistory,
  loadHistoryPage,
  selectHistoryDocsWithPercentsAndSummary,
} from '@store/history-store';
import { AppDispatch } from '@store/store';
import { HistoryDocWithSummary } from '@api/models';
import { formatMonth, getCssVar, historyStatusBadge, toneConverter } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';

import './history.styles.scss';

interface BucketData {
  key: string;
  weight: number;
  spent: number;
  color: string;
}

function buildSpentGradient(buckets: BucketData[]) {
  // weight: 0..1, spent: 0..1
  const filledParts = buckets.map((b) => ({
    key: b.key,
    w: b.weight,
    f: b.weight * b.spent,
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
  const { t } = useTranslation(['common', 'budget']);
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

  const loadMore = () => user?.uuid && dispatch(loadHistoryPage({ uid: user.uuid, pageSize: 12 }));

  const getDate = (row: HistoryDocWithSummary) => {
    const month = formatMonth(row.month);
    const year = new Date(row.summary.computedAt).getFullYear();
    return `${month} ${year}`;
  };

  const getBucketsData = (row: HistoryDocWithSummary): BucketData[] => {
    return [
      {
        key: 'needs',
        weight: row.percents.needs,
        spent: row.summary.spent.needs / row.summary.allocations.needs,
        color:
          row.summary.spent.needs / row.summary.allocations.needs > 0.99
            ? getCssVar('--error')
            : getCssVar('--needs'),
      },
      {
        key: 'wants',
        weight: row.percents.wants,
        spent: row.summary.spent.wants / row.summary.allocations.wants,
        color:
          row.summary.spent.wants / row.summary.allocations.wants > 0.99
            ? getCssVar('--error')
            : getCssVar('--wants'),
      },
      {
        key: 'savings',
        weight: row.percents.savings,
        spent: row.summary.spent.savings / row.summary.allocations.savings,
        color:
          row.summary.spent.savings / row.summary.allocations.savings > 0.99
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
    const bucketData = getBucketsData(row);
    const background = buildSpentGradient(bucketData);
    const spentPercents = (row.summary.totalSpent / row.summary.income) * 100;

    return {
      id: row.id,
      title: (
        <>
          <div className="history-doc">
            <div className="history-doc-header">
              <span className="doc-date">{date}</span>
              <div className={clsx('history-badge-wrapper', badge.tone)}>
                <TTIcon icon={badgeMeta.icon} color={badgeMeta.color} size={16} />
                <span className="history-badge">{t(badge.labelKey)}</span>
              </div>
            </div>
            <span className="spent-line">
              {t('budget:spent')} <strong>{fmtMoney(row.summary.totalSpent)}</strong> of{' '}
              {fmtMoney(row.summary.income)}
            </span>
            <div className="buckets-progress-bar">
              <div
                className="buckets-progress"
                style={{
                  width: `${spentPercents}%`,
                  background,
                }}
              />
            </div>
            <span className="remaining-value">
              {t('budget:remaining')}: {fmtMoney(remaining)}
            </span>
          </div>
        </>
      ),
      content: (
        <div className="history-doc-content">
          <div className="legends">
            {bucketData.map((bucket, index) => (
              <div className="legend-container" key={index}>
                <div style={{ backgroundColor: bucket.color }} className="bullet" />
                <span className="bucket-key">{bucket.key}</span>
                <strong>{bucket.weight * 100}% </strong>
              </div>
            ))}
          </div>
          <h4>You have a total of {row.summary.totalTxns} transactions</h4>
        </div>
      ),
    };
  });

  return (
    <div className="history-page">
      <InfoBlock>
        <span>Track your past months to see how you are doing and what can be improved.</span>
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
