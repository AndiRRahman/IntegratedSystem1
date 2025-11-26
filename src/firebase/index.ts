'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  if (typeof window !== 'undefined' && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      
    try {
        console.log("⚠️ Mencoba menghubungkan ke Firebase Emulator Lokal...");
        
        // Connect Auth (Port 9099)
        connectAuthEmulator(auth, "http://localhost:9099");
        
        // Connect Firestore (Port 8080)
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        
        // Connect Storage (Port 9199)
        connectStorageEmulator(storage, "localhost", 9199);
        
        console.log("✅ Berhasil terhubung ke Emulator!");
    } catch (error: any) {
        // Error ini biasanya muncul jika 'getSdks' dipanggil 2x, emulator tidak boleh connect 2x
        if (!error.message.includes('already connected')) {
          console.error("Gagal terhubung ke Emulator:", error);
        } else {
          console.log("Info Emulator: Sudah terhubung sebelumnya.");
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
export *- from './errors';
export * from './error-emitter';

