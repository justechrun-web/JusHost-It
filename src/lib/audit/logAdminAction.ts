
'use server';

import 'server-only';
import { adminDb } from '@/lib/firebase/admin';

type AuditLogInput = {
    type: 'overage_approved' | 'overage_rejected' | 'cap_exceeded' | 'read_only_enabled' | 'read_only_disabled' | 'admin_plan_change';
    actorUid: string;
    actorRole: string;
    orgId: string;
    metadata: Record<string, any>;
};

export async function logAdminAction(log: AuditLogInput) {
  try {
    await adminDb.collection('auditLogs').add({
      ...log,
      createdAt: adminDb.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to write to audit log:', error);
  }
}

    