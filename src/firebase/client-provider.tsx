'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    const clientFirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    
    // Ensure all config values are present before initializing
    if (!Object.values(clientFirebaseConfig).every(Boolean)) {
        console.error("Firebase config is missing one or more required values.");
        // Return null services if config is incomplete
        return { app: null, auth: null, firestore: null, functions: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(clientFirebaseConfig);
    
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      functions: getFunctions(app),
    };
  }, []);

  // Do not render the provider if services couldn't be initialized
  if (!firebaseServices.app) {
    // You might want to render a loading indicator or an error message here
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.app}
      auth={firebaseServices.auth!}
      firestore={firebaseServices.firestore!}
      functions={firebaseServices.functions!}
    >
      {children}
    </FirebaseProvider>
  );
}
