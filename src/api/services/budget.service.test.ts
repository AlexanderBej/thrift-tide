const mockCollection = jest.fn((..._args: any[]) => ({ path: 'months' }));
const mockGetDocs = jest.fn();
const mockLimit = jest.fn((count: number) => ({ type: 'limit', count }));
const mockOrderBy = jest.fn((field: string, direction: string) => ({ type: 'orderBy', field, direction }));
const mockQuery = jest.fn((base: unknown, ...constraints: unknown[]) => ({ base, constraints }));
const mockStartAfter = jest.fn((cursor: string) => ({ type: 'startAfter', cursor }));
const mockWhere = jest.fn((field: string, op: string, value: string) => ({ type: 'where', field, op, value }));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: (...args: any[]) => mockCollection(...args),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: (queryArg: unknown) => mockGetDocs(queryArg),
  limit: (count: number) => mockLimit(count),
  onSnapshot: jest.fn(),
  orderBy: (field: string, direction: string) => mockOrderBy(field, direction),
  query: (base: unknown, ...constraints: unknown[]) => mockQuery(base, ...constraints),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
  startAfter: (cursor: string) => mockStartAfter(cursor),
  updateDoc: jest.fn(),
  where: (field: string, op: string, value: string) => mockWhere(field, op, value),
  writeBatch: jest.fn(),
}));

jest.mock('./firebase.service', () => ({
  db: { id: 'db' },
}));

jest.mock('./auth.service', () => ({
  readUser: jest.fn(),
}));

import { listMonthsWithSummary } from './budget.service';

describe('budget history service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: '2026-02',
          data: () => ({
            month: '2026-02',
            income: 2400,
            percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
            allocations: { needs: 1200, wants: 720, savings: 480 },
            startDay: 25,
            periodStart: '2026-01-25T00:00:00.000Z',
            periodEnd: '2026-02-25T00:00:00.000Z',
            createdAt: null,
            updatedAt: null,
            summary: {
              totalSpent: 100,
              spent: { needs: 50, wants: 25, savings: 25 },
              totalTxns: 3,
              income: 2400,
              allocations: { needs: 1200, wants: 720, savings: 480 },
              computedAt: '2026-02-25T01:00:00.000Z',
            },
          }),
        },
      ],
    });
  });

  it('loads closed history periods newest first and returns a periodEnd cursor', async () => {
    const result = await listMonthsWithSummary('user-1', {
      closedBeforeISO: '2026-03-01T00:00:00.000Z',
      pageSize: 12,
    });

    expect(mockWhere).toHaveBeenCalledWith('periodEnd', '<=', '2026-03-01T00:00:00.000Z');
    expect(mockOrderBy).toHaveBeenCalledWith('periodEnd', 'desc');
    expect(mockLimit).toHaveBeenCalledWith(12);
    expect(result.nextCursor).toBe('2026-02-25T00:00:00.000Z');
    expect(result.items[0]).toMatchObject({
      id: '2026-02',
      periodEnd: '2026-02-25T00:00:00.000Z',
    });
  });

  it('uses the closed-period cursor for pagination', async () => {
    await listMonthsWithSummary('user-1', {
      closedBeforeISO: '2026-03-01T00:00:00.000Z',
      pageAfterPeriodEnd: '2026-02-25T00:00:00.000Z',
    });

    expect(mockStartAfter).toHaveBeenCalledWith('2026-02-25T00:00:00.000Z');
  });
});
