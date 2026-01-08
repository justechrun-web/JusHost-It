import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin and Stripe
admin.initializeApp();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export const reportUsageToStripe = onDocumentCreated("sites/{siteId}/metrics/{metricId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const metricData = snapshot.data();
  const siteId = event.params.siteId;

  // Assume the customer's Stripe ID is stored on the parent site document.
  // In a real app, you'd fetch this securely.
  const siteRef = admin.firestore().collection('sites').doc(siteId);
  const siteDoc = await siteRef.get();
  const stripeCustomerId = siteDoc.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
      console.error(`No stripe_customer_id found for site ${siteId}`);
      return;
  }


  // Map your Firestore data to Stripe Meter Event names
  // Ensure 'event_name' matches the Meter ID you created in the Stripe Dashboard
  const stripeEvent = {
    event_name: "data_transfer_gb", // Example meter ID
    payload: {
      value: (metricData.bytesUsed / (1024 * 1024 * 1024)).toFixed(6), // Convert bytes to GB
      stripe_customer_id: stripeCustomerId,
    },
  };

  try {
    // Report the event to Stripe
    await stripe.billing.meterEvents.create(stripeEvent);
    console.log(`Successfully reported usage for site ${siteId}`);
  } catch (error) {
    console.error(`Error reporting usage to Stripe for site ${siteId}:`, error);
  }
});
