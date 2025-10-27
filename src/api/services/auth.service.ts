import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase.service';
import { UserProfile } from '../models/user';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_PERCENTS } from '../types/percent.types';
import { DEFAULT_START_DAY } from '../models/month-doc';

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
      startDay: overrides.startDay ?? DEFAULT_START_DAY,
      ...overrides,
    };
    await setDoc(ref, payload);
  }

  return ref;
};
