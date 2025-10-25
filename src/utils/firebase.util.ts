// src/firebase.ts
// Firebase setup + auth helpers + month-based Firestore utilities
// for a 50/30/20 budgeting app (CRA + TypeScript)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  type Query,
} from 'firebase/firestore';

/** ──────────────────────────────────────────────────────────────
 * Firebase Config (CRA: REACT_APP_* envs)
 * Add these to your .env file in project root.
 * REACT_APP_GOOGLE_API_KEY must already exist in your current setup.
 * ────────────────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY!,
  authDomain: 'thrift-tide.firebaseapp.com',
  projectId: 'thrift-tide',
  storageBucket: 'thrift-tide.appspot.com',
  messagingSenderId: '897670610568',
  appId: '1:897670610568:web:7f667a9d658071472d693d',
};

// App + Services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let unsubscribeTxns: (() => void) | null = null;
// Optional: offline cache (ignore if multi-tab error)
enableIndexedDbPersistence(db).catch(() => {});

/** ──────────────────────────────────────────────────────────────
 * Auth: Google + Email/Password
 * ────────────────────────────────────────────────────────────── */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

export const createAuthUserWithEmailAndPassword = (email: string, password: string) => {
  if (!email || !password) return Promise.reject(new Error('Missing credentials'));
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = (email: string, password: string) => {
  if (!email || !password) return Promise.reject(new Error('Missing credentials'));
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => signOut(auth);
export const onAuthStateChangedListener = (cb: (u: User | null) => void) =>
  onAuthStateChanged(auth, cb);

/** ──────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────── */
export type PercentTriple = { needs: number; wants: number; savings: number }; // 0..1 each

export type TransactionType = 'need' | 'want' | 'saving';

export type MonthDoc = {
  month: string;
  income: number;
  percents: { needs: number; wants: number; savings: number };
  allocations: { needs: number; wants: number; savings: number };
  createdAt: number | null; // millis
  updatedAt: number | null; // millis
};

export type Txn = {
  id?: string;
  date: string; // ISO 'YYYY-MM-DD'
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
};

export type UserProfile = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Date;
  currency?: string; // 'USD' | 'EUR' | ...
  defaultPercents?: PercentTriple;
};

/** ──────────────────────────────────────────────────────────────
 * 50/30/20 helpers
 * ────────────────────────────────────────────────────────────── */
export const DEFAULT_PERCENTS: PercentTriple = { needs: 0.5, wants: 0.3, savings: 0.2 };

export const makeAllocations = (income: number, p: PercentTriple) => ({
  needs: Math.round(income * p.needs * 100) / 100,
  wants: Math.round(income * p.wants * 100) / 100,
  savings: Math.round(income * p.savings * 100) / 100,
});

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** ──────────────────────────────────────────────────────────────
 * User profile document (minimal)
 * Path: users/{uid}
 * ────────────────────────────────────────────────────────────── */
export const ensureUserProfile = async (userAuth: User, overrides: Partial<UserProfile> = {}) => {
  if (!userAuth) return;

  const ref = doc(db, 'users', userAuth.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const payload: UserProfile = {
      displayName: userAuth.displayName,
      email: userAuth.email,
      photoURL: userAuth.photoURL,
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: DEFAULT_PERCENTS,
      ...overrides,
    };
    await setDoc(ref, payload);
  }

  return ref;
};

/** ──────────────────────────────────────────────────────────────
 * Month-based budgeting data
 * Paths:
 *  - users/{uid}/months/{YYYY-MM}
 *  - users/{uid}/months/{YYYY-MM}/transactions/{txnId}
 * ────────────────────────────────────────────────────────────── */
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

////////////// HELPERS ////////////////////////////

const toMillis = (ts: any) => (ts && typeof ts.toMillis === 'function' ? ts.toMillis() : null);

const toMonthDoc = (data: any): MonthDoc => ({
  month: data.month,
  income: data.income,
  percents: data.percents,
  allocations: data.allocations,
  createdAt: toMillis(data.createdAt),
  updatedAt: toMillis(data.updatedAt),
});

export function stopTxnsListener() {
  if (unsubscribeTxns) {
    unsubscribeTxns();
    unsubscribeTxns = null;
  }
}

export function startTxnsListener(newUnsub: () => void) {
  stopTxnsListener();
  unsubscribeTxns = newUnsub;
}
