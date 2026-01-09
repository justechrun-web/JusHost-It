
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import { firebaseConfig, isFirebaseConfigured } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    if (!isFirebaseConfigured()) {
        console.error("Firebase config is missing one or more required values. Please check your .env.local file.");
        return { app: null, auth: null, firestore: null, functions: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const functions = getFunctions(app);

    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
        console.log("Connecting to Firebase Emulators");
        connectAuthEmulator(auth, "http://localhost:5001");
        connectFirestoreEmulator(firestore, "localhost", 8080);
        connectFunctionsEmulator(functions, "localhost", 5001);
    }
    
    return { app, auth, firestore, functions };
  }, []);

  if (!firebaseServices.app) {
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
