import { cookies } from 'next/headers';
import type { User } from '@/lib/definitions';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized, but only once.
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const db = getFirestore();

const SESSION_COOKIE_NAME = 'e-commers-v-session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', sessionId));
    if (!userDoc.exists()) {
        return null;
    }
    return userDoc.data() as User;
  } catch (error) {
    console.error("Failed to fetch user session from Firestore:", error);
    return null;
  }
}

export async function setSession(userId: string) {
  cookies().set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
