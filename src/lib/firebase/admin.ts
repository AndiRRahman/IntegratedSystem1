// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: This file should only be used in server-side code (e.g., server actions).

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  // In a local development environment, the Admin SDK can auto-discover credentials
  // if you've run `firebase login`, or it can connect to the emulators.
  // For production (e.g., App Hosting), the service account key is needed.
  if (process.env.NODE_ENV === 'development') {
    // Point to the emulators. This reads from FIREBASE_AUTH_EMULATOR_HOST, etc.
    // which should be set by the emulator suite. For local `npm run dev`, we set it manually.
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  }

  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
    projectId: 'studio-2940845017-cd507',
    storageBucket: 'studio-2940845017-cd507.appspot.com'
  });

  console.log("🔥 Firebase Admin SDK initialized for server-side operations.");
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export { adminAuth, adminDb, admin };
