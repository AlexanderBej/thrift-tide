import { selectHistoryArchiveRows, selectHistoryDocsWithPercentsAndSummary } from './history.selectors';

const makeRow = (id: string, withSummary = true) => ({
  id,
  month: id,
  income: 2400,
  percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
  allocations: { needs: 1200, wants: 720, savings: 480 },
  startDay: 25,
  periodStart: '2026-01-25T00:00:00.000Z',
  periodEnd: '2026-02-25T00:00:00.000Z',
  createdAt: null,
  updatedAt: null,
  summary: withSummary
    ? {
        totalSpent: 100,
        spent: { needs: 50, wants: 25, savings: 25 },
        totalTxns: 3,
        income: 2400,
        allocations: { needs: 1200, wants: 720, savings: 480 },
        computedAt: '2026-02-25T01:00:00.000Z',
      }
    : undefined,
});

describe('history selectors', () => {
  it('keeps closed archive rows visible even when summary is missing', () => {
    const state = {
      history: {
        rows: [makeRow('2026-02'), makeRow('2026-01', false)],
      },
    } as any;

    expect(selectHistoryArchiveRows(state)).toHaveLength(2);
    expect(selectHistoryArchiveRows(state)[1]).toMatchObject({
      id: '2026-01',
      periodStart: '2026-01-25T00:00:00.000Z',
      periodEnd: '2026-02-25T00:00:00.000Z',
      summary: undefined,
    });
  });

  it('preserves the summary-only selector for existing historical insight consumers', () => {
    const state = {
      history: {
        rows: [makeRow('2026-02'), makeRow('2026-01', false)],
      },
    } as any;

    expect(selectHistoryDocsWithPercentsAndSummary(state)).toHaveLength(1);
    expect(selectHistoryDocsWithPercentsAndSummary(state)[0]).toMatchObject({
      id: '2026-02',
      periodStart: '2026-01-25T00:00:00.000Z',
      periodEnd: '2026-02-25T00:00:00.000Z',
    });
  });
});
