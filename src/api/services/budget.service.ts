import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase.service';
import { DEFAULT_START_DAY, MonthDoc } from '../models/month-doc';
import { DEFAULT_PERCENTS } from '../types/percent.types';
import { makeAllocations, toMonthDoc } from '../../utils/services.util';
import { Txn } from '../models/txn';
import { periodBounds, representativeDateFromMonthKey } from '../../utils/period.util';
import { toYMDUTC } from '../../utils/format-data.util';
import { readUser } from './auth.service';

const getMonthRef = (uid: string, month: string) => doc(db, 'users', uid, 'months', month);

const txnsColRef = (uid: string, month: string) =>
  collection(db, 'users', uid, 'months', month, 'transactions');

export async function createOrUpdateMonth(
  uid: string,
  month: string,
  data: Partial<Pick<MonthDoc, 'income' | 'percents' | 'startDay'>>,
): Promise<MonthDoc> {
  const existing = await readMonth(uid, month);
  return existing ? updateMonth(uid, month, data) : createMonth(uid, month, data);
}

export async function createMonth(
  uid: string,
  month: string,
  data: Partial<Pick<MonthDoc, 'income' | 'percents' | 'startDay'>>,
): Promise<MonthDoc> {
  const ref = getMonthRef(uid, month);
  const existing = await readMonth(uid, month);
  if (existing) throw new Error(`Month ${month} already exists`);

  const user = await readUser(uid);

  const startDay = data.startDay ?? user?.startDay ?? DEFAULT_START_DAY;

  const income = data.income ?? 0;
  const percents = data.percents ?? user?.defaultPercents ?? DEFAULT_PERCENTS;

  const { start, end } = periodBounds(representativeDateFromMonthKey(month, startDay), startDay);

  await setDoc(ref, {
    month,
    income,
    percents,
    allocations: makeAllocations(income, percents),
    startDay, // freeze per-period
    periodStart: start.toISOString(), // freeze per-period
    periodEnd: end.toISOString(), // freeze per-period

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const fresh = await getDoc(ref);
  if (!fresh.exists()) throw new Error('Failed to read month after create');
  return fresh.data() as MonthDoc;
}

// --- UPDATE (fails if missing). Only updates current doc fields. ---
export async function updateMonth(
  uid: string,
  month: string,
  data: Partial<Pick<MonthDoc, 'income' | 'percents'>>,
): Promise<MonthDoc> {
  const ref = getMonthRef(uid, month);
  const prev = await readMonth(uid, month);
  if (!prev) throw new Error(`Month ${month} does not exist`);

  const income = data.income ?? prev.income;
  const percents = data.percents ?? prev.percents;

  await setDoc(
    ref,
    {
      income,
      percents,
      allocations: makeAllocations(income, percents),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Failed to read month after update');
  return toMonthDoc(snap.data());
}

/** Read a month doc */
export const readMonth = async (uid: string, month: string): Promise<MonthDoc | null> => {
  const ref = doc(db, 'users', uid, 'months', month);
  const snap = await getDoc(ref);
  return snap.exists() ? toMonthDoc(snap.data()) : null;
};

/** Add a transaction to a month */
export const addTransaction = async (uid: string, month: string, txn: Omit<Txn, 'id'>) => {
  const payload = normalizeTxnForWrite(txn);
  const ref = await addDoc(txnsColRef(uid, month), payload);

  return ref.id;
};

/** Get a live query for transactions (most recent first) */
export const transactionsQuery = (uid: string, month: string): Query =>
  query(txnsColRef(uid, month), orderBy('date', 'desc'));

/** Subscribe to transactions list updates */
export const onTransactionsSnapshot = (uid: string, month: string, cb: (txns: Txn[]) => void) => {
  const q = transactionsQuery(uid, month);
  return onSnapshot(q, (qs) => {
    cb(qs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Txn, 'id'>) })));
  });
};

export const updateTransaction = async (
  uid: string,
  month: string,
  id: string,
  patch: Partial<Omit<Txn, 'id'>>,
) => {
  const next: any = { ...patch };
  if (patch.date != null) {
    next.date = toYMDUTC(
      typeof (patch as any).date?.toDate === 'function'
        ? (patch as any).date.toDate()
        : (patch as any).date,
    );
  }
  const ref = doc(db, 'users', uid, 'months', month, 'transactions', id);
  await updateDoc(ref, next as any);
};

export const deleteTransaction = async (uid: string, month: string, id: string) => {
  const ref = doc(db, 'users', uid, 'months', month, 'transactions', id);
  await deleteDoc(ref);
};

export function computeMonthSummary(doc: MonthDoc, txns: Txn[]) {
  let needs = 0,
    wants = 0,
    savings = 0;
  for (const t of txns) {
    if (t.type === 'needs') needs += t.amount;
    else if (t.type === 'wants') wants += t.amount;
    else if (t.type === 'savings') savings += t.amount;
  }
  const totalSpent = needs + wants + savings;

  return {
    totalSpent,
    spent: { needs, wants, savings },
    totalTxns: txns.length,
    income: doc.income,
    allocations: doc.allocations,
    computedAt: new Date().toISOString(),
  } as MonthDoc['summary'];
}

export async function persistMonthSummary(
  uid: string,
  monthKey: string,
  summary: MonthDoc['summary'],
) {
  const ref = doc(db, 'users', uid, 'months', monthKey);
  await updateDoc(ref, { summary });
}

export async function listMonthsWithSummary(
  uid: string,
  opts: {
    fromISO?: string;
    toISO?: string;
    pageSize?: number;
    pageAfter?: DocumentData | null;
  } = {},
) {
  const col = collection(db, 'users', uid, 'months');
  let q = query(col, orderBy('periodStart', 'asc'));

  if (opts.fromISO) q = query(q, where('periodStart', '>=', opts.fromISO));
  if (opts.toISO) q = query(q, where('periodStart', '<', opts.toISO));
  if (opts.pageAfter) q = query(q, startAfter(opts.pageAfter));
  q = query(q, limit(opts.pageSize ?? 12));

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as MonthDoc), _cursor: d }));
  return { items, nextCursor: snap.docs.length ? snap.docs[snap.docs.length - 1] : null };
}

// Ensure any outgoing Txn has canonical date
function normalizeTxnForWrite(txn: Omit<Txn, 'id'>): Omit<Txn, 'id'> {
  return {
    ...txn,
    // IMPORTANT: assume `txn.date` could be Date|string|number|Timestamp
    date: toYMDUTC(
      typeof (txn as any).date?.toDate === 'function'
        ? (txn as any).date.toDate()
        : (txn as any).date,
    ),
  };
}

// Ensure any incoming doc gets `date` as 'YYYY-MM-DD' string
function normalizeTxnFromFirestore(raw: any): Txn {
  const r = { id: raw.id, ...raw } as Txn;
  const src = (raw as any).date;
  const asDate =
    typeof src?.toDate === 'function' ? src.toDate() : src instanceof Date ? src : new Date(src);
  return { ...r, date: toYMDUTC(asDate) };
}
