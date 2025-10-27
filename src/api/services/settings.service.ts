import { db } from './firebase.service';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../models/user';

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
