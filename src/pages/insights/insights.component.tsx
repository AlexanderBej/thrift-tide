import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, BarChart3, RefreshCw } from 'lucide-react';

import { CATEGORY_ICONS, getCategoryColorVar } from '@api/types';
import { useFormatMoney } from '@shared/hooks';
import { Button, LocalSpinner, TTIcon } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  loadInsightsHistory,
  selectInsightsAnalytics,
  selectInsightsError,
  selectInsightsStatus,
} from '@store/insights-store';
import type { AppDispatch } from '@store/store';

import {
  CategoryPattern,
  formatCompactCurrency,
  formatInsightsMonth,
  InsightsAnalytics,
  InsightCategory,
  SpendingComparison,
  WatchPattern,
} from './insights-analytics.util';

import './insights.styles.scss';

const Insights: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation(['insights', 'taxonomy']);
  const fmtMoney = useFormatMoney(true);
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectInsightsStatus);
  const error = useSelector(selectInsightsError);
  const analytics = useSelector(selectInsightsAnalytics);

  useEffect(() => {
    if (!user?.uuid) return;
    if (status === 'idle') {
      dispatch(loadInsightsHistory({ uid: user.uuid }));
    }
  }, [dispatch, status, user?.uuid]);

  const retry = () => {
    if (!user?.uuid || status === 'loading') return;
    dispatch(loadInsightsHistory({ uid: user.uuid }));
  };

  const periodCount = analytics.periods.length;
  const isInitialLoading = status === 'loading' && periodCount === 0;
  const isError = status === 'error' && periodCount === 0;

  if (isInitialLoading) {
    return (
      <section className="insights-page insights-state" aria-live="polite" aria-busy="true">
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
      <section className="insights-page insights-state insights-state--error" role="alert">
        <div className="insights-state__icon" aria-hidden>
          <AlertCircle size={24} />
        </div>
        <div>
          <h2>{t('states.error.title')}</h2>
          <p>{error || t('states.error.message')}</p>
        </div>
        <Button variant="secondary" onClick={retry}>
          <RefreshCw size={16} aria-hidden />
          {t('actions.retry')}
        </Button>
      </section>
    );
  }

  if (periodCount === 0) {
    return (
      <section className="insights-page insights-state">
        <div className="insights-empty-mark" aria-hidden>
          <BarChart3 size={28} />
        </div>
        <div>
          <p className="insights-kicker">{t('window.title')}</p>
          <h2>{t('states.empty.title')}</h2>
          <p>{t('states.empty.message')}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="insights-page insights-page--v3">
      <header className="insights-context">
        <span>{t('window.title')}</span>
        <strong>{t('window.label', { count: periodCount })}</strong>
      </header>

      <RecentPattern analytics={analytics} />

      {periodCount === 1 ? (
        <section className="insights-state insights-state--inline">
          <h2>{t('states.onePeriod.title')}</h2>
          <p>{t('states.onePeriod.message')}</p>
        </section>
      ) : (
        <>
          <SpendingTrend analytics={analytics} formatMoney={fmtMoney} language={i18n.language} />
          <BudgetOutcomesBlock analytics={analytics} formatMoney={fmtMoney} language={i18n.language} />
          <CategoryPatternsBlock analytics={analytics} language={i18n.language} />
          <SavingsConsistencyBlock analytics={analytics} />
          <WatchPatternBlock watch={analytics.watch} />
        </>
      )}
    </div>
  );
};

interface FormatProps {
  formatMoney: (value: number) => string;
}

const RecentPattern: React.FC<{ analytics: InsightsAnalytics }> = ({ analytics }) => {
  const { t } = useTranslation('insights');
  const { comparison, outcomes, periods } = analytics;
  const headline = getRecentPatternHeadline(comparison, periods.length, t);
  const underOrOn = outcomes.under + outcomes.on;

  return (
    <section className="insights-hero" aria-labelledby="insights-recent-pattern">
      <div>
        <p className="insights-kicker">{t('recent.kicker')}</p>
        <h1 id="insights-recent-pattern">{headline}</h1>
        <p>
          {outcomes.trackedPeriods > 0
            ? t('recent.supportBudgeted', {
                under: underOrOn,
                total: outcomes.trackedPeriods,
              })
            : t('recent.supportNoBudget')}
        </p>
      </div>
      <TrendGlyph direction={comparison.direction} />
    </section>
  );
};

const SpendingTrend: React.FC<
  { analytics: InsightsAnalytics; language: string } & FormatProps
