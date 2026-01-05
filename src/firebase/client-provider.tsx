'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures that Firebase is initialized only once on the client
  // and that the services are memoized.
  const firebaseServices = useMemo(() => {
    if (getApps().length) {
      const app = getApp();
      return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        functions: getFunctions(app),
      };
    }
    
    const app = initializeApp(firebaseConfig);
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      functions: getFunctions(app),
    };
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.app}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      functions={firebaseServices.functions}
    >
      {children}
    </FirebaseProvider>
  );
}
