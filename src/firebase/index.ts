
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  // This check is for client-side browser environment only.
  // Emulators are only connected on the client for real-time updates and debugging.
  // Server-side actions in `lib/actions.ts` have their own emulator connection logic.
  if (typeof window !== 'undefined' && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      
    try {
        // We connect to the emulator only once.
        // The `connect...` functions will throw an error if they are called more than once.
        // We can safely ignore that error.
        
        console.log("⚠️ Client: Attempting to connect to Firebase Emulators...");
        
        // @ts-ignore
        if (!auth.__emulator) {
            connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
            // @ts-ignore
            auth.__emulator = true;
        }

        // @ts-ignore
        if (!firestore._settings.host) {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        }

        // @ts-ignore
        if (!storage.host.includes('localhost')) {
            connectStorageEmulator(storage, "localhost", 9199);
        }
        
        console.log("✅ Client: Successfully connected to Emulators!");
    } catch (error: any) {
        if (!error.message.includes('already connected')) {
          console.error("Client: Failed to connect to Emulators:", error);
        } else {
          // This is expected on fast-refresh, not a problem.
          console.log("ℹ️ Client: Emulators already connected.");
        }
    }
  }

  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
