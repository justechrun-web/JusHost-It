
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

interface UserAdminActionInput {
    userId: string;
    action: 'promoteUser' | 'demoteUser';
}

export async function userAdminAction({ userId, action }: UserAdminActionInput) {
    try {
        const user = await adminAuth.getUser(userId);
        const currentClaims = user.customClaims || {};

        if (action === 'promoteUser') {
            await adminAuth.setCustomUserClaims(userId, { ...currentClaims, admin: true });
            await adminDb.collection('users').doc(userId).update({ role: 'admin' });
        } else {
            await adminAuth.setCustomUserClaims(userId, { ...currentClaims, admin: false });
            await adminDb.collection('users').doc(userId).update({ role: 'user' });
        }
        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
}
