'use server';

import 'server-only';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function getAdminApp(): App {
    // If the app is already initialized, return it.
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Try to initialize using default credentials, which is the recommended
    // approach for production environments like Firebase App Hosting.
    try {
        return initializeApp();
    } catch (e: any) {
        console.warn(
            'Failed to initialize with default credentials, falling back to service account JSON.', e
        );
        
        // Fallback for local development where a service account JSON is provided.
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            throw new Error(
                'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set, and default credential initialization failed. This is required for local development.'
            );
        }
        
        try {
            const serviceAccount = JSON.parse(serviceAccountJson);
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (parseError: any) {
            throw new Error(
                `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON or initialize app: ${parseError.message}`
            );
        }
    }
}

const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export { FieldValue };
