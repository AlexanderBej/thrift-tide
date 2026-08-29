import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { FaChevronRight } from 'react-icons/fa';
import { format } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';

import { Category, CATEGORY_ICONS, getCategoryColorVar } from '@api/types';
import { Insight } from '@api/models';
import { ExpenseGroupIcon } from '@shared/components';
import { useFormatMoney, useResolvedInsight } from '@shared/hooks';
import { resolveExpenseGroup } from '@shared/utils';
import { V3Action, TTIcon } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsCurrency } from '@store/settings-store';
import {
  BudgetContextAttention,
  BudgetContextSemantics,
  changeMonthThunk,
  getBudgetContextAttention,
  selectBudgetDoc,
  selectBudgetContextSemantics,
  selectSmartDashboardInsight,
  selectTotals,
  selectTxnsInPeriod,
} from '@store/budget-store';
import { AppDispatch } from '@store/store';
import { IncomeSheet } from '@widgets';

import { buildRecentActivity } from './dashboard.util';

import dangerPng from '../../assets/illustrations/tone-danger.png';
import infoPng from '../../assets/illustrations/tone-info.png';
import mutedPng from '../../assets/illustrations/tone-muted.png';
import startDayPng from '../../assets/illustrations/tone-start-day.png';
import successPng from '../../assets/illustrations/tone-success.png';
import warnPng from '../../assets/illustrations/tone-warn.png';

