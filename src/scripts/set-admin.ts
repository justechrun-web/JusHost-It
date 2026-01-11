'use server';
import 'server-only';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

/**
 * Sets the 'admin' custom claim to true for a specific user.
 * This is a one-time script to bootstrap the first admin user.
 * 
 * To run this:
 * 1. Make sure your .env.local file has the correct Firebase Admin credentials.
 * 2. Execute this script from your terminal (e.g., using ts-node or similar).
 *    Example: `npx ts-node src/scripts/set-admin.ts`
 * 
 * @param {string} email - The email of the user to promote.
 */
async function grantAdminRole(email: string) {
  if (!email) {
    console.error('Error: Please provide an email address as the first argument.');
    process.exit(1);
  }

  try {
    // Get the user by email
    const user = await adminAuth.getUserByEmail(email);

    // Set custom user claims
    // The security rules will now see request.auth.token.admin == true
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    // Also update the user's role in Firestore for client-side UI
    await adminDb.collection('users').doc(user.uid).update({ role: 'admin' });

    console.log(`✅ Success! User ${email} has been promoted to Admin.`);
    console.log('They can now access the /admin panel.');

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
        console.error(`Error: No user found with the email "${email}". Please make sure the user has already signed up.`);
    } else {
        console.error('Error granting admin role:', error);
    }
    process.exit(1);
  }
}

// --- Script Execution ---
// This allows the script to be run from the command line.
const emailToPromote = process.argv[2];
grantAdminRole(emailToPromote).then(() => {
    process.exit(0);
});
