import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from './firebase.service';
import { OnboardingData, UserProfile } from '../models/user';
import { Currency, Language, Theme } from '../types/settings.types';
import { DEFAULT_PERCENTS, PercentTriple } from '../types/percent.types';

export async function readUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function completeOnboarding(uid: string, onboardingData: OnboardingData) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      // currency,
      defaultPercents: onboardingData.percents,
      startDay: onboardingData.startDay,
      language: onboardingData.language,
      onboardingCompleted: true,
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, {
      defaultPercents: onboardingData.percents,
      startDay: onboardingData.startDay,
      language: onboardingData.language,
      onboardingCompleted: true,
    });
  }
}

export async function upsertUserStartDay(uid: string, startDay: number) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: DEFAULT_PERCENTS,
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
      defaultPercents: DEFAULT_PERCENTS,
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
      defaultPercents: DEFAULT_PERCENTS,
      startDay: 25,
      language: 'en',
      theme,
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { theme });
  }
}

export async function upsertDefaultPercents(uid: string, percents: PercentTriple) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency: 'EUR',
      defaultPercents: percents,
      startDay: 25,
      language: 'en',
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { defaultPercents: percents });
  }
}

export async function upsertCurrency(uid: string, currency: Currency) {
  const ref = doc(db, 'users', uid);
  // If the doc doesn't exist, create minimum viable profile
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: Partial<UserProfile> = {
      createdAt: new Date(),
      currency,
      defaultPercents: DEFAULT_PERCENTS,
      startDay: 25,
      language: 'en',
    };
    await setDoc(ref, payload, { merge: true });
  } else {
    await updateDoc(ref, { currency });
  }
}