> = ({ analytics, formatMoney, language }) => {
  const { t } = useTranslation('insights');
  const values = analytics.periods.map((period) => period.summary.totalSpent ?? 0);
  const maxValue = Math.max(...values, 0);
  const comparison = analytics.comparison;

  return (
    <section className="insights-section" aria-labelledby="insights-spending-trend">
      <div className="insights-section__heading">
        <div>
          <p className="insights-kicker">{t('spending.kicker')}</p>
          <h2 id="insights-spending-trend">{t('spending.title')}</h2>
        </div>
      </div>

      <div className="spending-chart" role="img" aria-label={String(t('spending.chartAria'))}>
        {analytics.periods.map((period) => {
          const spent = period.summary.totalSpent ?? 0;
          const height = maxValue > 0 ? Math.max(5, (spent / maxValue) * 100) : 5;
          const month = formatInsightsMonth(period.month, language);
          const exactAmount = formatMoney(spent);
          return (
            <div
              className="spending-chart__item"
              key={period.id}
              title={exactAmount}
              aria-label={String(t('spending.barAria', { month, amount: exactAmount }))}
            >
              <div className="spending-chart__bar-track" aria-hidden>
                <span style={{ height: `${height}%` }} />
              </div>
              <strong>{month}</strong>
              <span>{formatCompactCurrency(spent, formatMoney)}</span>
            </div>
          );
        })}
      </div>

      <div className="insights-metric-row">
        <Metric
          label={t('spending.averageSpent')}
          value={formatMoney(comparison.latestAverage ?? values[values.length - 1] ?? 0)}
          subtext={
            comparison.comparisonSize === 3 && comparison.percentChange != null
              ? String(t('spending.vsPreviousThree', {
                  direction: t(`direction.${comparison.direction}`),
                  percent: Math.abs(Math.round(comparison.percentChange * 100)),
                }))
              : String(t('spending.windowAverage', { count: analytics.periods.length }))
          }
        />
      </div>
    </section>
  );
};

const BudgetOutcomesBlock: React.FC<
  { analytics: InsightsAnalytics; language: string } & FormatProps
> = ({ analytics, formatMoney, language }) => {
  const { t } = useTranslation('insights');
  const { outcomes } = analytics;

  return (
    <section className="insights-section" aria-labelledby="insights-budget-outcomes">
      <div className="insights-section__heading">
        <div>
          <p className="insights-kicker">{t('outcomes.kicker')}</p>
          <h2 id="insights-budget-outcomes">{t('outcomes.title')}</h2>
        </div>
      </div>

      {outcomes.trackedPeriods === 0 ? (
        <p className="insights-muted">{t('outcomes.insufficient')}</p>
      ) : (
        <div className="outcome-grid">
          <Metric
            label={t('outcomes.underBudget')}
            value={t('outcomes.ofPeriods', { count: outcomes.under, total: outcomes.trackedPeriods })}
            variant="flat"
          />
          <Metric
            label={t('outcomes.averageUnused')}
            value={formatMoney(outcomes.averageUnused ?? 0)}
            variant="flat"
          />
          <Metric
            label={t('outcomes.bestFinish')}
            value={
              outcomes.strongestFinish
                ? formatInsightsMonth(outcomes.strongestFinish.month, language)
                : t('outcomes.none')
            }
            subtext={
              outcomes.strongestFinish
                ? String(t('outcomes.unusedAmount', {
                    amount: formatMoney(outcomes.strongestFinish.unused),
                }))
                : undefined
            }
            variant="flat"
          />
          <Metric label={t('outcomes.overBudget')} value={String(outcomes.over)} variant="flat" />
        </div>
      )}
    </section>
  );
};

const CategoryPatternsBlock: React.FC<{ analytics: InsightsAnalytics; language: string }> = ({
  analytics,
  language,
}) => {
  const { t } = useTranslation(['insights', 'taxonomy']);

  return (
    <section className="insights-section" aria-labelledby="insights-category-patterns">
      <div className="insights-section__heading">
        <div>
          <p className="insights-kicker">{t('insights:categories.kicker')}</p>
          <h2 id="insights-category-patterns">{t('insights:categories.title')}</h2>
        </div>
      </div>

      <div className="category-patterns">
        {analytics.categoryPatterns.map((pattern) => (
          <CategoryPatternRow key={pattern.category} pattern={pattern} language={language} />
        ))}
      </div>
    </section>
  );
};

