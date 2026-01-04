
import "server-only";
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

let app: App;

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        const missingVars = Object.entries(serviceAccount)
            .filter(([, value]) => !value)
            .map(([key]) => `FIREBASE_${key.toUpperCase()}`)
            .join(', ');
        // Throw a clear error if config is missing. This prevents the app from running in a broken state.
        throw new Error(`Firebase Admin SDK initialization failed. Missing required environment variables: ${missingVars}`);
    }
    
    app = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export { FieldValue };
