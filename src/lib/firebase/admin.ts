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

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        console.warn(
            'FIREBASE_SERVICE_ACCOUNT_JSON not set. Attempting to use Application Default Credentials. This is expected in a deployed environment.'
        );
        try {
            return initializeApp();
        } catch (e: any) {
            throw new Error(`Failed to initialize Firebase with Application Default Credentials: ${e.message}`);
        }
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e: any) {
        throw new Error(
            `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON or initialize app with certificate: ${e.message}. Ensure it's a valid JSON string.`
        );
    }
}

const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export { FieldValue };