const CategoryPatternRow: React.FC<{ pattern: CategoryPattern; language: string }> = ({
  pattern,
  language,
}) => {
  const { t } = useTranslation(['insights', 'taxonomy']);
  const Icon = CATEGORY_ICONS[pattern.category];
  const latestPercent = pattern.latestUsage == null ? null : Math.round(pattern.latestUsage * 100);
  const changePoints = pattern.pointChange == null ? null : Math.round(pattern.pointChange * 100);
  const usageTone = getCategoryUsageTone(pattern.category, pattern.latestUsage);

  return (
    <article className="category-pattern">
      <div className="category-pattern__identity">
        <span
          className="category-pattern__icon"
          style={{ background: getCategoryColorVar(pattern.category) }}
          aria-hidden
        >
          <TTIcon icon={Icon} size={18} color="var(--color-text-inverse)" />
        </span>
        <div>
          <h3>{t(`taxonomy:categoryNames.${pattern.category}`)}</h3>
          <p>{t(`insights:categoryTrend.${pattern.trend}`)}</p>
        </div>
      </div>

      <Sparkline pattern={pattern} language={language} />

      <div className={clsx('category-pattern__metric', `category-pattern__metric--${usageTone}`)}>
        <strong>{latestPercent == null ? t('insights:common.notAvailable') : `${latestPercent}%`}</strong>
        <span>{t('insights:categories.latest')}</span>
        {changePoints != null && (
          <em>
            {changePoints > 0 ? '+' : ''}
            {changePoints}
            {t('insights:categories.points')}
          </em>
        )}
      </div>
    </article>
  );
};

