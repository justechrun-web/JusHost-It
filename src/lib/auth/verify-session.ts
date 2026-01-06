
'use server';

import 'server-only';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Verifies a Firebase session cookie.
 * @param session - The session cookie string.
 * @returns A promise that resolves to the decoded token.
 */
export async function verifySessionCookie(session: string) {
  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}
