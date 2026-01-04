
'use server'
import { adminDb } from '@/lib/firebase/admin'

/**
 * Consumes a specified cost from an organization's available prepaid credits.
 * It follows a FIFO (First-In, First-Out) strategy, consuming the oldest credits first.
 *
 * @param orgId - The ID of the organization whose credits are to be consumed.
 * @param costInCents - The total cost to be deducted, in cents.
 * @returns {Promise<number>} - A promise that resolves to the remaining cost in cents
 * that could not be covered by the available credits. A value of 0 means the
 * entire cost was covered.
 */
export async function consumeCredits(
  orgId: string,
  costInCents: number
): Promise<number> {
  // Query for credit documents that have a remaining balance, ordered by creation date.
  const creditsSnap = await adminDb
    .collection('orgCredits')
    .where('orgId', '==', orgId)
    .where('remaining', '>', 0)
    .orderBy('createdAt', 'asc')
    .get()

  let remainingCost = costInCents

  // Iterate through the credit documents and consume them.
  for (const doc of creditsSnap.docs) {
    if (remainingCost <= 0) break

    const credit = doc.data()
    const usableAmount = Math.min(credit.remaining, remainingCost)

    // Atomically decrement the 'remaining' balance of the credit document.
    await doc.ref.update({
      remaining: adminDb.FieldValue.increment(-usableAmount),
    })

    remainingCost -= usableAmount
  }

  // Return any cost that was not covered by the credits.
  return remainingCost
}