const SavingsConsistencyBlock: React.FC<{ analytics: InsightsAnalytics }> = ({ analytics }) => {
  const { t } = useTranslation('insights');
  const { savings } = analytics;

  return (
    <section className="insights-section" aria-labelledby="insights-savings-consistency">
      <div className="insights-section__heading">
        <div>
          <p className="insights-kicker">{t('savings.kicker')}</p>
          <h2 id="insights-savings-consistency">{t('savings.title')}</h2>
        </div>
      </div>

      {savings.validPeriods === 0 ? (
        <p className="insights-muted">{t('savings.insufficient')}</p>
      ) : (
        <>
          <div className="savings-metrics">
            <Metric
              label={t('savings.goalsReached')}
              value={t('savings.ofPeriods', { count: savings.reached, total: savings.validPeriods })}
            />
            <Metric
              label={t('savings.averageCompletion')}
              value={`${Math.round((savings.averageCompletion ?? 0) * 100)}%`}
            />
            <Metric label={t('savings.currentStreak')} value={String(savings.currentStreak)} />
          </div>
          <ol className="savings-sequence" aria-label={String(t('savings.sequenceLabel'))}>
            {savings.sequence.map((item) => (
              <li
                key={item.month}
                className={clsx(
                  'savings-sequence__dot',
                  item.reached === true && 'savings-sequence__dot--reached',
                  item.reached === false && 'savings-sequence__dot--missed',
                  item.reached == null && 'savings-sequence__dot--unavailable',
                )}
                aria-label={String(
                  t(
                    item.reached == null
                      ? 'savings.sequenceUnavailable'
                      : item.reached
                        ? 'savings.sequenceReached'
                        : 'savings.sequenceMissed',
                    { month: item.month },
                  ),
                )}
              >
                <span aria-hidden />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

const WatchPatternBlock: React.FC<{ watch: WatchPattern }> = ({ watch }) => {
  const { t } = useTranslation(['insights', 'taxonomy']);
  const copy = getWatchCopy(watch, t);

  return (
    <section className="watch-pattern" aria-labelledby="insights-watch-pattern">
      <p className="insights-kicker">{t('insights:watch.kicker')}</p>
      <h2 id="insights-watch-pattern">{copy.title}</h2>
      <p>{copy.message}</p>
    </section>
  );
};

const Metric: React.FC<{ label: string; value: string; subtext?: string; variant?: 'default' | 'flat' }> = ({
  label,
  value,
  subtext,
  variant = 'default',
}) => (
  <div className={clsx('insights-metric', variant === 'flat' && 'insights-metric--flat')}>
    <span>{label}</span>
    <strong>{value}</strong>
    {subtext && <em>{subtext}</em>}
  </div>
);

const TrendGlyph: React.FC<{ direction: SpendingComparison['direction'] }> = ({ direction }) => {
  const Icon = direction === 'down' ? ArrowDown : direction === 'up' ? ArrowUp : ArrowRight;
  return (
    <div className={`trend-glyph trend-glyph--${direction}`} aria-hidden>
      <Icon size={18} />
    </div>
  );
};

const Sparkline: React.FC<{ pattern: CategoryPattern; language: string }> = ({ pattern, language }) => {
  const { t } = useTranslation('insights');
  const valid = pattern.values
    .map((value, index) => ({ ...value, index }))
    .filter((value): value is { month: string; usage: number; index: number } => value.usage != null);
  const pointList = useMemo(() => {
    if (valid.length === 0) return [] as Array<{ month: string; x: number; y: number }>;
    const max = Math.max(...valid.map((value) => value.usage), 1);
    const min = Math.min(...valid.map((value) => value.usage), 0);
    const range = Math.max(max - min, 0.1);
    return valid.map((value) => ({
      month: value.month,
      x: pattern.values.length <= 1 ? 50 : (value.index / (pattern.values.length - 1)) * 100,
      y: 42 - ((value.usage - min) / range) * 34,
    }));
  }, [pattern.values.length, valid]);
  const points = pointList.map((point) => `${point.x},${point.y}`).join(' ');
  const latest = pattern.latestUsage == null ? null : Math.round(pattern.latestUsage * 100);
  const label =
    latest == null
      ? t('categories.sparklineUnavailable')
      : `${formatInsightsMonth(valid[valid.length - 1]?.month ?? '', language)} ${latest}%`;

  return (
    <svg
      className={clsx('category-sparkline', `category-sparkline--${pattern.category}`)}
      viewBox="0 0 100 48"
      role="img"
      aria-label={label}
    >
      <line x1="0" y1="42" x2="100" y2="42" />
      {points && <polyline points={points} />}
      {pointList.map((point) => (
        <circle key={point.month} cx={point.x} cy={point.y} r="2.8" />
      ))}
    </svg>
  );
};

function getRecentPatternHeadline(
  comparison: SpendingComparison,
  periodCount: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (comparison.direction === 'insufficient') return t('recent.headlineInsufficient');
  if (comparison.direction === 'flat') return t('recent.headlineFlat');
  if (comparison.percentChange == null) {
    return comparison.direction === 'up' ? t('recent.headlineUpNoPercent') : t('recent.headlineDownNoPercent');
  }

  return t(`recent.headline.${comparison.direction}`, {
    percent: Math.abs(Math.round(comparison.percentChange * 100)),
    count: periodCount,
  });
}

function getWatchCopy(watch: WatchPattern, t: (key: string, options?: Record<string, unknown>) => string) {
  const category = watch.category ? t(`taxonomy:categoryNames.${watch.category}`) : '';
  if (watch.kind === 'categoryOverspendTrend') {
    return {
      title: t('insights:watch.categoryOverspendTrend.title', { category }),
      message: t('insights:watch.categoryOverspendTrend.message', {
        from: Math.round((watch.fromPercent ?? 0) * 100),
        to: Math.round((watch.toPercent ?? 0) * 100),
      }),
    };
  }
  if (watch.kind === 'categoryVolatile') {
    return {
      title: t('insights:watch.categoryVolatile.title', { category }),
      message: t('insights:watch.categoryVolatile.message', {
        from: Math.round((watch.fromPercent ?? 0) * 100),
        to: Math.round((watch.toPercent ?? 0) * 100),
      }),
    };
  }
  if (watch.kind === 'spendingIncrease') {
    return {
      title: t('insights:watch.spendingIncrease.title'),
      message: t('insights:watch.spendingIncrease.message', {
        percent: Math.abs(Math.round((watch.percentChange ?? 0) * 100)),
      }),
    };
  }
  if (watch.kind === 'savingsStreak') {
    return {
      title: t('insights:watch.savingsStreak.title'),
      message: t('insights:watch.savingsStreak.message', { count: watch.streak ?? 0 }),
    };
  }
  if (watch.kind === 'spendingDecrease') {
    return {
      title: t('insights:watch.spendingDecrease.title'),
      message: t('insights:watch.spendingDecrease.message', {
        percent: Math.abs(Math.round((watch.percentChange ?? 0) * 100)),
      }),
    };
  }
  if (watch.kind === 'stablePositive') {
    return {
      title: t('insights:watch.stablePositive.title'),
      message: t('insights:watch.stablePositive.message'),
    };
  }
  return {
    title: t('insights:watch.insufficient.title'),
    message: t('insights:watch.insufficient.message'),
  };
}

function getCategoryUsageTone(category: InsightCategory, usage: number | null) {
  if (usage == null) return 'muted';
  if (category === 'savings') return usage >= 1 ? 'success' : 'muted';
  if (usage > 1.1) return 'danger';
  if (usage > 1) return 'warning';
  return 'muted';
}

export default Insights;
