import { Insight } from '@api/models';

import { buildRecentActivity, getDashboardInsightPath } from './dashboard.util';

describe('dashboard v3 display helpers', () => {
  it('orders recent activity by date and prefers note over expense group', () => {
    const activity = buildRecentActivity(
      [
        { id: 'old', date: '2026-08-27', amount: 12, category: 'wants', expenseGroup: 'dining' },
        {
          id: 'new',
          date: '2026-08-29',
          amount: 32.8,
          category: 'needs',
          expenseGroup: 'groceries',
          note: 'Lidl',
        },
        { id: 'mid', date: '2026-08-28', amount: 14.5, category: 'wants', expenseGroup: 'dining' },
      ],
      (value) => (value === 'groceries' ? 'Groceries' : 'Dining'),
      new Date(2026, 7, 29),
    );

    expect(activity.map((item) => item.id)).toEqual(['new', 'mid', 'old']);
    expect(activity[0].title).toBe('Lidl');
    expect(activity[1].title).toBe('Dining');
    expect(activity[0].dateLabelKey).toBe('common:dates.today');
    expect(activity[1].dateLabelKey).toBe('common:dates.yesterday');
  });

  it('routes Dashboard add-expense insights directly to Capture V3', () => {
    const insight: Insight = {
      id: 'fresh_start',
      tone: 'info',
      message: 'smart.message.noSpendEarly',
      ctaTarget: 'transactions',
    };

    expect(getDashboardInsightPath(insight)).toBe('/transactions/new');
  });
});
