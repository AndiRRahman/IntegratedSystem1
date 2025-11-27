
'use server';

import { z } from 'zod';
import { setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, connectFirestoreEmulator, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { CartItem } from './definitions';

// Initialize Firebase for SERVER-SIDE actions
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if in development
// IMPORTANT: This block now ensures it only attempts to connect ONCE.
if (process.env.NODE_ENV === 'development') {
  try {
    // @ts-ignore - _isInitialized is an internal flag to check connection status
    if (!auth.__emulator) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      // @ts-ignore
      auth.__emulator = true;
    }
    // @ts-ignore - _settingsFrozen is an internal property
    if (!db._settingsFrozen) {
       connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
  } catch (e: any) {
    // This can happen on hot-reloads, it's safe to ignore if it's about being already connected.
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
    
    // @ts-ignore - role is a custom claim we add
    const finalUser = { uid: user.uid, role: userData?.role, name: userData?.name, email: userData?.email };

    await setSession(finalUser);

    // No need to redirect from here, the login page will handle it
    // The redirect in the component is more reliable as it's client-side navigation
    // after the state has been set.

  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return { error: 'Invalid credentials. Please try again.' };
    }
    return {
      error: 'An unexpected error occurred. Please try again.',
    };
  }
  // The redirect will be handled by the client-side page after the session is set
  // and the useUser hook updates.
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

    // Check if the email is the special admin email
    const isAdmin = email.toLowerCase() === 'admin@admin.com';

    const batch = writeBatch(db);

    // 1. Create the user document in the 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    const userData = {
      id: user.uid,
      name: name,
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: serverTimestamp(),
    };
    batch.set(userDocRef, userData);

    // 2. If they are an admin, create a corresponding document in 'roles_admin'
    // This is crucial for Firestore Security Rules to work correctly for admins.
    if (isAdmin) {
      const adminRoleRef = doc(db, 'roles_admin', user.uid);
      batch.set(adminRoleRef, { active: true });
    }
    
    // Commit both writes at the same time
    await batch.commit();
    
    // Prepare user object for the session
    const finalUser = { uid: user.uid, role: userData.role, name: userData.name, email: userData.email };

    // Set the session cookie
    await setSession(finalUser);
    
    // Redirect after successful registration and session creation
    if (isAdmin) {
      redirect('/admin/dashboard');
    } else {
      redirect('/');
    }

  } catch (error: any) {
    console.error('Registration error:', error.code, error.message);
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
    
    // Here you would also update stock quantities
    // For each item in cartItems:
    // const productRef = doc(db, "products", item.product.id);
    // batch.update(productRef, { stock: increment(-item.quantity) });
    
    await batch.commit();
    
    return { success: true, orderId: newOrderRef.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
