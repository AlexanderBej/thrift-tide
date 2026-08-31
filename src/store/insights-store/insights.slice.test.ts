import insightsReducer, { loadInsightsHistory } from './insights.slice';
import { listMonthsWithSummary } from '@api/services';

jest.mock('@api/services', () => ({
  listMonthsWithSummary: jest.fn(),
}));

const mockListMonthsWithSummary = listMonthsWithSummary as jest.MockedFunction<typeof listMonthsWithSummary>;

const makeItem = (id: string, withSummary = true) =>
  ({
    id,
    month: id,
    income: 1000,
    percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
    allocations: { needs: 500, wants: 300, savings: 200 },
    startDay: 1,
    periodStart: `${id}-01T00:00:00.000Z`,
    periodEnd: `${id}-28T00:00:00.000Z`,
    createdAt: null,
    updatedAt: null,
    summary: withSummary
      ? {
          totalSpent: 800,
          spent: { needs: 400, wants: 200, savings: 200 },
          totalTxns: 10,
          income: 1000,
          allocations: { needs: 500, wants: 300, savings: 200 },
          computedAt: `${id}-28T01:00:00.000Z`,
        }
      : undefined,
  }) as any;

describe('insights history loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('paginates closed months until six usable summaries are available', async () => {
    mockListMonthsWithSummary
      .mockResolvedValueOnce({
        items: [makeItem('2026-06', false), makeItem('2026-05'), makeItem('2026-04')],
        nextCursor: 'cursor-1',
      } as any)
      .mockResolvedValueOnce({
        items: [makeItem('2026-03'), makeItem('2026-02'), makeItem('2026-01'), makeItem('2025-12')],
        nextCursor: null,
      } as any);

    const dispatch = jest.fn();
    const result = await loadInsightsHistory({ uid: 'user-1' })(dispatch, (() => ({})) as any, undefined);

    expect(result.type).toBe('insights/loadHistory/fulfilled');
    expect(mockListMonthsWithSummary).toHaveBeenCalledTimes(2);
    expect(mockListMonthsWithSummary).toHaveBeenNthCalledWith(
      1,
      'user-1',
      expect.objectContaining({ pageSize: 12, pageAfterPeriodEnd: null }),
    );
    expect(mockListMonthsWithSummary).toHaveBeenNthCalledWith(
      2,
      'user-1',
      expect.objectContaining({ pageSize: 12, pageAfterPeriodEnd: 'cursor-1' }),
    );
    expect((result as any).payload.items).toHaveLength(7);
  });

  it('stores loaded rows without mutating History pagination state', () => {
    const next = insightsReducer(undefined, {
      type: loadInsightsHistory.fulfilled.type,
      payload: { items: [makeItem('2026-01')] },
    });

    expect(next.status).toBe('ready');
    expect(next.rows).toHaveLength(1);
  });
});
