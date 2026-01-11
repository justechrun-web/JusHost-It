"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportUsageToStripe = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
// Initialize Firebase Admin
admin.initializeApp();
// Define the Cloud Function with the secret manager integration
exports.reportUsageToStripe = (0, firestore_1.onDocumentCreated)({
    document: "sites/{siteId}/metrics/{metricId}",
    secrets: ["STRIPE_SECRET_KEY"],
}, async (event) => {
    var _a;
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY is not set. Function cannot proceed.");
        return;
    }
    // Initialize Stripe inside the function to use the provided secret
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-04-10',
    });
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
    const stripeCustomerId = (_a = siteDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeCustomerId;
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
    }
    catch (error) {
        console.error(`Error reporting usage to Stripe for site ${siteId}:`, error);
    }
});
//# sourceMappingURL=index.js.map