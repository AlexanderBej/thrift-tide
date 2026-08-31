import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { TbTransactionEuro } from 'react-icons/tb';

import { Button, LocalSpinner, TTIcon } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectHistoryStatus,
  selectHistoryHasMore,
  selectHistoryError,
  resetHistory,
  loadHistoryPage,
  selectHistoryArchiveRows,
} from '@store/history-store';
import { AppDispatch } from '@store/store';
import { useFormatMoney } from '@shared/hooks';
import { Language } from '@api/types';

import {
  buildCategoryUsage,
  formatHistoryMonthYear,
  formatHistoryPeriodRange,
  getHistoryOutcome,
  getTotalUsage,
  HistoryArchiveRow,
} from './history-summary.util';
import './history.styles.scss';

const HISTORY_PAGE_SIZE = 12;

const History: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation(['history', 'taxonomy']);
  const fmtMoney = useFormatMoney(true);

  const user = useSelector(selectAuthUser);
  const didInitRef = useRef(false);
  const status = useSelector(selectHistoryStatus);
  const error = useSelector(selectHistoryError);
  const hasMore = useSelector(selectHistoryHasMore);
  const rows = useSelector(selectHistoryArchiveRows) as HistoryArchiveRow[];

  useEffect(() => {
    if (!user?.uuid) return;
    if (didInitRef.current) return;

    didInitRef.current = true;
    dispatch(resetHistory());
    dispatch(loadHistoryPage({ uid: user.uuid, pageSize: HISTORY_PAGE_SIZE }));
  }, [dispatch, user?.uuid]);

  useEffect(() => {
    didInitRef.current = false;
  }, [user?.uuid]);

  const loadPage = () => {
    if (!user?.uuid || status === 'loading') return;
    dispatch(loadHistoryPage({ uid: user.uuid, pageSize: HISTORY_PAGE_SIZE }));
  };

  const retry = () => {
    if (!user?.uuid || status === 'loading') return;
    dispatch(resetHistory());
    dispatch(loadHistoryPage({ uid: user.uuid, pageSize: HISTORY_PAGE_SIZE }));
  };

  const isInitialLoading = status === 'loading' && rows.length === 0;
  const isError = status === 'error' && rows.length === 0;
  const isEmpty = status === 'ready' && rows.length === 0;

  if (isInitialLoading) {
    return (
      <section className="history-page history-state" aria-live="polite" aria-busy="true">
        <LocalSpinner />
        <div>
          <h2>{t('states.loading.title')}</h2>
          <p>{t('states.loading.message')}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="history-page history-state history-state--error" role="alert">
        <div>
          <h2>{t('states.error.title')}</h2>
          <p>{error || t('states.error.message')}</p>
        </div>
        <Button variant="secondary" onClick={retry} loading={status === 'loading'}>
          {t('actions.retry')}
        </Button>
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className="history-page history-state">
        <div>
          <h2>{t('states.empty.title')}</h2>
          <p>{t('states.empty.message')}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="history-page">
      <ul className="history-list" aria-label={String(t('listLabel'))}>
        {rows.map((row) => (
          <HistoryPeriodCard
            key={row.id}
            row={row}
            language={i18n.language as Language}
            formatMoney={fmtMoney}
            t={t}
          />
        ))}
      </ul>

      {hasMore && (
        <div className="history-pagination">
          <Button
            variant="quiet"
            onClick={loadPage}
            disabled={status === 'loading'}
            loading={status === 'loading'}
          >
            {t('actions.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

interface HistoryPeriodCardProps {
  row: HistoryArchiveRow;
  language: Language;
  formatMoney: (value: number) => string;
  t: TFunction;
}

const HistoryPeriodCard: React.FC<HistoryPeriodCardProps> = ({ row, language, formatMoney, t }) => {
  const monthLabel = formatHistoryMonthYear(row.month, language);
  const periodRange = formatHistoryPeriodRange(row.periodStart, row.periodEnd, language);

  if (!row.summary) {
    return (
      <li className="history-card history-card--unavailable">
        <div className="history-card__header">
          <div>
            <h2>{monthLabel}</h2>
            {periodRange && <p>{periodRange}</p>}
          </div>
        </div>
        <div className="history-card__unavailable">
          <strong>{t('missingSummary.title')}</strong>
          <span>{t('missingSummary.message')}</span>
        </div>
      </li>
    );
  }

  const outcome = getHistoryOutcome(row.summary, formatMoney);
  const totalUsage = getTotalUsage(row.summary);
  const categoryUsage = buildCategoryUsage(row.summary);
  const progressLabel =
    totalUsage.percent == null
      ? t('progress.noBudget')
      : t('progress.total', { percent: totalUsage.percent });

  return (
    <li className={clsx('history-card', `history-card--${outcome.tone}`)}>
      <div className="history-card__header">
        <div>
          <h2>{monthLabel}</h2>
          {periodRange && <p>{periodRange}</p>}
        </div>
        <span className={clsx('history-card__outcome', `history-card__outcome--${outcome.tone}`)}>
          {String(t(outcome.key, outcome.vars ?? {}))}
        </span>
      </div>

      <div className="history-card__spending">
        <span>
          {t('spentOfIncome', {
            spent: formatMoney(row.summary.totalSpent ?? 0),
            income: formatMoney(row.summary.income ?? 0),
          })}
        </span>
        <span>{progressLabel}</span>
      </div>
      <div className="history-total-progress" role="img" aria-label={String(progressLabel)}>
        <span style={{ width: `${totalUsage.progress * 100}%` }} />
      </div>

      <div className="history-category-grid" aria-label={String(t('categoryUsageLabel'))}>
        {categoryUsage.map((metric) => {
          const label = t(`taxonomy:categoryNames.${metric.category}`);
          const percentLabel =
            metric.percent == null
              ? t('usage.notSet')
              : t('usage.percent', { percent: metric.percent });
          const ariaLabel = String(
            metric.percent == null
              ? t('usage.categoryUnavailableAria', { category: label })
              : t('usage.categoryAria', { category: label, percent: metric.percent }),
          );

          return (
            <div
              key={metric.category}
              className={clsx(
                'history-category',
                `history-category--${metric.category}`,
                `history-category--${metric.tone}`,
              )}
            >
              <div className="history-category__meta">
                <span>{label}</span>
                <strong>{percentLabel}</strong>
              </div>
              <div className="history-category__track" role="img" aria-label={ariaLabel}>
                <span style={{ width: `${metric.progress * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="history-card__transactions">
        <TTIcon icon={TbTransactionEuro} size={18} color="var(--color-text-secondary)" />
        <span>{t('transactions', { count: row.summary.totalTxns ?? 0 })}</span>
      </p>
    </li>
  );
};

export default History;
