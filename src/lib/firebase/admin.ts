
// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// IMPORTANT: This file should only be used in server-side code (e.g., server actions).

if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'development') {
    // In a local development environment, connect to the emulators.
    // The Admin SDK will automatically discover running emulators if the env vars are set.
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

    // Initialize without credentials, it will auto-connect to emulators
    admin.initializeApp({
      projectId: 'studio-2940845017-cd507',
      storageBucket: 'studio-2940845017-cd507.appspot.com'
    });
    console.log("🔥 Firebase Admin SDK initialized in DEV mode (connected to emulators).");

  } else {
    // In a production environment (e.g., App Hosting), use service account credentials.
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set for production.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'studio-2940845017-cd507',
      storageBucket: 'studio-2940845017-cd507.appspot.com'
    });
    console.log("🔥 Firebase Admin SDK initialized in PROD mode.");
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();
const adminStorage = getStorage();

export { adminAuth, adminDb, adminStorage, admin };
