import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Category, CategoryType } from '@api/types';
import { resolveExpenseGroup } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';
import { EmblaCarousel } from '@shared/ui';
import {
  makeSelectCategoryPanel,
  selectSmartDashboardInsight,
  selectTopExpenseGroupsOverall,
} from '@store/budget-store';
import { ExpenseGroupName, ProgressBar } from '@shared/components';
import { Insight } from '@api/models';
import { HealthInsight, SmartInsightCard } from 'features';
import { selectSettingsAppTheme } from '@store/settings-store';

import './insights.styles.scss';

const Insights: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'taxonomy']);
  const fmt = useFormatMoney();

  const selectPanelNeeds = useMemo(() => makeSelectCategoryPanel(CategoryType.NEEDS), []);
  const selectPanelWants = useMemo(() => makeSelectCategoryPanel(CategoryType.WANTS), []);
  const selectPanelSavings = useMemo(() => makeSelectCategoryPanel(CategoryType.SAVINGS), []);
  const categoryPanelNeeds = useSelector(selectPanelNeeds);
  const categoryPanelWants = useSelector(selectPanelWants);
  const categoryPanelSavings = useSelector(selectPanelSavings);
  const topExpenseGroups = useSelector(selectTopExpenseGroupsOverall);
  const smartInsights = useSelector(selectSmartDashboardInsight) as Insight[];
  const theme = useSelector(selectSettingsAppTheme);

  const getCategoryProgress = (cat: Category, egTotal: number) => {
    const categoryPanel =
      cat === 'needs'
        ? categoryPanelNeeds
        : cat === 'wants'
          ? categoryPanelWants
          : categoryPanelSavings;
    return egTotal / categoryPanel.alloc;
  };

  const builtTranslatedPerc = (eg: { expGroup: string; category: Category; total: number }) => {
    const word = i18n.language === 'ro' ? 'din' : 'of';
    const percent = Number(getCategoryProgress(eg.category, eg.total) * 100).toFixed(0);

    return `${percent}% ${word} ${t(`taxonomy:categoryNames.${eg.category}`)}`;
  };

  return (
    <div className="insights-page">
      <EmblaCarousel showDots>
        {smartInsights.map((insight) => (
          <SmartInsightCard key={insight.id} insight={insight} />
        ))}
      </EmblaCarousel>

      <section className="tt-section">
        <h3 className="tt-section-header">{t('pageContent.insights.categoryHealth')}</h3>
        {[CategoryType.NEEDS, CategoryType.WANTS, CategoryType.SAVINGS].map((cat, index) => (
          <div className="health-wrapper" key={index}>
            <HealthInsight category={cat} />
          </div>
        ))}
      </section>

      {topExpenseGroups && topExpenseGroups.length > 0 && (
        <section className="tt-section">
          <h3 className="tt-section-header">{t('pageContent.insights.spending')}</h3>
          <ul className={clsx(`top-spenders-list top-spenders-list__${theme}`)}>
            {topExpenseGroups.map((eg, index) => {
              const fullEG = resolveExpenseGroup(eg.expGroup);

              return (
                <li className="top-spender" key={index}>
                  <div className="spender-row">
                    <ExpenseGroupName expenseGroup={fullEG} />
                    <strong>{fmt(eg.total)}</strong>
                  </div>
                  <div className="spender-bar">
                    <ProgressBar
                      progress={getCategoryProgress(eg.category, eg.total)}
                      color={fullEG.color}
                    />
                    <span className="spender-percent">{builtTranslatedPerc(eg)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Insights;
