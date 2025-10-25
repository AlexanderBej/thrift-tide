import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase.service';
import { MonthDoc } from '../models/month-doc';
import { DEFAULT_PERCENTS } from '../types/percent.types';
import { makeAllocations, toMonthDoc } from '../../utils/services.util';
import { Txn } from '../models/txn';

const monthDocRef = (uid: string, month: string) => doc(db, 'users', uid, 'months', month);

const txnsColRef = (uid: string, month: string) =>
  collection(db, 'users', uid, 'months', month, 'transactions');

/** Create or update the month doc with income/percents; allocations auto-computed. */
export const upsertMonth = async (
  uid: string,
  month: string,
  data: Partial<Pick<MonthDoc, 'income' | 'percents'>>,
): Promise<MonthDoc> => {
  const ref = doc(db, 'users', uid, 'months', month);
  const prev = await getDoc(ref);

  const income = data.income ?? (prev.exists() ? prev.data().income : 0);
  const percents = data.percents ?? (prev.exists() ? prev.data().percents : DEFAULT_PERCENTS);

  await setDoc(
    ref,
    {
      month,
      income,
      percents,
      allocations: makeAllocations(income, percents),
      createdAt: prev.exists() ? prev.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Failed to read month after upsert');
  return toMonthDoc(snap.data());
};

/** Read a month doc */
export const readMonth = async (uid: string, month: string): Promise<MonthDoc | null> => {
  const ref = doc(db, 'users', uid, 'months', month);
  const snap = await getDoc(ref);
  return snap.exists() ? toMonthDoc(snap.data()) : null;
};

/** Add a transaction to a month */
export const addTransaction = async (uid: string, month: string, txn: Omit<Txn, 'id'>) => {
  const ref = await addDoc(txnsColRef(uid, month), txn);
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
