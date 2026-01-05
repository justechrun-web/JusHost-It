'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore }mport { getFunctions, Functions } from 'firebase/functions';

// This function ensures Firebase is initialized only once on the client.
function getFirebaseClient(): { app: FirebaseApp; auth: Auth; firestore: Firestore; functions: Functions } {
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
}

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { app, auth, firestore, functions } = getFirebaseClient();

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={firestore}
      functions={functions}
    >
      {children}
    </FirebaseProvider>
  );
}
