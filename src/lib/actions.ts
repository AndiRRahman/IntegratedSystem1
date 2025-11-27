
'use server';

import { z } from 'zod';
import { setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, connectFirestoreEmulator, collection, addDoc, serverTimestamp, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { CartItem } from './definitions';

// Initialize Firebase for SERVER-SIDE actions
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  try {
    // @ts-ignore - _isInitialized is an internal flag
    if (!auth._isInitialized) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    }
    // @ts-ignore - _settingsFrozen is an internal property
    if (!db._settingsFrozen) {
       connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
  } catch (e: any) {
    // Emulator may already be connected
    if (!e.message.includes('already connected')) {
        console.error("Failed to connect server actions to emulator:", e);
    }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    // @ts-ignore
    const finalUser = { ...user, role: userData?.role, name: userData?.name, email: userData?.email };

    await setSession(finalUser);

    if (userData?.role === 'ADMIN') {
      redirect('/admin/dashboard');
    }

    redirect('/');
  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
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
      const firstError = validatedFields.error.errors[0].message;
      return { error: firstError || 'Invalid registration details.' };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const isAdmin = email.toLowerCase() === 'admin@admin.com';

    const batch = writeBatch(db);

    const userDocRef = doc(db, 'users', user.uid);
    const userData = {
      id: user.uid,
      name: name,
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: serverTimestamp(),
    };
    batch.set(userDocRef, userData);

    if (isAdmin) {
      const adminRoleRef = doc(db, 'roles_admin', user.uid);
      batch.set(adminRoleRef, { active: true });
    }
    
    await batch.commit();
    
    // @ts-ignore
    const finalUser = { ...user, role: userData.role, name: userData.name, email: userData.email };

    await setSession(finalUser);
    redirect('/');

  } catch (error: any) {
    console.error('Registration error:', error.code);
    if (error.code === 'auth/email-already-in-use') {
      return { error: 'This email is already registered.' };
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
    const batch = writeBatch(db);

    const newOrderRef = doc(collection(db, "orders"));

    const newOrderData = {
      id: newOrderRef.id,
      userId: session.id,
      customerName: session.name, 
      customerEmail: session.email, 
      shippingAddress: "123 Main St, Demo City", // Mock address
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        product: { // denormalize product info for display
            name: item.product.name,
            imageUrl: item.product.imageUrl
        }
      })),
      total: totalAmount,
      status: 'Pending',
      orderDate: serverTimestamp(),
    };

    batch.set(newOrderRef, newOrderData);
    
    await batch.commit();
    
    return { success: true, orderId: newOrderRef.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
