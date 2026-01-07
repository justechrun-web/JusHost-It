
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { firebaseConfig } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Ensure all config values are present before initializing
    if (!Object.values(firebaseConfig).every(Boolean)) {
        console.error("Firebase config is missing one or more required values.");
        // Return null services if config is incomplete
        return { app: null, auth: null, firestore: null, functions: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
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
