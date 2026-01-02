import admin from "firebase-admin";

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be correctly formatted.
        // When using environment variables, newlines are often replaced with '\\n'.
        // We need to replace them back to actual newlines.
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
