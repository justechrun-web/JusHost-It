'use server';

import 'server-only';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Recommended for production environments like Firebase App Hosting
    // It will automatically use the service account associated with the environment.
    try {
        return initializeApp();
    } catch (e: any) {
         console.warn(
            'Failed to initialize with default credentials, falling back to service account JSON.', e
        );
        // Fallback for local development or environments where the JSON key is explicitly set.
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            throw new Error(
                'FIREBASE_SERVICE_ACCOUNT_JSON is not set and default credentials failed. Set the env var for local development.'
            );
        }
        try {
            const serviceAccount = JSON.parse(serviceAccountJson);
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (parseError: any) {
            throw new Error(
                `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON or initialize app with certificate: ${parseError.message}`
            );
        }
    }
}

const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export { FieldValue };
