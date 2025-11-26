'use server';

import { z } from 'zod';
import { setSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK for server-side actions
// Note: This is a simplified example. In production, you'd use a more secure way to initialize.
// We are using CLIENT SDK here because ADMIN SDK is not available in this environment.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid email or password.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    await setSession(user.uid);

    if (userData?.role === 'ADMIN') {
      redirect('/admin/dashboard');
    }

    redirect('/');
  } catch (error: any) {
    console.error('Login error:', error);
    // You can customize error messages based on error.code
    return {
      error: 'Invalid credentials. Please try again.',
    };
  }
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid registration details. Please check your inputs.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      name: name,
      email: email,
      role: email.toLowerCase() === 'admin@admin.com' ? 'ADMIN' : 'USER',
    });

    // Log the user in
    await setSession(user.uid);
    redirect('/');

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return { error: 'This email is already in use.' };
    }
    return { error: 'An error occurred during registration.' };
  }
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
