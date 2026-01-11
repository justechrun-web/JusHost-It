
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { requireUser } from '@/lib/auth/requireUser';
import { revalidatePath } from 'next/cache';

interface UserAdminActionInput {
    userId: string;
    action: 'promoteUser' | 'demoteUser';
}

/**
 * A secure server action to promote or demote a user to/from admin.
 * It first verifies that the calling user is themselves an admin.
 */
export async function userAdminAction({ userId, action }: UserAdminActionInput): Promise<{ success: boolean; error?: string; }> {
    try {
        // 1. Security Check: Verify the calling user is an admin.
        const { user: callingUser } = await requireUser();
        
        // Use the custom claim on the user object from requireUser which is populated from the token
        if (callingUser.role !== 'admin') {
             throw new Error('Permission denied. Only administrators can perform this action.');
        }

        if (!userId || !action) {
            throw new Error('Invalid arguments: User ID and action are required.');
        }
        
        const targetUser = await adminAuth.getUser(userId);
        const currentClaims = targetUser.customClaims || {};
        let newRole: 'admin' | 'user';
        let newClaims: any;

        // 2. Determine the new role and claims based on the action
        if (action === 'promoteUser') {
            newRole = 'admin';
            newClaims = { ...currentClaims, admin: true };
        } else { // demoteUser
            newRole = 'user';
            // Setting admin to false or removing it entirely
            newClaims = { ...currentClaims, admin: false };
        }

        // 3. Set the custom claim and update the user's role in Firestore
        await adminAuth.setCustomUserClaims(userId, newClaims);
        await adminDb.collection('users').doc(userId).update({ role: newRole });

        // 4. Revalidate paths to ensure the UI updates
        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        
        return { success: true };

    } catch (error: any) {
        console.error('Error updating user role:', error);
        // Return a structured error object for the client
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
