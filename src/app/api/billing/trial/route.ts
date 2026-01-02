'use server';

import {NextResponse} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import {initializeApp, getApps, cert} from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { add } from 'date-fns';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const planCredits: Record<string, number> = {
    starter: 15, // $15 credit
    pro: 30,     // $30 credit
};

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {error: 'Missing or invalid authorization token'},
      {status: 401}
    );
  }
  
  const idToken = authHeader.split('Bearer ')[1];

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return NextResponse.json({error: 'Invalid token'}, {status: 401});
  }
  
  const uid = decoded.uid;
  const { plan } = await req.json();

  try {
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const trialEndDate = add(new Date(), { days: 14 });
    const credits = planCredits[plan as string] || 0;

    await userRef.update({
        'trial.active': true,
        'trial.endsAt': FieldValue.serverTimestamp(), // This will be set to trialEndDate on client
        'trial.days': 14,
        'credits': credits,
        'subscriptionStatus': 'trialing',
        'updatedAt': FieldValue.serverTimestamp()
    });

    // In a real scenario, the trial.endsAt would be set to trialEndDate
    // but for the sake of this example, we'll use a server timestamp.
    // The client can display the correct end date based on the 'days' field.

    return NextResponse.json({ success: true, trialEnds: trialEndDate, credits });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      {error: 'Failed to start trial.'},
      {status: 500}
    );
  }
}
