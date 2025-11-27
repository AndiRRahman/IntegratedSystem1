
'use server';

import { z } from 'zod';
import { setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, connectFirestoreEmulator, collection, addDoc, serverTimestamp, writeBatch, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from '@/firebase/config';
import type { CartItem, Product } from './definitions';

// Initialize Firebase for SERVER-SIDE actions
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


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
    // @ts-ignore - _isInitialized is an internal flag to check connection status
    if (!storage.host.includes('localhost')) {
       connectStorageEmulator(storage, "127.0.0.1", 9199);
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
    
    // @ts-ignore
    if (finalUser.role === 'ADMIN') {
        redirect('/admin/dashboard');
    } else {
        redirect('/');
    }

  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return { error: 'Invalid credentials. Please try again.' };
    }
    return {
      error: 'An unexpected error occurred. Please try again.',
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
    
    const finalUser = { uid: user.uid, role: userData.role, name: userData.name, email: userData.email };

    await setSession(finalUser);
    
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
    
    await batch.commit();
    
    return { success: true, orderId: newOrderRef.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}

export async function upsertProduct(productData: Partial<Product>) {
  const session = await getSession();
  // @ts-ignore
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  try {
    if (productData.id) {
      // Update existing product
      const productRef = doc(db, 'products', productData.id);
      await updateDoc(productRef, productData);
      return { success: true, id: productData.id };
    } else {
      // Create new product
      const newProductRef = doc(collection(db, 'products'));
      const newProduct = {
        ...productData,
        id: newProductRef.id,
        createdAt: serverTimestamp(),
      };
      await setDoc(newProductRef, newProduct);
      return { success: true, id: newProductRef.id };
    }
  } catch (error) {
    console.error('Error upserting product:', error);
    return { error: 'Failed to save product.' };
  }
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided.' };
  }
  
  const session = await getSession();
  if (!session) {
      return { error: 'Unauthorized' };
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    const storageRef = ref(storage, `product-images/${fileName}`);

    await uploadBytes(storageRef, fileBuffer, {
        contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Image upload error:', error);
    return { error: 'Failed to upload image.' };
  }
}

    
