
'use server';

import 'server-only';
import { adminDb } from '@/lib/firebase/admin';

export async function resetDailyAutoTopUpIfNeeded(orgId: string) {
  const ref = adminDb.collection('orgs').doc(orgId);
  const snap = await ref.get();
  if (!snap.exists) return;

  const auto = snap.data()!.autoTopUp;
  if (!auto) return; // No auto-top-up config

  const now = new Date();
  // Initialize dayStart if it doesn't exist
  if (!auto.dayStart) {
      await ref.update({
        'autoTopUp.spentToday': 0,
        'autoTopUp.dayStart': now,
      });
      return;
  }

  const dayStart = auto.dayStart.toDate();

  // Check if the current date is different from the dayStart date (ignoring time)
  const isNewDay = now.toDateString() !== dayStart.toDateString();

  if (isNewDay) {
    await ref.update({
      'autoTopUp.spentToday': 0,
      'autoTopUp.dayStart': now,
    });
  }
}

    