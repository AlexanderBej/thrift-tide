import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from './firebase.service';
import { UserProfile } from '../models/user';
import { Theme } from '../../utils/theme.util';
import { Language } from '../types/settings.types';

export async function readUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertUserStartDay(uid: string, startDay: number) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: { needs: 50, wants: 30, savings: 20 },
      startDay,
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { startDay });
  }
}

export async function upsertAppLanguage(uid: string, language: Language) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: { needs: 50, wants: 30, savings: 20 },
      startDay: 25,
      language,
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { language });
  }
}

export async function upsertAppTheme(uid: string, theme: Theme) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: { needs: 50, wants: 30, savings: 20 },
      startDay: 25,
      language: 'en',
      theme,
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { theme });
  }
}
