import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableMultiTabIndexedDbPersistence, getFirestore } from 'firebase/firestore';

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
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  // Fallback: disable persistence (still works online)
  console.warn('Persistence disabled:', err?.code || err);
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
