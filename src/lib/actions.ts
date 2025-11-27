
'use server';

import { z } from 'zod';
import { setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin'; // Hanya gunakan Admin SDK di server
import type { CartItem, Product } from './definitions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth as getClientAuth, signInWithEmailAndPassword } from 'firebase/auth';


// Helper untuk inisialisasi Client SDK di dalam Server Action jika diperlukan (HANYA untuk login)
// Ini adalah kasus khusus karena Admin SDK tidak punya cara untuk memvalidasi password secara langsung.
function initializeClientSdk() {
  if (getApps().some(app => app.name === 'client-sdk-in-server')) {
    return getApp('client-sdk-in-server');
  }
  return initializeApp(firebaseConfig, 'client-sdk-in-server');
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
    return { error: 'Invalid email or password.' };
  }

  const { email, password } = validatedFields.data;

  try {
    // 1. Inisialisasi Client SDK khusus untuk tindakan ini
    const clientApp = initializeClientSdk();
    const clientAuth = getClientAuth(clientApp);

    // 2. Autentikasi dengan Client SDK untuk memvalidasi password
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // 3. Gunakan Admin SDK untuk mendapatkan data lengkap dan peran dari Firestore
    const userDocRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new Error('User data not found in Firestore.');
    }
    const userData = userDoc.data();

    // 4. Buat sesi dengan data yang diverifikasi
    const finalUser = {
      uid: user.uid,
      role: userData?.role || 'USER',
      name: userData?.name || 'User',
      email: userData?.email || user.email,
    };
    await setSession(finalUser);

    // 5. Redirect dari Server Action
    if (finalUser.role === 'ADMIN') {
      redirect('/admin/dashboard');
    } else {
      redirect('/');
    }

  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    if (error.code?.startsWith('auth/')) {
        return { error: 'Invalid credentials. Please try again.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
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
    // Gunakan Admin SDK untuk membuat pengguna, ini sudah benar.
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });
    
    const isAdmin = email.toLowerCase() === 'admin@admin.com';
    const batch = adminDb.batch();

    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    const userData = {
      id: userRecord.uid,
      name: name,
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
    };
    batch.set(userDocRef, userData);

    if (isAdmin) {
      const adminRoleRef = adminDb.collection('roles_admin').doc(userRecord.uid);
      batch.set(adminRoleRef, { active: true });
    }
    
    await batch.commit();

    await setSession({
      uid: userRecord.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
    
    if (isAdmin) {
      redirect('/admin/dashboard');
    } else {
      redirect('/');
    }
    
  } catch (error: any) {
    console.error('Registration error:', error.code, error.message);
    if (error.code === 'auth/email-already-exists') {
      return { error: 'This email is already registered.' };
    }
    return { error: 'An error occurred during registration. Please try again.' };
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
    const newOrderRef = adminDb.collection("orders").doc();
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
        product: {
            name: item.product.name,
            imageUrl: item.product.imageUrl
        }
      })),
      total: totalAmount,
      status: 'Pending',
      orderDate: new Date(),
    };

    await newOrderRef.set(newOrderData);
    return { success: true, orderId: newOrderRef.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}

export async function upsertProduct(productData: Partial<Product>) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  try {
    if (productData.id) {
      const productRef = adminDb.collection('products').doc(productData.id);
      await productRef.update({ ...productData });
      return { success: true, id: productData.id };
    } else {
      const newProductRef = adminDb.collection('products').doc();
      const newProduct = {
        ...productData,
        id: newProductRef.id,
        createdAt: new Date(),
      };
      await newProductRef.set(newProduct);
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
    const clientApp = initializeClientSdk();
    const storage = getStorage(clientApp);

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
