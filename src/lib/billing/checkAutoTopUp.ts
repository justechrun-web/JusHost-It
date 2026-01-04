
'use server'
import { adminDb } from '@/lib/firebase/admin'
import { stripe } from '@/lib/stripe/server'

const COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

export async function checkAutoTopUp(orgId: string) {
  const orgRef = adminDb.collection('orgs').doc(orgId)
  const orgSnap = await orgRef.get()
  if (!orgSnap.exists) return

  const org = orgSnap.data()!
  const auto = org.autoTopUp

  if (!auto?.enabled) return

  // Cooldown protection
  if (
    auto.lastTriggeredAt &&
    Date.now() - auto.lastTriggeredAt.toMillis() < COOLDOWN_MS
  ) {
    return
  }

  // Calculate balance
  const creditsSnap = await adminDb
    .collection('orgCredits')
    .where('orgId', '==', orgId)
    .where('remaining', '>', 0)
    .get()

  const balance = creditsSnap.docs.reduce(
    (sum, d) => sum + d.data().remaining,
    0
  )

  if (balance >= auto.threshold) return

  // Stripe customer validation
  const customer = await stripe.customers.retrieve(org.stripeCustomerId)
  if (
    !customer ||
    typeof customer === 'string' ||
    customer.deleted ||
    !customer.invoice_settings?.default_payment_method
  ) {
    await orgRef.update({
      'autoTopUp.enabled': false,
    })
    // Optionally, notify the user that their auto top-up was disabled.
    return
  }

  // Optimistic lock to prevent multiple triggers
  await orgRef.update({
    'autoTopUp.lastTriggeredAt':
      adminDb.FieldValue.serverTimestamp(),
  })
  
  // Create PaymentIntent (OFF-SESSION)
  try {
    await stripe.paymentIntents.create({
      amount: auto.amount,
      currency: 'usd',
      customer: org.stripeCustomerId,
      payment_method: customer.invoice_settings.default_payment_method as string,
      off_session: true,
      confirm: true,
      description: `Auto top-up credits for ${org.name}`,
      metadata: {
        orgId,
        type: 'auto_top_up',
      },
    })
  } catch (error) {
     console.error(`Auto top-up failed for org ${orgId}:`, error);
     // Revert the optimistic lock if the Stripe call fails immediately
     await orgRef.update({
        'autoTopUp.lastTriggeredAt': auto.lastTriggeredAt, // Revert to previous value
     });
     // The payment_intent.payment_failed webhook will handle disabling the feature
  }
}