import './dashboard.styles.scss';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'budget', 'taxonomy', 'insights']);
  const fmtMoney = useFormatMoney(true);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { resolve } = useResolvedInsight();

  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);
  const totals = useSelector(selectTotals);
  const txns = useSelector(selectTxnsInPeriod);
  const context = useSelector(selectBudgetContextSemantics);
  const currency = useSelector(selectSettingsCurrency);
  const smartInsights = useSelector(selectSmartDashboardInsight) as Insight[];
  const [incomeOpen, setIncomeOpen] = useState(false);

  const isIncomeSet = !!doc?.income;
  const firstName = getFirstName(user?.displayName ?? '');
  const attention = useMemo(
    () => getBudgetContextAttention(context, smartInsights),
    [context, smartInsights],
  );
  const resolvedInsight = attention.insight ? resolve(attention.insight) : null;
  const contextCopy = getContextCopy(
    attention,
    context,
    t,
    resolvedInsight,
    i18n.language,
    doc?.startDay,
  );
  const heroAmount = formatHeroAmount(context.hero.amount, currency);
  const pulseRows = context.pulseRows;
  const recentActivity = useMemo(
    () =>
      buildRecentActivity(txns, (expenseGroup) => {
        const resolved = resolveExpenseGroup(expenseGroup);
        return String(t(resolved.i18nLabel));
      }),
    [t, txns],
  );

  const performContextAction = () => {
    if (attention.action === 'open-income') {
      setIncomeOpen(true);
      return;
    }

    if (attention.action === 'add-expenses') {
      navigate('/transactions/new');
      return;
    }

    if (attention.action === 'view-insights') {
      navigate(attention.insightPath ?? '/insights');
      return;
    }

    if (!user?.uuid) return;

    if (attention.action === 'go-current-period') {
      dispatch(changeMonthThunk({ uid: user.uuid, month: context.currentMonthKey }));
      return;
    }

    if (attention.action === 'prepare-next-period') {
      dispatch(changeMonthThunk({ uid: user.uuid, month: context.nextMonthKey }));
    }
  };

  return (
    <div className="dashboard-page dashboard-page--v3">
      <p className="dashboard-greeting">
        {t('budget:dashboard.greeting', {
          name: firstName || t('budget:dashboard.friend'),
        })}
      </p>

      {isIncomeSet ? (
        <section className="dashboard-hero" aria-labelledby="dashboard-balance-heading">
          <div className="dashboard-hero__primary">
            <h1 id="dashboard-balance-heading" className="dashboard-hero__amount">
              <span className="dashboard-hero__currency">{heroAmount.symbol}</span>
              <span>{heroAmount.value}</span>
            </h1>
            <p
              className={clsx('dashboard-hero__label', {
                'dashboard-hero__label--over': context.hero.tone === 'danger',
              })}
            >
              {t(context.hero.labelKey)}
            </p>
          </div>

          <div className="dashboard-hero__status-row">
            <span>{String(t(context.periodStatus.labelKey, context.periodStatus.vars ?? {}))}</span>
            <span
              className={clsx(
                'dashboard-hero__status-dot',
                `dashboard-hero__status-dot--${context.periodStatus.tone}`,
              )}
              aria-hidden
            />
          </div>

          <div className="dashboard-hero__meta-row">
            <span>
              {t('budget:dashboard.spentOf', {
                spent: fmtMoney(totals.totalSpent),
                budget: fmtMoney(totals.totalAllocated),
              })}
            </span>
            <button
              type="button"
              className="dashboard-hero__income-btn"
              onClick={() => setIncomeOpen(true)}
            >
              {t('budget:capture.incomeAction')}
            </button>
          </div>
        </section>
      ) : (
        <section className="dashboard-no-income" aria-labelledby="dashboard-no-income-title">
          <p className="dashboard-kicker">{t('budget:dashboard.setupKicker')}</p>
          <h1 id="dashboard-no-income-title">{t('budget:dashboard.noIncomeTitle')}</h1>
          <p>{t('budget:dashboard.noIncomeText')}</p>
          <V3Action variant="primary" size="md" onClick={() => setIncomeOpen(true)}>
            {t('budget:modals.addIncome')}
          </V3Action>
        </section>
      )}

      {contextCopy && (
        <section
          className={clsx('dashboard-context', `dashboard-context--${attention.tone}`)}
          aria-labelledby="dashboard-context-title"
        >
          <img
            className="dashboard-context__illustration"
            src={getAttentionIllustration(attention)}
            alt=""
            aria-hidden
          />
          <div className="dashboard-context__copy">
            {contextCopy.title && <h2 id="dashboard-context-title">{contextCopy.title}</h2>}
            <p>{contextCopy.message}</p>
            {contextCopy.subtext && <span>{contextCopy.subtext}</span>}
            {contextCopy.ctaLabel && attention.action !== 'none' && (
              <button type="button" className="dashboard-context__cta" onClick={performContextAction}>
                <span>{contextCopy.ctaLabel}</span>
                <TTIcon icon={FaChevronRight} size={12} color="currentColor" />
              </button>
            )}
          </div>
        </section>
      )}

      {isIncomeSet && (
        <section className="dashboard-section" aria-labelledby="dashboard-pulse-title">
          <h2 id="dashboard-pulse-title">{t('budget:dashboard.budgetPulse')}</h2>
          <div className="dashboard-pulse">
            {pulseRows.map((row) => (
              <NavLink
                key={row.key}
                to={`/categories/${row.key}`}
                className="dashboard-pulse__row"
                aria-label={String(t('budget:dashboard.pulseAria', {
                  category: t(`taxonomy:categoryNames.${row.key}`),
                  amount: fmtMoney(row.amount),
                  state: t(`budget:dashboard.pulseState.${row.amountState}`),
                  percent: row.percent,
                }))}
              >
                <div
                  className="dashboard-pulse__icon"
                  style={{ background: getCategoryColorVar(row.key) }}
                  aria-hidden
                >
                  <TTIcon icon={getCategoryIcon(row.key)} color="var(--color-text-inverse)" size={18} />
                </div>
                <div className="dashboard-pulse__main">
                  <div className="dashboard-pulse__topline">
                    <span>{t(`taxonomy:categoryNames.${row.key}`)}</span>
                    <strong
                      className={clsx({
                        'dashboard-pulse__amount--over': row.amountState === 'over',
                        'dashboard-pulse__amount--success':
                          row.amountState === 'goalReached' || row.amountState === 'aboveGoal',
                      })}
                    >
                      {t(`budget:dashboard.pulseAmount.${row.amountState}`, {
                        amount: fmtMoney(row.amount),
                      })}
                    </strong>
                    <em>{row.percent}%</em>
                  </div>
                  <div
                    className="dashboard-pulse__bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={Math.max(100, row.percent)}
                    aria-valuenow={row.percent}
                  >
                    <span
                      style={{
                        width: `${row.progress * 100}%`,
                        background: getCategoryColorVar(row.key),
                      }}
                    />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {recentActivity.length > 0 && (
        <section className="dashboard-section" aria-labelledby="dashboard-recent-title">
          <div className="dashboard-section__heading-row">
            <h2 id="dashboard-recent-title">{t('budget:dashboard.recentActivity')}</h2>
            <NavLink to="/transactions" className="dashboard-section__link">
              <span>{t('budget:dashboard.viewAllTransactions')}</span>
              <TTIcon icon={FaChevronRight} size={11} color="currentColor" />
            </NavLink>
          </div>
          <div className="dashboard-recent">
            {recentActivity.map((item) => {
              const expenseGroup = resolveExpenseGroup(item.expenseGroup);
              const dateLabel = item.dateLabelKey ? t(item.dateLabelKey) : item.dateFallback;

              return (
                <div className="dashboard-recent__row" key={item.id}>
                  <ExpenseGroupIcon expenseGroup={expenseGroup} />
                  <div className="dashboard-recent__copy">
                    <strong>{item.title}</strong>
                    <span>{t(expenseGroup.i18nLabel)}</span>
                  </div>
                  <div className="dashboard-recent__meta">
                    <strong>-{fmtMoney(item.amount)}</strong>
                    <span>{dateLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <IncomeSheet open={incomeOpen} onOpenChange={setIncomeOpen} />
    </div>
  );
};

function getFirstName(name: string | null) {
  if (!name) return '';
  return name.split(' ')[0];
}

function getCategoryIcon(category: Category) {
  return CATEGORY_ICONS[category];
}

function getAttentionIllustration(attention: BudgetContextAttention) {
  if (attention.illustration === 'start-day') return startDayPng;
  if (attention.illustration === 'danger') return dangerPng;
  if (attention.illustration === 'warn') return warnPng;
  if (attention.illustration === 'success') return successPng;
  if (attention.illustration === 'info') return infoPng;
  if (attention.illustration === 'period') return startDayPng;
  return mutedPng;
}

function getContextCopy(
  attention: BudgetContextAttention,
  context: BudgetContextSemantics,
  t: TFunction,
  resolvedInsight: { title?: string; message: string; subtext?: string; ctaLabel?: string } | null,
  language: string,
  startDay?: number,
) {
  if (attention.kind === 'smart-insight' && resolvedInsight) {
    return {
      title: resolvedInsight.title,
      message: resolvedInsight.message,
      subtext: resolvedInsight.subtext,
      ctaLabel: resolvedInsight.ctaLabel,
    };
  }

  if (!attention.titleKey || !attention.messageKey) return null;

  const vars = {
    periodRange: formatContextRange(context.periodStart, context.periodLastDay, language),
    startDate: formatContextDate(context.periodStart, language),
    lastTxnDate: context.lastTxnDate ? formatContextDate(context.lastTxnDate, language) : '',
    startDay: startDay ?? context.periodStart.getDate(),
  };

  return {
    title: String(t(attention.titleKey, vars)),
    message: String(t(attention.messageKey, vars)),
    ctaLabel: attention.ctaLabelKey ? String(t(attention.ctaLabelKey)) : undefined,
  };
}

function formatContextDate(date: Date, language: string) {
  return format(date, 'd MMM', { locale: language === 'ro' ? ro : enUS });
}

function formatContextRange(start: Date, end: Date, language: string) {
  const locale = language === 'ro' ? ro : enUS;
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${format(start, 'd MMM', { locale })} - ${format(end, 'd MMM yyyy', { locale })}`
    : `${format(start, 'd MMM yyyy', { locale })} - ${format(end, 'd MMM yyyy', { locale })}`;
}

function formatHeroAmount(amount: number, currency: string) {
  const value = amount.toLocaleString(currency === 'RON' ? 'ro-RO' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    symbol: currency === 'RON' ? 'RON' : '€',
    value,
  };
}

export default Dashboard;
