'use server';

import { z } from 'zod';
import { setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, connectFirestoreEmulator, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { CartItem } from './definitions';

// Initialize Firebase Admin SDK for server-side actions
// Note: This is a simplified example. In production, you'd use a more secure way to initialize.
// We are using CLIENT SDK here because ADMIN SDK is not available in this environment.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.NODE_ENV === 'development') {
  if (!auth.emulatorConfig) {
     connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  
  // @ts-ignore
  if (!db._settingsFrozen) {
     connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
}

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
    const isAdmin = email.toLowerCase() === 'admin@admin.com';

    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      name: name,
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
    });

    // If admin, create a role document for security rules
    if (isAdmin) {
      await setDoc(doc(db, 'roles_admin', user.uid), {
        created: new Date().toISOString(),
      });
    }

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

export async function createOrder(cartItems: CartItem[], totalAmount: number) {
  const session = await getSession();

  if (!session) {
    return { error: "You must be logged in to place an order." };
  }

  if (cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  try {
    const newOrder = {
      userId: session.id,
      customerName: session.name, 
      customerEmail: session.email, 
      shippingAddress: "123 Main St, Demo City",
      items: cartItems,
      total: totalAmount,
      status: 'Pending',
      orderDate: new Date().toISOString(),
    };

    const userOrdersRef = collection(db, "users", session.id, "orders");
    await addDoc(userOrdersRef, newOrder);
    const globalOrdersRef = collection(db, "orders");
    await addDoc(globalOrdersRef, newOrder);

    return { success: true };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
