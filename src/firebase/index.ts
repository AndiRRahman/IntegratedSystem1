
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// This is the CLIENT-SIDE Firebase initialization.
// It is separate from the server-side admin initialization.

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// This check is for client-side browser environment only.
// Emulators are only connected on the client for real-time updates and debugging.
if (typeof window !== 'undefined' && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  try {
    // We connect to the emulator only once.
    // The `connect...` functions will throw an error if they are called more than once, which we can safely ignore on hot-reloads.
    
    // @ts-ignore - Internal flag to check if already connected
    if (!auth.__emulator) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        // @ts-ignore
        auth.__emulator = true;
    }

    // @ts-ignore - Internal flag to check if already connected
    if (!firestore._settings.host) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
    }

    // @ts-ignore - Internal flag to check if already connected
    if (!storage.host.includes('localhost')) {
        connectStorageEmulator(storage, "localhost", 9199);
    }
  } catch (error: any) {
      if (!error.message.includes('already connected')) {
        // Log error only if it's not the "already connected" message which is expected during development
        console.error("Client: Failed to connect to Emulators:", error);
      }
  }
}

// Export the initialized client-side services.
export { firebaseApp, auth, firestore, storage };


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
