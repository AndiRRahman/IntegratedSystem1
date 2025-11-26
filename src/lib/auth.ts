import { cookies } from 'next/headers';
import { users } from '@/lib/data';
import type { User } from '@/lib/definitions';

const SESSION_COOKIE_NAME = 'e-commers-v-session';

export async function getSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const user = users.find(u => u.id === sessionId);

  if (!user) {
    return null;
  }
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
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
