
'use server';

import 'server-only'
import { adminDb } from '@/lib/firebase/admin'

/**
 * Checks if a new day has started for a given document (org or department)
 * and resets daily spending counters if it has.
 *
 * @param ref - The Firestore document reference to check and update.
 * @param dayStartPath - The path within the document to the 'dayStart' timestamp field.
 * @param resetPaths - An array of field paths to reset to 0 if a new day has started.
 */
export async function resetIfNewDay(
  ref: FirebaseFirestore.DocumentReference,
  dayStartPath: string,
  resetPaths: string[]
) {
  const snap = await ref.get()
  if (!snap.exists) return

  const data = snap.data()!
  
  // Helper function to get nested property
  const getNested = (obj: any, path: string) => path.split('.').reduce((o, k) => (o || {})[k], obj);

  const lastStart = getNested(data, dayStartPath)?.toDate()
  
  // If there's no start date, initialize it and the counters.
  if (!lastStart) {
    const initialUpdates: any = { [dayStartPath]: new Date() };
    for (const path of resetPaths) {
        initialUpdates[path] = 0;
    }
    await ref.update(initialUpdates);
    return;
  }

  const now = new Date()
  const isNewDay = now.toDateString() !== lastStart.toDateString()

  if (isNewDay) {
    const updates: any = {
      [dayStartPath]: now,
    }
    for (const path of resetPaths) {
      updates[path] = 0
    }
    await ref.update(updates)
  }
}
