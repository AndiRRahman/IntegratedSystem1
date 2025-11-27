
import { cookies } from 'next/headers';
import type { User } from '@/lib/definitions';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'a-very-secret-and-secure-key-for-dev');
const SESSION_COOKIE_NAME = 'e-commers-v-session';

export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ['HS256'],
    });
    return payload as User;
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}

export async function setSession(user: Omit<User, 'id'> & { uid: string }) {
  const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionPayload = {
      id: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  cookies().set(SESSION_COOKIE_NAME, token, {
    expires: expirationTime,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearSession() {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}
